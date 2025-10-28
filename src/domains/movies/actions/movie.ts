'use server';
import { IMovie } from '@/models/movie/movie';
import { cache } from 'react';
import { MovieDetailService, MovieFavoriteService } from '../services';

export const getMovieDetail = cache(
  async (
    id: string
  ): Promise<{
    movie?: IMovie;
    suggestedMovies?: IMovie[];
    status: number;
  }> => {
    return await MovieDetailService.movieDetail(id);
  }
);

export const addOrRemoveToFavorite = async (
  idUser: string,
  idMovie: string | undefined
): Promise<{ status: number; message?: string }> => {
  return await MovieFavoriteService.handleFavorite(idUser, idMovie);
};
