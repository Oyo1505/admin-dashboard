'use client';

import dynamic from 'next/dynamic';
import { Activity } from 'react';
const UploadProgressIndicator = dynamic(
  () => import('./upload-progress-indicator'),
  { ssr: false }
);

/**
 * Client-Only Wrapper for Upload Progress Indicator
 *
 * This wrapper ensures the UploadProgressIndicator only renders
 * on the client side after hydration is complete, preventing
 * React hydration mismatches with the Zustand store.
 *
 * Using a wrapper instead of dynamic import to avoid context
 * provider conflicts in Next.js 15+ with React 19.
 */
const UploadProgressWrapper = () => {
  return (
    <Activity mode="visible">
      <UploadProgressIndicator />
    </Activity>
  );
};

export default UploadProgressWrapper;
