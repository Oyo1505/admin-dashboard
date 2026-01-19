import { logError } from '@/lib/errors';
import { auth } from '@/lib/google-api';
import { GoogleDriveUploadResult } from '@/models/upload/upload';
import HttpStatus from '@/shared/constants/httpStatus';
import { URL_DASHBOARD_ROUTE } from '@/shared/route';
import { google } from 'googleapis';
import { revalidatePath } from 'next/cache';
import { Readable } from 'stream';

/**
 * Upload Result Interface
 * Standard response format for upload operations
 */
interface UploadResult {
  status: number;
  message?: string;
  data?: GoogleDriveUploadResult;
}

/**
 * Resumable Upload Session Interface
 */
interface ResumableUploadSession {
  uploadId: string;
  resumableUri: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

/**
 * In-memory store for active upload sessions
 * In production, consider using Redis or similar for persistence
 */
const activeUploadSessions = new Map<string, ResumableUploadSession>();

/**
 * Google Drive Upload Service
 * Handles file uploads to Google Drive with support for both
 * simple and resumable (chunked) uploads
 */
export class GoogleDriveUploadService {
  /**
   * Upload a file to Google Drive (simple upload for small files)
   * @param file - File to upload
   * @returns Upload result with status and data
   */
  static async uploadFile(file: File): Promise<UploadResult> {
    try {
      const drive = google.drive({ version: 'v3', auth });

      // Validate file
      if (!file || file.size < 1) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid file: file is empty or missing',
        };
      }

      // Validate file name
      if (!file.name?.trim()) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid file: file name is required',
        };
      }

      // Convert File to Buffer and create stream
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const bufferStream = Readable.from(buffer);

      // Prepare file metadata
      const fileMetadata = {
        name: file.name,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
      };

      // Prepare media object
      const media = {
        mimeType: file.type || 'application/octet-stream',
        body: bufferStream,
      };

      // Upload to Google Drive
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, webViewLink, webContentLink, name',
      });

      // Validate response
      if (!response.data?.id) {
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to upload file to Google Drive: no file ID returned',
        };
      }

      // Revalidate cache for movie dashboard
      revalidatePath(URL_DASHBOARD_ROUTE.movie);

      return {
        status: HttpStatus.OK,
        data: {
          fileId: response.data.id,
          webViewLink: response.data.webViewLink ?? undefined,
          webContentLink: response.data.webContentLink ?? undefined,
          name: response.data.name ?? file.name,
        },
      };
    } catch (error) {
      logError(error, 'GoogleDriveUploadService.uploadFile');

      // Return user-friendly error
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to upload file to Google Drive',
      };
    }
  }

  /**
   * Initialize a resumable upload session for large files
   * Includes Origin header to enable CORS for direct browser uploads
   *
   * @param fileName - Name of the file
   * @param fileSize - Total file size in bytes
   * @param mimeType - MIME type of the file
   * @param origin - Optional origin header for CORS (defaults to BETTER_AUTH_URL)
   * @returns Session details including uploadId and resumableUri
   */
  static async initResumableUpload(
    fileName: string,
    fileSize: number,
    mimeType: string,
    origin?: string
  ): Promise<{
    status: number;
    message?: string;
    data?: { uploadId: string; resumableUri: string };
  }> {
    try {
      // Validate inputs
      if (!fileName?.trim()) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'File name is required',
        };
      }

      if (fileSize < 1) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'File size must be greater than 0',
        };
      }

      // Get access token
      const accessToken = await auth.getAccessToken();
      if (!accessToken) {
        return {
          status: HttpStatus.UNAUTHORIZED,
          message: 'Failed to get access token',
        };
      }

      // File metadata
      const metadata = {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      };

      // Use provided origin or fall back to BETTER_AUTH_URL for CORS
      const corsOrigin =
        origin || process.env.BETTER_AUTH_URL || 'http://localhost:3000';

      // Initialize resumable upload with Origin header for CORS
      // This enables direct browser uploads to the returned resumableUri
      const initResponse = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Upload-Content-Type': mimeType,
            'X-Upload-Content-Length': String(fileSize),
            Origin: corsOrigin,
          },
          body: JSON.stringify(metadata),
        }
      );

      if (!initResponse.ok) {
        const errorText = await initResponse.text();
        logError(
          new Error(errorText),
          'GoogleDriveUploadService.initResumableUpload'
        );
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to initialize resumable upload',
        };
      }

      // Get the resumable upload URI from the Location header
      const resumableUri = initResponse.headers.get('Location');
      if (!resumableUri) {
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'No resumable URI returned from Google Drive',
        };
      }

      // Generate upload ID and store session
      const uploadId = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      activeUploadSessions.set(uploadId, {
        uploadId,
        resumableUri,
        fileName,
        fileSize,
        mimeType,
      });

      // Clean up session after 7 days (supports very long uploads for large files)
      setTimeout(
        () => {
          activeUploadSessions.delete(uploadId);
        },
        7 * 24 * 60 * 60 * 1000
      );

      return {
        status: HttpStatus.OK,
        data: { uploadId, resumableUri },
      };
    } catch (error) {
      logError(error, 'GoogleDriveUploadService.initResumableUpload');
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to initialize resumable upload',
      };
    }
  }

  /**
   * Upload a chunk to an existing resumable upload session
   * @param uploadId - The upload session ID
   * @param resumableUri - The resumable URI from Google Drive
   * @param chunk - The chunk data as Buffer
   * @param chunkStart - Start byte position
   * @param chunkEnd - End byte position
   * @param totalSize - Total file size
   * @returns Upload result (partial or complete)
   */
  static async uploadChunk(
    _uploadId: string,
    resumableUri: string,
    chunk: Buffer,
    chunkStart: number,
    chunkEnd: number,
    totalSize: number
  ): Promise<UploadResult> {
    try {
      // Validate resumable URI exists
      if (!resumableUri) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Resumable URI is required',
        };
      }

      // Upload chunk directly to Google Drive using the resumable URI
      // No session lookup needed - the resumable URI is the authentication
      const chunkResponse = await fetch(resumableUri, {
        method: 'PUT',
        headers: {
          'Content-Length': String(chunk.length),
          'Content-Range': `bytes ${chunkStart}-${chunkEnd}/${totalSize}`,
        },
        body: chunk,
      });

      // For incomplete uploads, Google returns 308 Resume Incomplete
      if (chunkResponse.status === 308) {
        return {
          status: HttpStatus.OK,
          message: 'Chunk uploaded successfully',
        };
      }

      // For complete uploads, Google returns 200 or 201
      if (chunkResponse.status === 200 || chunkResponse.status === 201) {
        const responseData = await chunkResponse.json();

        // Revalidate cache for movie dashboard
        revalidatePath(URL_DASHBOARD_ROUTE.movie);

        return {
          status: HttpStatus.OK,
          data: {
            fileId: responseData.id,
            webViewLink: responseData.webViewLink ?? undefined,
            webContentLink: responseData.webContentLink ?? undefined,
            name: responseData.name ?? 'Uploaded file',
          },
        };
      }

      // Handle errors
      const errorText = await chunkResponse.text();
      logError(new Error(errorText), 'GoogleDriveUploadService.uploadChunk');

      return {
        status: chunkResponse.status,
        message: `Chunk upload failed: ${errorText}`,
      };
    } catch (error) {
      logError(error, 'GoogleDriveUploadService.uploadChunk');
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to upload chunk',
      };
    }
  }

  /**
   * Get upload session status
   * @param uploadId - The upload session ID
   */
  static getSession(uploadId: string): ResumableUploadSession | undefined {
    return activeUploadSessions.get(uploadId);
  }
}
