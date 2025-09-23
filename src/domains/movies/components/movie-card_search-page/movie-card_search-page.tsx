'use client';
import { IMovie } from '@/models/movie/movie';
import { memo } from 'react';

const MovieCardSearchPage = memo(({ movie }: IMovie) => {
  return <div>Movie Card Search Page</div>;
});
MovieCardSearchPage.displayName = 'MovieCardSearchPage';
export default MovieCardSearchPage;
