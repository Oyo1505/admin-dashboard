import prisma from '@/lib/prisma';
import {
  IFavoriteMovieResponse,
  IGenre,
  IGenreResponse,
  IMovie,
  IMovieFormData,
} from '@/models/movie/movie';
import { CACHE_TTL_SHORT } from '@/shared/constants/time';
import {
  MAX_LATEST_MOVIES,
  MAX_MOVIES_BY_COUNTRY,
  MAX_MOVIES_BY_GENRE,
} from '@/shared/constants/pagination';
import { cache } from 'react';
import 'server-only';
import { handlePrismaError, logError } from '../errors';
import {
  buildMovieData,
  buildGenresConnectionForCreate,
  buildGenresConnectionForUpdate,
  buildMovieInclude,
} from './movies-helpers';

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
          ...buildMovieData(movie),
          genresIds: buildGenresConnectionForCreate(movie.genresIds),
        },
        include: buildMovieInclude(),
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
          ...buildMovieData(movie),
          genresIds: buildGenresConnectionForUpdate(movie.genresIds),
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
          take: MAX_LATEST_MOVIES,
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

  /**
   * Finds a specific favorite movie for a user
   * @param userId - User ID
   * @param movieId - Movie ID
   * @returns Favorite movie record if exists
   */
  static async findUniqueFavorite(
    userId: string,
    movieId: string
  ): Promise<{
    favorite?: { id: string; userId: string; movieId: string };
    status: number;
  }> {
    try {
      const favorite = await prisma.userFavoriteMovies.findUnique({
        where: {
          userId_movieId: {
            userId,
            movieId,
          },
        },
      });

      if (favorite) {
        return {
          favorite: {
            id: favorite.id.toString(),
            userId: favorite.userId,
            movieId: favorite.movieId,
          },
          status: 200,
        };
      }
      return { favorite: undefined, status: 404 };
    } catch (error) {
      logError(error, 'findUniqueFavorite');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }

  /**
   * Creates a favorite movie record for a user
   * @param userId - User ID
   * @param movieId - Movie ID
   * @returns Created favorite record
   */
  static async createFavorite(
    userId: string,
    movieId: string
  ): Promise<{
    favorite?: { id: string; userId: string; movieId: string };
    status: number;
    message?: string;
  }> {
    try {
      const favorite = await prisma.userFavoriteMovies.create({
        data: {
          userId,
          movieId,
        },
      });

      return {
        favorite: {
          id: favorite.id.toString(),
          userId: favorite.userId,
          movieId: favorite.movieId,
        },
        status: 200,
        message: 'Added to favorite',
      };
    } catch (error) {
      logError(error, 'createFavorite');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }

  /**
   * Deletes a favorite movie record for a user
   * @param userId - User ID
   * @param movieId - Movie ID
   * @returns Deletion status
   */
  static async deleteFavorite(
    userId: string,
    movieId: string
  ): Promise<{ status: number; message?: string }> {
    try {
      await prisma.userFavoriteMovies.delete({
        where: {
          userId_movieId: {
            userId,
            movieId,
          },
        },
      });

      return { status: 200, message: 'Success: movie deleted' };
    } catch (error) {
      logError(error, 'deleteFavorite');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
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
          take: MAX_MOVIES_BY_COUNTRY,
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
          take: MAX_MOVIES_BY_GENRE,
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

  static findManyOrderByDesc = cache(
    async (): Promise<{ movies?: IMovie[] | undefined; status: number }> => {
      try {
        const movies = await prisma.movie.findMany({
          select: {
            id: true,
            updatedAt: true,
          },
          where: {
            publish: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        });
        if (movies) return { movies: movies as IMovie[], status: 200 };
        return { movies: [], status: 404 };
      } catch (error) {
        logError(error, 'findManyOrderByDesc data');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );

  static findUniqueIncludesGenres = cache(
    async (
      id: string
    ): Promise<{
      movieInDb?: IMovie | undefined;
      status: number;
    }> => {
      try {
        const movies = await prisma.movie.findUnique({
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
        if (movies) return { movieInDb: movies as IMovie, status: 200 };
        return { movieInDb: undefined, status: 404 };
      } catch (error) {
        logError(error, 'findUniqueIncludesGenres');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );
  static findManyMovieGenres = cache(
    async (
      randomGenre: IGenreResponse,
      movieInDb: IMovie
    ): Promise<{
      movies?: IMovie[] | undefined;
      status: number;
    }> => {
      try {
        const movies = await prisma.movie.findMany({
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
        });
        if (movies) return { movies: movies, status: 200 };
        return { movies: undefined, status: 404 };
      } catch (error) {
        logError(error, 'findManyMovieGenres');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );
}
