'use client';

import { Activity, useEffect, useState } from 'react';
import UploadProgressIndicator from './upload-progress-indicator';

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Activity mode={isMounted ? 'visible' : 'hidden'}>
      <UploadProgressIndicator />
    </Activity>
  );
};

export default UploadProgressWrapper;
