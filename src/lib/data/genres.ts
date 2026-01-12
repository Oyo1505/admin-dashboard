import { IGenre, IMovie } from '@/models/movie/movie';
import HttpStatus from '@/shared/constants/httpStatus';
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
      return { status: HttpStatus.OK, createdGenre: createdGenre };
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
      return { deletedGenre, status: HttpStatus.OK };
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
        return { status: HttpStatus.NOT_FOUND };
      }

      return { status: HttpStatus.OK, updatedGenre };
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
        return { genres, status: HttpStatus.OK };
      } catch (error) {
        logError(error, 'getAllGenres');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );

  static getMoviesByARandomGenreById = cache(
    async (genreId: string): Promise<{ movies?: IMovie[]; status: number }> => {
      try {
        if (!genreId?.trim()) {
          return { status: HttpStatus.BAD_REQUEST };
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
        return { movies: moviesInDb, status: HttpStatus.OK };
      } catch (error) {
        logError(error, 'getMoviesByARandomGenreById');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );
}
