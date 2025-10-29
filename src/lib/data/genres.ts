import { IGenre, IMovie } from '@/models/movie/movie';
import { cache } from 'react';
import 'server-only';
import { handlePrismaError, logError } from '../errors';
import prisma from '../prisma';

export class GenreData {
  static async create(genre: IGenre) {
    try {
      const createdGenre = await prisma.genre.create({
        data: genre,
      });
      return { status: 200, createdGenre: createdGenre };
    } catch (error) {
      logError(error, 'addGenre');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
  static async delete(id: string) {
    try {
      const deletedGenre = await prisma.genre.delete({
        where: {
          id: id,
        },
      });
      return { deletedGenre, status: 200 };
    } catch (error) {
      logError(error, 'delete Genre data');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
  static async update(genre: IGenre) {
    try {
      const updatedGenre = await prisma.genre.update({
        where: {
          id: genre.id,
        },
        data: genre,
      });
      if (!updatedGenre) {
        return { status: 404 };
      }

      return { status: 200, updatedGenre };
    } catch (error) {
      logError(error, 'updateGenre');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
  static getAllGenres = cache(
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

  getMoviesByARandomGenreById = cache(
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
}
