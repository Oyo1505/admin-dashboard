'use client';
import useAuthStatus from '@/domains/auth/hooks/auth-status';
import ChatBot from '@/domains/chat-bot/components/chat-bot';
import useClearFiltersData from '@/domains/movies/hooks/clear-filters-data';
import useInitGenreStore from '@/domains/movies/hooks/use-init-genre-store';
import TanstackProvider from '@/providers/tanstack-provider';
import { ReactNode, Suspense } from 'react';

const LayoutLogic = ({ children }: { children?: ReactNode }) => {
  useAuthStatus();
  useClearFiltersData();
  useInitGenreStore();

  return (
    <TanstackProvider>
      {children}
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </TanstackProvider>
  );
};

export default LayoutLogic;
