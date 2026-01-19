'use client';

import useTime from '@/hooks/use-time';
import { UPLOAD_VISIBILITY } from '@/shared/constants/upload';
import { useUploadStore } from '@/store/upload/upload-store';
import { useMemo } from 'react';
import { UploadProgressToast } from './upload-progress-toast';

/**
 * Global Upload Progress Indicator Component
 *
 * Renders upload progress toasts for all active and recently completed uploads.
 * Should be placed in the root layout for global visibility across all pages.
 *
 * Features:
 * - Shows all pending and uploading files
 * - Shows completed uploads for 5 seconds
 * - Shows failed uploads for 10 seconds
 * - Fixed position at bottom-right of screen
 * - Uses aria-live for screen reader announcements
 *
 * Note: This component is dynamically imported with ssr: false in layout.tsx
 * to prevent hydration mismatches with Zustand store
 */
const UploadProgressIndicator = () => {
  // Get uploads from store
  const uploadsRecord = useUploadStore((state) => state.uploads);
  const time = useTime();
  // Convert Record to array
  const uploads = useMemo(() => Object.values(uploadsRecord), [uploadsRecord]);

  // Filter uploads to show:
  // - All pending/uploading uploads
  // - Completed uploads within visibility duration
  // - Failed uploads within visibility duration
  const visibleUploads = uploads.filter((upload) => {
    // Always show active uploads
    if (upload.status === 'pending' || upload.status === 'uploading') {
      return true;
    }

    // Show completed uploads for configured duration
    if (upload.status === 'completed' && upload.completedAt) {
      const elapsed = time - upload.completedAt.getTime();
      return elapsed < UPLOAD_VISIBILITY.COMPLETED_DURATION_MS;
    }

    // Show failed uploads for configured duration
    if (upload.status === 'failed' && upload.completedAt) {
      const elapsed = time - upload.completedAt.getTime();
      return elapsed < UPLOAD_VISIBILITY.FAILED_DURATION_MS;
    }

    return false;
  });

  // Don't render if no visible uploads
  if (visibleUploads.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      role="region"
      aria-label="Upload progress"
      aria-live="polite"
    >
      {visibleUploads.map((upload) => (
        <UploadProgressToast key={upload.id} upload={upload} />
      ))}
    </div>
  );
};

export default UploadProgressIndicator;
