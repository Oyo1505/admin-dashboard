/**
 * Upload Configuration Constants
 * Centralized configuration for file uploads
 */
export const UPLOAD_CONFIG = {
  /** Maximum file size in megabytes */
  MAX_FILE_SIZE_MB: 10000,

  /** Allowed MIME types for upload */
  ALLOWED_MIME_TYPES: ['video/mp4'] as const,

  /** Chunk size for resumable uploads (50 MB - optimized for very large files) */
  CHUNK_SIZE: 50 * 1024 * 1024,

  /** Threshold for using chunked upload instead of simple upload (50 MB) */
  CHUNKED_UPLOAD_THRESHOLD: 50 * 1024 * 1024,

  /** Number of retry attempts on failure */
  RETRY_ATTEMPTS: 3,

  /** Delay between retries in milliseconds */
  RETRY_DELAY_MS: 1000,

  /** API endpoint for Google Drive uploads */
  API_ENDPOINT: '/api/upload/google-drive',
} as const;

/**
 * Upload Message Keys
 * Keys for internationalized upload messages
 */
export const UPLOAD_MESSAGE_KEYS = {
  STARTED: 'statusPending',
  IN_PROGRESS: 'statusUploading',
  COMPLETED: 'uploadSuccess',
  FAILED: 'uploadError',
  CANCELLED: 'statusCancelled',
  FILE_TOO_LARGE: 'fileTooLarge',
  INVALID_FILE_TYPE: 'invalidFileType',
} as const;

/**
 * Upload visibility duration in milliseconds
 * How long completed/failed uploads remain visible
 */
export const UPLOAD_VISIBILITY = {
  /** Duration to show completed uploads (5 seconds) */
  COMPLETED_DURATION_MS: 5000,

  /** Duration to show failed uploads (10 seconds) */
  FAILED_DURATION_MS: 10000,
} as const;
