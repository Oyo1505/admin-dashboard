import prisma from '@/lib/prisma';
import {
  IFavoriteMovieResponse,
  IGenre,
  IMovie,
  IMovieFormData,
} from '@/models/movie/movie';
import { cache } from 'react';
import 'server-only';
import { handlePrismaError, logError } from '../errors';

export class MovieData {
  /**
   * Creates a new movie in the database
   * @param movie - Movie data to create
   * @returns The created movie with its genres and HTTP status
   */
  static async create(movie: IMovieFormData): Promise<{
    movie?: IMovie;
    status: number;
  }> {
    try {
      const createdMovie = await prisma.movie.create({
        data: {
          title: movie.title,
          titleEnglish: movie.titleEnglish,
          titleJapanese: movie.titleJapanese,
          link: movie.link || '',
          image: movie.image || movie.link || '',
          director: movie.director,
          imdbId: movie.imdbId,
          originalTitle: movie.originalTitle,
          duration: movie.duration ? Number(movie.duration) : null,
          idGoogleDive: movie.idGoogleDive,
          language: movie.language,
          subtitles: movie.subtitles || [],
          year: movie.year ? Number(movie.year) : null,
          genresIds: {
            create: movie.genresIds.map((genreId) => ({
              genre: {
                connect: { id: genreId.toString() },
              },
            })),
          },
          country: movie.country,
          synopsis: movie.synopsis,
          trailer: movie.trailer,
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
      });

      return { movie: createdMovie as IMovie, status: 200 };
    } catch (error) {
      logError(error, 'MovieData.create');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
  static async update(movie: IMovieFormData): Promise<{
    movie?: IMovie;
    status: number;
  }> {
    try {
      const updatedMovie = await prisma.movie.update({
        where: {
          id: movie.id,
        },
        data: {
          title: movie.title,
          titleEnglish: movie.titleEnglish,
          titleJapanese: movie.titleJapanese,
          link: movie.link || '',
          image: movie.image || movie.link || '',
          director: movie.director,
          imdbId: movie.imdbId,
          originalTitle: movie.originalTitle,
          duration: Number(movie.duration),
          idGoogleDive: movie.idGoogleDive,
          language: movie.language,
          subtitles: movie.subtitles || [],
          year: Number(movie.year),
          genresIds: {
            deleteMany: {},
            create: movie.genresIds.map((genreId) => ({
              genre: {
                connect: { id: genreId.toString() },
              },
            })),
          },
          country: movie.country,
          synopsis: movie.synopsis,
          trailer: movie.trailer,
        },
      });
      return { movie: updatedMovie as IMovie, status: 200 };
    } catch (error) {
      logError(error, 'MovieData.update');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
  static async delete(
    id: string
  ): Promise<{ status: number; message?: string }> {
    try {
      await prisma.movie.delete({
        where: {
          id,
        },
      });
      return { status: 200 };
    } catch (error) {
      logError(error, 'MovieData.delete');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
  /**
   * Toggles the publication status of a movie
   * @param id - Movie ID
   * @param currentPublishStatus - Current publication status
   * @returns New publication status and HTTP status code
   */
  static async togglePublish(
    id: string,
    currentPublishStatus: boolean
  ): Promise<{
    publish?: boolean;
    status: number;
  }> {
    try {
      const updatedMovie = await prisma.movie.update({
        where: { id },
        data: { publish: !currentPublishStatus },
        select: { publish: true },
      });
      return { publish: updatedMovie.publish, status: 200 };
    } catch (error) {
      logError(error, 'MovieData.togglePublish');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
  static getLastMovies = cache(
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
  /**
   * Retrieves a user's favorite movies
   * @param id - User ID
   * @returns List of favorite movies with complete data
   */
  static findManyFavorite = cache(
    async (
      id: string
    ): Promise<{
      movies?: IFavoriteMovieResponse[];
      status: number;
    }> => {
      try {
        const favorites = await prisma.userFavoriteMovies.findMany({
          relationLoadStrategy: 'join',
          where: {
            userId: id,
          },
          include: {
            movie: {
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
            },
          },
        });

        const movies: IFavoriteMovieResponse[] = favorites.map((favorite) => ({
          id: favorite.id.toString(),
          movieId: favorite.movieId,
          userId: favorite.userId,
          movie: favorite.movie as IMovie,
        }));

        if (movies.length > 0) return { movies, status: 200 };
        return { movies: [], status: 200 };
      } catch (error) {
        logError(error, 'findManyFavorite');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );
  static getMoviesByARandomCountry = cache(
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
        const getARandomCountry =
          uniqueCountries[Math.floor(Math.random() * uniqueCountries.length)];
        if (!getARandomCountry?.country) {
          return { status: 400, movies: [] };
        }
        const movies = await prisma.movie.findMany({
          where: {
            country: getARandomCountry.country,
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
          country: getARandomCountry.country as string,
        };
      } catch (error) {
        logError(error, 'getMoviesByARandomCountry');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );

  static getMoviesByARandomGenre = cache(
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

  static getAllMoviesWithGenres = cache(
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
  static getMoviesCountries = cache(
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
  /**
   * Checks if a movie exists
   * @param id - Movie ID
   * @returns Movie publication information
   */
  static findUnique = cache(
    async (
      id: string
    ): Promise<{
      movie?: { id: string; publish: boolean };
      status: number;
    }> => {
      try {
        const movie = await prisma.movie.findUnique({
          where: {
            id,
          },
        });
        if (movie) return { movie, status: 200 };
        return { movie: undefined, status: 404 };
      } catch (error) {
        logError(error, 'findUniqueMoviePublished');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );
  /**
   * Checks if a movie exists and retrieves its publication status
   * @param id - Movie ID
   * @returns Movie publication information
   */
  static findUniqueMoviePublished = cache(
    async (
      id: string
    ): Promise<{
      movie?: { id: string; publish: boolean };
      status: number;
    }> => {
      try {
        const movie = await prisma.movie.findUnique({
          where: { id },
          select: { id: true, publish: true },
        });
        if (movie) return { movie, status: 200 };
        return { movie: undefined, status: 404 };
      } catch (error) {
        logError(error, 'findUniqueMoviePublished');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );
  static findByGoogleDriveId = cache(
    async (
      movie: IMovieFormData
    ): Promise<{ existingMovie?: IMovie | undefined; status: number }> => {
      try {
        const existingMovie = await prisma.movie.findUnique({
          where: { idGoogleDive: movie.idGoogleDive || '' },
        });
        if (existingMovie) return { existingMovie, status: 200 };
        return { existingMovie: undefined, status: 400 };
      } catch (error) {
        logError(error, 'findByGoogleDriveId');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );
}
