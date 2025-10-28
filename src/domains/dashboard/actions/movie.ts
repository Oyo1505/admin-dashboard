'use server';
import { MovieService } from '@/domains/movies/services/movie.service';
import {
  IFavoriteMovieResponse,
  IMovieFormData,
  IUpdateMovieData,
} from '@/models/movie/movie';

export const addMovieToDb = async (
  movie: IMovieFormData
): Promise<{ status: number; message: string }> => {
  return await MovieService.addMovie(movie);
};

export const editMovieToDb = async (
  movie: IUpdateMovieData
): Promise<{ status: number; message?: string }> => {
  return await MovieService.updateMovie(movie);
};

export const deleteMovieById = async (
  id: string
): Promise<{ status: number; message?: string }> => {
  return await MovieService.deleteMovie(id);
};

export const publishedMovieById = async (
  id: string
): Promise<{ publish?: boolean; status: number }> => {
  return await MovieService.handlePublishMovie(id);
};

export const getFavoriteMovies = async (
  id: string
): Promise<{ movies?: IFavoriteMovieResponse[]; status: number }> => {
  return await MovieService.favoriteMovies(id);
};
