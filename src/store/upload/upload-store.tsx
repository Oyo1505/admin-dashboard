import {
  GoogleDriveUploadResult,
  UploadState,
  UploadStatus,
} from '@/models/upload/upload';
import { create } from 'zustand';

/**
 * Generate unique upload ID
 */
const generateUploadId = (): string => {
  return `upload_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

/**
 * Upload Store Interface
 * Global state management for file uploads
 * Uses Record instead of Map for SSR compatibility with Zustand
 */
interface UploadStore {
  uploads: Record<string, UploadState>;

  // Actions
  addUpload: (file: File) => string;
  updateProgress: (id: string, progress: number) => void;
  setStatus: (id: string, status: UploadStatus, error?: string) => void;
  completeUpload: (id: string, result: GoogleDriveUploadResult) => void;
  removeUpload: (id: string) => void;
  clearCompleted: () => void;

  // Computed
  getActiveUploads: () => UploadState[];
  hasActiveUploads: () => boolean;
}

/**
 * Upload Store
 * Zustand store for tracking file upload progress globally
 */
const useUploadStore = create<UploadStore>((set, get) => ({
  uploads: {},

  /**
   * Add a new upload to the store
   * @param file - File to upload
   * @returns Generated upload ID
   */
  addUpload: (file: File): string => {
    const id = generateUploadId();
    const newUpload: UploadState = {
      id,
      fileName: file.name,
      fileSize: file.size,
      progress: 0,
      status: 'pending',
      startedAt: new Date(),
    };

    set((state) => ({
      uploads: { ...state.uploads, [id]: newUpload },
    }));

    return id;
  },

  /**
   * Update upload progress
   * @param id - Upload ID
   * @param progress - Progress percentage (0-100)
   */
  updateProgress: (id: string, progress: number): void => {
    set((state) => {
      const upload = state.uploads[id];
      if (!upload) return state;

      return {
        uploads: {
          ...state.uploads,
          [id]: {
            ...upload,
            progress: Math.min(100, Math.max(0, progress)),
            status: 'uploading' as const,
          },
        },
      };
    });
  },

  /**
   * Set upload status
   * @param id - Upload ID
   * @param status - New status
   * @param error - Optional error message
   */
  setStatus: (id: string, status: UploadStatus, error?: string): void => {
    set((state) => {
      const upload = state.uploads[id];
      if (!upload) return state;

      return {
        uploads: {
          ...state.uploads,
          [id]: {
            ...upload,
            status,
            error,
            completedAt:
              status === 'completed' || status === 'failed'
                ? new Date()
                : undefined,
          },
        },
      };
    });
  },

  /**
   * Mark upload as completed with result
   * @param id - Upload ID
   * @param result - Google Drive upload result
   */
  completeUpload: (id: string, result: GoogleDriveUploadResult): void => {
    set((state) => {
      const upload = state.uploads[id];
      if (!upload) return state;

      return {
        uploads: {
          ...state.uploads,
          [id]: {
            ...upload,
            progress: 100,
            status: 'completed' as const,
            result,
            completedAt: new Date(),
          },
        },
      };
    });
  },

  /**
   * Remove an upload from the store
   * @param id - Upload ID to remove
   */
  removeUpload: (id: string): void => {
    set((state) => {
      const { [id]: _, ...rest } = state.uploads;
      return { uploads: rest };
    });
  },

  /**
   * Clear all completed and failed uploads
   */
  clearCompleted: (): void => {
    set((state) => {
      const filtered: Record<string, UploadState> = {};
      for (const [id, upload] of Object.entries(state.uploads)) {
        if (upload.status !== 'completed' && upload.status !== 'failed') {
          filtered[id] = upload;
        }
      }
      return { uploads: filtered };
    });
  },

  /**
   * Get all active uploads (pending or uploading)
   * @returns Array of active upload states
   */
  getActiveUploads: (): UploadState[] => {
    return Object.values(get().uploads).filter(
      (u) => u.status === 'pending' || u.status === 'uploading'
    );
  },

  /**
   * Check if there are any active uploads
   * @returns True if uploads are in progress
   */
  hasActiveUploads: (): boolean => {
    return get().getActiveUploads().length > 0;
  },
}));

export { useUploadStore };
