'use client';
import useAuthStatus from '@/domains/auth/hooks/auth-status';
import useClearFiltersData from '@/domains/movies/hooks/clear-filters-data';
import useInitGenreStore from '@/domains/movies/hooks/use-init-genre-store';
import { ReactNode } from 'react';

const LayoutLogic = ({ children }: { children?: ReactNode }) => {
  useAuthStatus();
  useClearFiltersData();
  useInitGenreStore();

  return <>{children}</>;
};

export default LayoutLogic;
