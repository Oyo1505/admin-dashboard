import {
  GoogleDriveUploadResult,
  UploadResponse,
} from '@/models/upload/upload';
import { UPLOAD_CONFIG } from '@/shared/constants/upload';
import { useUploadStore } from '@/store/upload/upload-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

/**
 * Cross-browser compatible slice method for File/Blob objects
 * Handles vendor-prefixed versions for older browsers
 */
const sliceFile = (file: File | Blob, start: number, end: number): Blob => {
  // Standard slice method
  if (typeof file.slice === 'function') {
    return file.slice(start, end);
  }

  // Vendor-prefixed fallbacks for older browsers
  const blobWithVendor = file as Blob & {
    webkitSlice?: (start: number, end: number) => Blob;
    mozSlice?: (start: number, end: number) => Blob;
  };

  if (typeof blobWithVendor.webkitSlice === 'function') {
    return blobWithVendor.webkitSlice(start, end);
  }

  if (typeof blobWithVendor.mozSlice === 'function') {
    return blobWithVendor.mozSlice(start, end);
  }

  throw new Error('Browser does not support file slicing');
};

/**
 * Validate that the input is a proper File-like object with required methods
 * Uses duck typing to support objects from different contexts
 */
const validateFile = (file: unknown): file is File => {
  if (!file) {
    throw new Error('No file provided');
  }

  const fileObj = file as File;

  // Check for required properties and methods
  const hasSize = typeof fileObj.size === 'number';
  const hasSlice = typeof fileObj.slice === 'function';

  if (!hasSize || !hasSlice) {
    throw new Error('Invalid file: expected File or Blob object with slice method');
  }

  if (fileObj.size <= 0) {
    throw new Error('Invalid file: file is empty');
  }

  return true;
};

/**
 * Upload file using XHR for progress tracking
 * For small files, uploads in a single request
 *
 * @param file - File to upload
 * @param onProgress - Callback for progress updates (0-100)
 * @returns Promise resolving to upload response
 */
const uploadWithProgress = (
  file: File,
  onProgress: (percentage: number) => void
): Promise<UploadResponse> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    // Append the file directly - it's already a File object
    formData.append('file', file);

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        onProgress(percentage);
      }
    });

    // Handle successful response
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText) as UploadResponse;
          resolve(response);
        } catch {
          reject(new Error('Invalid response format from server'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText) as UploadResponse;
          reject(new Error(errorResponse.error || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    // Handle network errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    // Handle upload abort
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was cancelled'));
    });

    // Send request
    xhr.open('POST', UPLOAD_CONFIG.API_ENDPOINT);
    xhr.send(formData);
  });
};

/**
 * Upload a single chunk directly to Google Drive using XHR for progress tracking
 *
 * @param resumableUri - Google Drive resumable upload URI
 * @param chunk - Chunk data to upload
 * @param start - Start byte position
 * @param end - End byte position (exclusive)
 * @param totalSize - Total file size
 * @param onChunkProgress - Progress callback for this chunk
 * @returns Promise resolving to response status and optional file data
 */
const uploadChunkToGoogleDrive = (
  resumableUri: string,
  chunk: Blob,
  start: number,
  end: number,
  totalSize: number,
  onChunkProgress?: (loaded: number) => void
): Promise<{ status: number; data?: GoogleDriveUploadResult }> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track chunk upload progress
    if (onChunkProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          onChunkProgress(event.loaded);
        }
      });
    }

    xhr.addEventListener('load', () => {
      // 308 Resume Incomplete - chunk received, continue with next
      // 200/201 - upload complete
      if (xhr.status === 308 || xhr.status === 200 || xhr.status === 201) {
        let data: GoogleDriveUploadResult | undefined;

        // Parse response for completed upload
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const googleResponse = JSON.parse(xhr.responseText);
            data = {
              fileId: googleResponse.id,
              fileName: googleResponse.name,
              mimeType: googleResponse.mimeType,
              size: parseInt(googleResponse.size, 10),
              webViewLink: googleResponse.webViewLink,
              webContentLink: googleResponse.webContentLink,
            };
          } catch {
            // Response parsing failed but upload succeeded
          }
        }

        resolve({ status: xhr.status, data });
      } else {
        // Try to parse error message from Google Drive
        let errorMessage = `Chunk upload failed with status ${xhr.status}`;
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          if (errorResponse.error?.message) {
            errorMessage = errorResponse.error.message;
          }
        } catch {
          // Use default error message
        }
        reject(new Error(errorMessage));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during chunk upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Chunk upload was cancelled'));
    });

    // Send directly to Google Drive
    xhr.open('PUT', resumableUri);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.setRequestHeader(
      'Content-Range',
      `bytes ${start}-${end - 1}/${totalSize}`
    );
    xhr.send(chunk);
  });
};

/**
 * Upload large file in chunks directly to Google Drive
 * Bypasses Next.js API route body size limits by uploading directly
 * Uses resumable upload protocol for reliability
 *
 * @param file - File to upload
 * @param onProgress - Callback for progress updates (0-100)
 * @returns Promise resolving to upload response
 */
