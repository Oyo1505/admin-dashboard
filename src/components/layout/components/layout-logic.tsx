"use client"
import React, { ReactNode } from 'react'
import useAuthStatus from '../../auth/hooks/auth-status'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useClearFiltersData from '@/components/movies/hooks/clearFiltersData'
import useInitGenreStore from '@/components/movies/hooks/use-init-genre-store'

const LayoutLogic =  ({children}: { children? : ReactNode}) => {
  useAuthStatus()
  useClearFiltersData()
  useInitGenreStore()
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export default LayoutLogic