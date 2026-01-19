/**
 * Upload Status Types
 * Represents the different states of a file upload
 */
export type UploadStatus =
  | 'pending'
  | 'uploading'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Google Drive Upload Result
 * Returned from successful Google Drive API upload
 */
export interface GoogleDriveUploadResult {
  fileId: string;
  webViewLink?: string;
  webContentLink?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  name?: string;
}

/**
 * Upload State
 * Represents the complete state of a single upload operation
 */
export interface UploadState {
  id: string;
  fileName: string;
  fileSize: number;
  progress: number; // 0-100
  status: UploadStatus;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  result?: GoogleDriveUploadResult;
}

/**
 * Upload Progress
 * Real-time progress data from XHR upload event
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload Response
 * API response structure for upload endpoint
 */
export interface UploadResponse {
  data?: GoogleDriveUploadResult;
  error?: string;
}
