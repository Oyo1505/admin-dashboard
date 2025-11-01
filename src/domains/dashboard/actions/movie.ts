'use server';
import { MovieService } from '@/domains/movies/services/movie.service';
import { verifyAdmin, verifyOwnership } from '@/lib/data/dal/core/auth';
import { withAuth, withDALAuth } from '@/lib/data/dal/helpers';
import {
  IFavoriteMovieResponse,
  IMovieFormData,
  IUpdateMovieData,
} from '@/models/movie/movie';

export const addMovieToDb = withAuth(
  verifyAdmin,
  async (
    movie: IMovieFormData
  ): Promise<{ status: number; message: string }> => {
    return await MovieService.addMovie(movie);
  }
);

export const editMovieToDb = withAuth(
  verifyAdmin,
  async (
    movie: IUpdateMovieData
  ): Promise<{ status: number; message?: string }> => {
    return await MovieService.updateMovie(movie);
  }
);

export const deleteMovieById = withAuth(
  verifyAdmin,
  async (id: string): Promise<{ status: number; message?: string }> => {
    return await MovieService.deleteMovie(id);
  }
);

export const publishedMovieById = withAuth(
  verifyAdmin,
  async (
    id: string
  ): Promise<{ publish?: boolean; status: number; message?: string }> => {
    return await MovieService.handlePublishMovie(id);
  }
);

export const getFavoriteMovies = withDALAuth(
  async (id: string) => await verifyOwnership(id),
  async (
    id: string
  ): Promise<{
    movies?: IFavoriteMovieResponse[];
    status: number;
    message?: string;
  }> => {
    return await MovieService.favoriteMovies(id);
  }
);
