'use client';
import { IMovie } from '@/models/movie/movie';
import { memo } from 'react';

const MovieCardSearchPageMobileView = memo(({ movie }: IMovie) => {
  return <div>Movie Card Search Page</div>;
});
MovieCardSearchPageMobileView.displayName = 'MovieCardSearchPageMobileView';
export default MovieCardSearchPageMobileView;
