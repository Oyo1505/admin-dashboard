import { IGenre, IMovie } from '@/models/movie/movie';
import { cache } from 'react';
import 'server-only';
import { handlePrismaError, logError } from '../errors';
import prisma from '../prisma';

export const getAllGenres = cache(
  async (): Promise<{
    genres?: IGenre[];
    status: number;
  }> => {
    try {
      const genres = await prisma.genre.findMany();
      if (!genres) {
        return { status: 404 };
      }
      return { genres, status: 200 };
    } catch (error) {
      logError(error, 'getAllGenres');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
);

export const getMoviesByARandomGenreById = cache(
  async (genreId: string): Promise<{ movies?: IMovie[]; status: number }> => {
    try {
      if (!genreId?.trim()) {
        return { status: 400 };
      }

      const moviesInDb = await prisma.movie.findMany({
        where: {
          genresIds: {
            some: {
              genreId: { contains: genreId, mode: 'insensitive' },
            },
          },
        },
      });
      return { movies: moviesInDb, status: 200 };
    } catch (error) {
      logError(error, 'getMoviesByARandomGenreById');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
);
