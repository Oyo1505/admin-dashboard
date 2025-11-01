import { MovieData } from '@/lib/data/movies';
import { handlePrismaError, logError } from '@/lib/errors';
import {
  IFavoriteMovieResponse,
  IMovieFormData,
  IUpdateMovieData,
} from '@/models/movie/movie';
import { URL_DASHBOARD_ROUTE } from '@/shared/route';
import { revalidatePath } from 'next/cache';

export class MovieService {
  static async addMovie(
    movie: IMovieFormData
  ): Promise<{ status: number; message: string }> {
    try {
      if (!movie?.title?.trim()) {
        return { status: 400, message: 'Le titre du film est requis' };
      }

      if (
        !movie.genresIds ||
        !Array.isArray(movie.genresIds) ||
        movie.genresIds.length === 0
      ) {
        return { status: 400, message: 'Au moins un genre est requis' };
      }

      const { existingMovie } = await MovieData.findByGoogleDriveId(movie);

      if (existingMovie) {
        return { status: 409, message: 'Le film existe déjà' };
      }

      await MovieData.create(movie);

      revalidatePath(URL_DASHBOARD_ROUTE.movie);
      return { status: 200, message: 'Success : Movie added' };
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
        return { status: 404, message: "Le film n'existe pas" };
      }

      if (
        !movie.genresIds ||
        !Array.isArray(movie.genresIds) ||
        movie.genresIds.length === 0
      ) {
        return { status: 400, message: 'Au moins un genre est requis' };
      }

      await MovieData.update(movie);

      revalidatePath(URL_DASHBOARD_ROUTE.movie);
      return { status: 200, message: 'Film modifié avec succès' };
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
          status: 400,
          message: 'ID du film est requis',
        };
      }
      await MovieData.delete(id);
      revalidatePath('/dashboard/add-movie');
      return { status: 200 };
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
        return { publish: false, status: 400 };
      }

      const { movie } = await MovieData.findUniqueMoviePublished(id);

      if (!movie) {
        return { publish: false, status: 404 };
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
