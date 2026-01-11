'use client';

import useUserStore from '@/store/user/user-store';
import { useEffect } from 'react';

/**
 * TestModeProvider - Initializes user store with mock admin user in test mode
 * This ensures Playwright tests can access dashboard components that require authentication
 */
export default function TestModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser, user } = useUserStore();
  const isTestMode =
    typeof window !== 'undefined' &&
    document.cookie.includes('playwright_test_mode=true');

  useEffect(() => {
    // Only initialize if in test mode and user not already set
    if (isTestMode && (!user || !user.id)) {
      const mockAdminUser = {
        id: 'test-admin-id',
        email: 'test-admin@example.com',
        name: 'Test Admin',
        role: 'ADMIN' as const,
        image: null,
      };

      setUser(mockAdminUser, true);
      console.log('[TestMode] Mock admin user initialized for Playwright tests');
    }
  }, [isTestMode, setUser, user]);

  return <>{children}</>;
}
