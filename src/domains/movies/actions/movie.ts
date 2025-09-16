'use server';
import { validateId } from '@/lib/api-wrapper';
import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { IMovie } from '@/models/movie/movie';
import { CACHE_TTL_SHORT } from '@/shared/constants/time';
import { URL_MOVIE_ID } from '@/shared/route';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';

export const getMovieDetail = cache(
  async (
    id: string
  ): Promise<{
    movie?: IMovie;
    suggestedMovies?: IMovie[];
    status: number;
  }> => {
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
            //@ts-ignore
            cacheStrategy: { ttl: CACHE_TTL_SHORT },
          })
        : [];

      return {
        movie: movieInDb,
        suggestedMovies: suggestedMovies,
        status: 200,
      };
    } catch (error) {
      logError(error, 'getMovieDetail');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
);

export const addOrRemoveToFavorite = async (
  idUser: string,
  idMovie: string | undefined
): Promise<{ status: number; message?: string }> => {
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
    return { status: 200, message: 'Added to favortie' };
  } catch (error) {
    logError(error, 'addOrRemoveToFavorite');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};
