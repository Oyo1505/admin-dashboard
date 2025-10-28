import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
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
      const existingFavorite = await prisma.userFavoriteMovies.findUnique({
        where: {
          userId_movieId: {
            userId: idUser,
            movieId: idMovie,
          },
        },
      });

      if (existingFavorite) {
        await prisma.userFavoriteMovies.delete({
          where: {
            userId_movieId: {
              userId: idUser,
              movieId: idMovie,
            },
          },
        });

        revalidatePath(URL_MOVIE_ID(idMovie));
        return { status: 200, message: 'Success: movie deleted' };
      }
      await prisma.userFavoriteMovies.create({
        data: {
          userId: idUser,
          movieId: idMovie,
        },
      });

      revalidatePath(URL_MOVIE_ID(idMovie));
      return { status: 200, message: 'Added to favorite"' };
    } catch (error) {
      logError(error, 'handleFavorite');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
}
