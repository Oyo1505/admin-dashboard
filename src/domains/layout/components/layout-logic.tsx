'use client';
import useAuthStatus from '@/domains/auth/hooks/auth-status';
import ChatBot from '@/domains/chat-bot/components/chat-bot';
import useClearFiltersData from '@/domains/movies/hooks/clear-filters-data';
import useInitGenreStore from '@/domains/movies/hooks/use-init-genre-store';
import { ReactNode, Suspense } from 'react';

const LayoutLogic = ({ children }: { children?: ReactNode }) => {
  useAuthStatus();
  useClearFiltersData();
  useInitGenreStore();

  return (
    <>
      {children}
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </>
  );
};

export default LayoutLogic;
