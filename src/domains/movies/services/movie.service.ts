import { MovieData } from '@/lib/data/movies';
import { handlePrismaError, logError } from '@/lib/errors';
import {
  IFavoriteMovieResponse,
  IMovieFormData,
  IUpdateMovieData,
} from '@/models/movie/movie';
import HttpStatus from '@/shared/constants/httpStatus';
import { URL_DASHBOARD_ROUTE } from '@/shared/route';
import { revalidatePath } from 'next/cache';

export class MovieService {
  static async addMovie(
    movie: IMovieFormData
  ): Promise<{ status: number; message: string }> {
    try {
      if (!movie?.title?.trim()) {
        return { status: HttpStatus.BAD_REQUEST, message: 'Le titre du film est requis' };
      }

      if (
        !movie.genresIds ||
        !Array.isArray(movie.genresIds) ||
        movie.genresIds.length === 0
      ) {
        return { status: HttpStatus.BAD_REQUEST, message: 'Au moins un genre est requis' };
      }

      const { existingMovie } = await MovieData.findByGoogleDriveId(movie);

      if (existingMovie) {
        return { status: HttpStatus.CONFLICT, message: 'Le film existe déjà' };
      }

      await MovieData.create(movie);

      revalidatePath(URL_DASHBOARD_ROUTE.movie);
      return { status: HttpStatus.OK, message: 'Success : Movie added' };
    } catch (error) {
      logError(error, 'addMovieToDb');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode, message: appError.message };
    }
  }
  static async updateMovie(
    movie: IUpdateMovieData
  ): Promise<{ status: number; message?: string }> {
    try {
      const { movie: movieInDb } = await MovieData.findUnique(movie.id);

      if (!movieInDb) {
        return { status: HttpStatus.NOT_FOUND, message: "Le film n'existe pas" };
      }

      if (
        !movie.genresIds ||
        !Array.isArray(movie.genresIds) ||
        movie.genresIds.length === 0
      ) {
        return { status: HttpStatus.BAD_REQUEST, message: 'Au moins un genre est requis' };
      }

      await MovieData.update(movie);

      revalidatePath(URL_DASHBOARD_ROUTE.movie);
      return { status: HttpStatus.OK, message: 'Film modifié avec succès' };
    } catch (error) {
      logError(error, 'editMovieToDb');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
  static async deleteMovie(
    id: string
  ): Promise<{ status: number; message?: string }> {
    try {
      if (!id) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'ID du film est requis',
        };
      }
      await MovieData.delete(id);
      revalidatePath('/dashboard/add-movie');
      return { status: HttpStatus.OK };
    } catch (error) {
      logError(error, 'deleteMovieById');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }

  static async handlePublishMovie(
    id: string
  ): Promise<{ publish?: boolean; status: number }> {
    try {
      if (!id) {
        return { publish: false, status: HttpStatus.BAD_REQUEST };
      }

      const { movie } = await MovieData.findUniqueMoviePublished(id);

      if (!movie) {
        return { publish: false, status: HttpStatus.NOT_FOUND };
      }

      const { publish, status } = await MovieData.togglePublish(
        id,
        movie?.publish
      );
      revalidatePath(URL_DASHBOARD_ROUTE.movie);
      return { publish, status };
    } catch (error) {
      logError(error, 'publishedMovieById');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
  static async favoriteMovies(
    id: string
  ): Promise<{ movies?: IFavoriteMovieResponse[]; status: number }> {
    try {
      const { movies, status } = await MovieData.findManyFavorite(id);

      return { movies, status };
    } catch (error) {
      logError(error, 'favoriteMovies');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
}
