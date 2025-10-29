import { MovieData } from '@/lib/data/movies';
import { handlePrismaError, logError } from '@/lib/errors';
import { URL_MOVIE_ID } from '@/shared/route';
import { revalidatePath } from 'next/cache';

export class MovieFavoriteService {
  static async handleFavorite(
    idUser: string,
    idMovie: string | undefined
  ): Promise<{ status: number; message?: string }> {
    if (!idMovie) {
      return { status: 400, message: 'Missing movie' };
    }
    try {
      // Check if favorite already exists using data layer
      const { favorite: existingFavorite } = await MovieData.findUniqueFavorite(
        idUser,
        idMovie
      );

      if (existingFavorite) {
        // Delete favorite using data layer
        const result = await MovieData.deleteFavorite(idUser, idMovie);
        revalidatePath(URL_MOVIE_ID(idMovie));
        return result;
      }

      // Create favorite using data layer
      const result = await MovieData.createFavorite(idUser, idMovie);
      revalidatePath(URL_MOVIE_ID(idMovie));
      return {
        status: result.status,
        message: result.message,
      };
    } catch (error) {
      logError(error, 'handleFavorite');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
}
