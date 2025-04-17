"use client"
import React, { ReactNode } from 'react';
import useAuthStatus from '../../auth/hooks/auth-status';
import useClearFiltersData from '@/domains/movies/hooks/clear-filters-data';
import useInitGenreStore from '@/domains/movies/hooks/use-init-genre-store';
import TanstackProvider from '@/providers/tanstack-provider';
import ChatBot from '@/domains/chat-bot/components/chat-bot';

const LayoutLogic =  ({ children }: { children? : ReactNode}) => {
  useAuthStatus();
  useClearFiltersData();
  useInitGenreStore();

  return (
    <TanstackProvider>
      {children}
      <ChatBot />
    </TanstackProvider>
  )
}

export default LayoutLogic