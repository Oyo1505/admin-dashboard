import prisma from '@/lib/prisma';
import { IGenre, IMovie } from '@/models/movie/movie';
import { cache } from 'react';
import 'server-only';
import { handlePrismaError, logError } from '../errors';

export const getLastMovies = cache(
  async (): Promise<{
    movies?: IMovie[];
    status: number;
  }> => {
    try {
      const moviesInDb = await prisma.movie.findMany({
        where: {
          publish: true,
        },
        include: {
          genresIds: {
            select: {
              genre: {
                select: {
                  id: true,
                  nameFR: true,
                  nameEN: true,
                  nameJP: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });
      if (!moviesInDb) {
        return { status: 404, movies: [] };
      }
      return { movies: moviesInDb, status: 200 };
    } catch (error) {
      logError(error, 'getLastMovies');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
);

export const getMoviesByARandomCountry = cache(
  async (): Promise<{
    movies?: IMovie[];
    country?: string;
    status: number;
  }> => {
    try {
      const uniqueCountries = await prisma.movie.findMany({
        where: {
          publish: true,
        },
        select: {
          country: true,
        },
        distinct: ['country'],
      });
      if (!uniqueCountries) {
        return { status: 400 };
      }
      const getARadomCountry =
        uniqueCountries[Math.floor(Math.random() * uniqueCountries.length)];
      if (!getARadomCountry?.country) {
        return { status: 400, movies: [] };
      }
      const movies = await prisma.movie.findMany({
        where: {
          country: getARadomCountry.country,
          publish: true,
        },
        include: {
          genresIds: {
            select: {
              genre: {
                select: {
                  id: true,
                  nameFR: true,
                  nameEN: true,
                  nameJP: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 3,
      });

      if (!movies) {
        return { status: 400, movies: [] };
      }
      return {
        status: 200,
        movies,
        country: getARadomCountry.country as string,
      };
    } catch (error) {
      logError(error, 'getMoviesByARandomCountry');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
);

export const getMoviesByARandomGenre = cache(
  async (): Promise<{
    movies?: IMovie[];
    genre?: IGenre;
    status: number;
  }> => {
    try {
      const uniqueGenres = await prisma.genre.findMany();
      if (!uniqueGenres) {
        return { status: 400 };
      }
      const randomGenre =
        uniqueGenres[Math.floor(Math.random() * uniqueGenres.length)];
      if (!randomGenre) {
        return { status: 400, movies: [] };
      }
      const movies = await prisma.movie.findMany({
        where: {
          genresIds: {
            some: {
              genreId: { contains: randomGenre.id, mode: 'insensitive' },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });
      if (!movies) {
        return { status: 400, movies: [] };
      }
      return { status: 200, movies, genre: randomGenre };
    } catch (error) {
      logError(error, 'getMoviesByARandomGenre');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
);

export const getAllMoviesWithGenres = cache(
  async (): Promise<{
    movieInDb?: IMovie[];
    status?: number;
  }> => {
    try {
      const movieInDb = await prisma.movie.findMany({
        include: {
          genresIds: {
            select: {
              genre: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return { movieInDb, status: 200 };
    } catch (error) {
      logError(error, 'getAllMovies');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
);

export const getMoviesCountries = cache(
  async (): Promise<{
    status: number;
    countries?: string[];
  }> => {
    try {
      const countriesValues = await prisma.movie.findMany({
        select: {
          country: true,
        },
        distinct: ['country'],
      });

      if (!countriesValues) {
        return { status: 400 };
      }

      const countries =
        countriesValues?.flatMap((item) =>
          item.country ? [item.country] : []
        ) ?? [];

      return { status: 200, countries };
    } catch (error) {
      logError(error, 'getMoviesCountries');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
);
