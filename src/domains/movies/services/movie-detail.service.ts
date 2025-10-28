import { validateId } from '@/lib/api-wrapper';
import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { IMovie } from '@/models/movie/movie';
import { CACHE_TTL_SHORT } from '@/shared/constants/time';

export class MovieDetailService {
  static async movieDetail(id: string): Promise<{
    movie?: IMovie;
    suggestedMovies?: IMovie[];
    status: number;
  }> {
    try {
      validateId(id);

      const movieInDb = await prisma.movie.findUnique({
        where: { id },
        include: {
          genresIds: {
            select: {
              genre: true,
            },
          },
        },
        //@ts-ignore
        cacheStrategy: { ttl: CACHE_TTL_SHORT },
      });

      if (!movieInDb) {
        return { status: 404 };
      }

      const randomGenre =
        movieInDb.genresIds.length > 0
          ? movieInDb.genresIds[
              Math.floor(Math.random() * movieInDb.genresIds.length)
            ]
          : null;

      const suggestedMovies = randomGenre
        ? await prisma.movie.findMany({
            where: {
              genresIds: {
                some: {
                  genreId: {
                    contains: randomGenre.genre?.id,
                    mode: 'insensitive',
                  },
                },
              },
              NOT: { id: movieInDb.id },
            },
          })
        : [];

      return {
        movie: movieInDb,
        suggestedMovies: suggestedMovies,
        status: 200,
      };
    } catch (error) {
      logError(error, 'movieDetail services');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
}