const uploadInChunks = async (
  file: File,
  onProgress: (percentage: number) => void
): Promise<UploadResponse> => {
  const chunkSize = UPLOAD_CONFIG.CHUNK_SIZE;
  const totalChunks = Math.ceil(file.size / chunkSize);
  let uploadedBytes = 0;

  // Step 1: Initialize resumable upload session via our API
  const initResponse = await fetch(`${UPLOAD_CONFIG.API_ENDPOINT}/init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'video/mp4',
    }),
  });

  if (!initResponse.ok) {
    const errorData = await initResponse.json();
    throw new Error(errorData.error || 'Failed to initialize upload');
  }

  const { resumableUri } = await initResponse.json();

  if (!resumableUri) {
    throw new Error('No resumable URI received from server');
  }

  // Step 2: Upload chunks directly to Google Drive (bypasses 10MB API limit)
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = sliceFile(file, start, end);

    // Upload chunk with retry logic
    let retries = UPLOAD_CONFIG.RETRY_ATTEMPTS;
    let chunkUploaded = false;

    while (retries > 0 && !chunkUploaded) {
      try {
        const result = await uploadChunkToGoogleDrive(
          resumableUri,
          chunk,
          start,
          end,
          file.size,
          (loaded) => {
            // Calculate overall progress including current chunk progress
            const currentChunkProgress = uploadedBytes + loaded;
            const percentage = Math.round(
              (currentChunkProgress / file.size) * 100
            );
            onProgress(Math.min(percentage, 99)); // Cap at 99 until complete
          }
        );

        // If upload is complete (200/201), return the result
        if (result.status === 200 || result.status === 201) {
          onProgress(100);
          return {
            data: result.data,
          };
        }

        // 308 means chunk received, continue
        chunkUploaded = true;
        uploadedBytes = end;

        // Update progress after chunk completion
        const percentage = Math.round((uploadedBytes / file.size) * 100);
        onProgress(Math.min(percentage, 99));
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw error;
        }
        // Wait before retry with exponential backoff
        const delay =
          UPLOAD_CONFIG.RETRY_DELAY_MS *
          Math.pow(2, UPLOAD_CONFIG.RETRY_ATTEMPTS - retries);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error('Upload completed but no response received');
};

/**
 * Hook options interface
 */
interface UseUploadToGoogleDriveOptions {
  onSuccess?: (result: GoogleDriveUploadResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Upload mutation result interface
 */
interface UploadMutationResult {
  uploadId: string;
  result: GoogleDriveUploadResult;
}

/**
 * Hook for uploading files to Google Drive with progress tracking
 *
 * Uses:
 * - XHR for real upload progress events (small files)
 * - Chunked upload for large files (>10MB)
 * - Zustand store for global state management
 * - TanStack Query for mutation handling
 * - Toast notifications for user feedback
 *
 * @param options - Optional callbacks for success/error handling
 * @returns Upload mutation functions and state
 */
export const useUploadToGoogleDrive = (
  options?: UseUploadToGoogleDriveOptions
) => {
  const t = useTranslations('Upload');
  const queryClient = useQueryClient();
  const { addUpload, updateProgress, completeUpload, setStatus } =
    useUploadStore();

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadMutationResult> => {
      // Validate file before processing
      validateFile(file);

      // Add upload to store and get tracking ID
      const uploadId = addUpload(file);

      try {
        let result: UploadResponse;

        // Choose upload method based on file size
        if (file.size > UPLOAD_CONFIG.CHUNKED_UPLOAD_THRESHOLD) {
          // Large file: use chunked upload
          result = await uploadInChunks(file, (progress) => {
            updateProgress(uploadId, progress);
          });
        } else {
          // Small file: use single request upload
          result = await uploadWithProgress(file, (progress) => {
            updateProgress(uploadId, progress);
          });
        }

        // Handle API error response
        if (result.error) {
          throw new Error(result.error);
        }

        // Validate result data
        if (!result.data) {
          throw new Error('No data returned from upload');
        }

        // Mark upload as completed in store
        completeUpload(uploadId, result.data);

        return { uploadId, result: result.data };
      } catch (error) {
        // Mark upload as failed in store
        setStatus(
          uploadId,
          'failed',
          error instanceof Error ? error.message : 'Unknown error'
        );
        throw error;
      }
    },

    onSuccess: ({ result }) => {
      // Show success notification
      toast.success(t('uploadSuccess'), { position: 'top-center' });

      // Invalidate Google Drive movies list to refresh data
      queryClient.invalidateQueries({ queryKey: ['google-drive-movies'] });

      // Call optional success callback
      options?.onSuccess?.(result);
    },

    onError: (error: Error) => {
      // Show error notification
      toast.error(error.message || t('uploadError'), {
        position: 'top-center',
      });

      // Call optional error callback
      options?.onError?.(error);
    },
  });

  return {
    /** Trigger upload (fire-and-forget) */
    upload: uploadMutation.mutate,

    /** Trigger upload and await result */
    uploadAsync: uploadMutation.mutateAsync,

    /** Whether an upload is currently in progress */
    isUploading: uploadMutation.isPending,

    /** Last upload error */
    error: uploadMutation.error,

    /** Reset mutation state */
    reset: uploadMutation.reset,
  };
};
