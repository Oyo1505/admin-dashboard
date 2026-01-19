'use client';

import { UploadState } from '@/models/upload/upload';
import { useUploadStore } from '@/store/upload/upload-store';
import { CheckCircle, AlertCircle, Upload, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface UploadProgressToastProps {
  upload: UploadState;
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Upload Progress Toast Component
 * Displays individual upload progress with status icon, progress bar, and dismiss button
 *
 * Accessibility:
 * - role="status" for screen readers
 * - aria-label describes current state
 * - aria-valuenow/min/max for progress bar
 */
export const UploadProgressToast = ({ upload }: UploadProgressToastProps) => {
  const t = useTranslations('Upload');
  const removeUpload = useUploadStore((state) => state.removeUpload);

  /**
   * Get status icon based on upload state
   */
  const getStatusIcon = () => {
    switch (upload.status) {
      case 'completed':
        return (
          <CheckCircle
            className="h-5 w-5 text-green-500"
            aria-hidden="true"
          />
        );
      case 'failed':
        return (
          <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
        );
      default:
        return (
          <Upload
            className="h-5 w-5 text-blue-500 animate-pulse"
            aria-hidden="true"
          />
        );
    }
  };

  /**
   * Get status text for display
   */
  const getStatusText = (): string => {
    switch (upload.status) {
      case 'pending':
        return t('statusPending');
      case 'uploading':
        return `${upload.progress}%`;
      case 'completed':
        return t('statusCompleted');
      case 'failed':
        return upload.error || t('statusFailed');
      case 'cancelled':
        return t('statusCancelled');
      default:
        return '';
    }
  };

  const canDismiss = upload.status === 'completed' || upload.status === 'failed';
  const showProgressBar =
    upload.status === 'pending' || upload.status === 'uploading';

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[300px] max-w-[400px]"
      role="status"
      aria-label={`${upload.fileName}: ${getStatusText()}`}
    >
      <div className="flex items-start gap-3">
        {getStatusIcon()}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {upload.fileName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(upload.fileSize)} - {getStatusText()}
          </p>

          {showProgressBar && (
            <div className="mt-2">
              <div
                className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={upload.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t('uploadProgress')}
              >
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {canDismiss && (
          <button
            onClick={() => removeUpload(upload.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label={t('dismissUpload')}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
