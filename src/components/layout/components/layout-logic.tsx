"use client"
import React, { ReactNode } from 'react'
import useAuthStatus from '../../auth/hooks/auth-status'
import useClearFiltersData from '@/components/movies/hooks/clear-filters-data'
import useInitGenreStore from '@/components/movies/hooks/use-init-genre-store'
import TanstackProvider from '@/providers/tensack-provider'

const LayoutLogic =  ({ children }: { children? : ReactNode}) => {
  useAuthStatus();
  useClearFiltersData();
  useInitGenreStore();

  return (
    <TanstackProvider>{children}</TanstackProvider>
  )
}

export default LayoutLogic