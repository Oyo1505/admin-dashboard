'use server';
import { validateId } from '@/lib/api-wrapper';
import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { IGenre, IMovie } from '@/models/movie/movie';
import { URL_DASHBOARD_ROUTE, URL_MOVIE_ID } from '@/shared/route';
import type { Prisma } from '@prisma/client';
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
        cacheStrategy: { ttl: 120 },
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
            cacheStrategy: { ttl: 600 },
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

export const getMoviesByARandomGenreById = async (
  genreId: string
): Promise<{ movies?: IMovie[]; status: number }> => {
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
};

export const getLastMovies = async (): Promise<{
  movies?: IMovie[];
  status: number;
}> => {
  try {
    const moviesInDb = await prisma.movie.findMany({
      where: {
        publish: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      //@ts-ignore
      cacheStrategy: { ttl: 300 },
    });
    if (!moviesInDb) {
      return { status: 404 };
    }
    return { movies: moviesInDb, status: 200 };
  } catch (error) {
    logError(error, 'getLastMovies');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const getMoviesByARandomCountry = async (): Promise<{
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
      //@ts-ignore
      cacheStrategy: { ttl: 300 },
    });
    if (!uniqueCountries) {
      return { status: 400 };
    }
    const getARadomCountry =
      uniqueCountries[Math.floor(Math.random() * uniqueCountries.length)];

    const movies = await prisma.movie.findMany({
      where: {
        country: getARadomCountry.country,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    });

    if (!movies) {
      return { status: 400 };
    }
    return { status: 200, movies, country: getARadomCountry.country as string };
  } catch (error) {
    logError(error, 'getMoviesByARandomCountry');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const getMoviesByARandomGenre = async (): Promise<{
  movies?: IMovie[];
  genre?: IGenre;
  status: number;
}> => {
  try {
    const uniqueGenres = await prisma.genre.findMany({
      //@ts-ignore
      cacheStrategy: { ttl: 300 },
    });
    if (!uniqueGenres) {
      return { status: 400 };
    }
    const randomGenre =
      uniqueGenres[Math.floor(Math.random() * uniqueGenres.length)];

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
      //@ts-ignore
      cacheStrategy: { ttl: 300 },
    });
    if (!movies) {
      return { status: 400 };
    }
    return { status: 200, movies, genre: randomGenre };
  } catch (error) {
    logError(error, 'getMoviesByARandomGenre');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const addOrRemoveToFavorite = async (
  idUser: string,
  idMovie: string | undefined
): Promise<{ status: number; message?: string }> => {
  if (!idMovie) {
    return { status: 400, message: "Le film n'est pas défini" };
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
      return { status: 200, message: 'Supprimé des favoris avec succès' };
    }
    await prisma.userFavoriteMovies.create({
      data: {
        userId: idUser,
        movieId: idMovie,
      },
    });

    revalidatePath(URL_MOVIE_ID(idMovie));
    return { status: 200, message: 'Ajouté aux favoris avec succès' };
  } catch (error) {
    logError(error, 'addOrRemoveToFavorite');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const getAllMovies = async (): Promise<{
  movieInDb?: IMovie[];
  status: number;
}> => {
  try {
    const movieInDb = await prisma.movie.findMany({
      //@ts-ignore
      cacheStrategy: { ttl: 300 },
    });

    return { movieInDb, status: 200 };
  } catch (error) {
    logError(error, 'getAllMovies');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const fetchMovies = cache(
  async ({
    pageParam,
    search,
  }: {
    pageParam: number;
    search: string;
  }): Promise<{ movies?: IMovie[]; status: number; prevOffset?: number }> => {
    try {
      if (!search.trim()) {
        const movies = await prisma.movie.findMany({
          where: {
            publish: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: pageParam,
          //@ts-ignore
          cacheStrategy: { ttl: 300 },
        });

        return {
          movies,
          status: 200,
          prevOffset: pageParam,
        };
      }

      // Extraction des paramètres de recherche
      const params = new URLSearchParams(search);
      const subtitles = params.get('subtitles');
      const language = params.get('language');
      const decade = params.get('decade');
      const genre = params.get('genre');
      const q = params.get('q');

      // Conditions pour la requête
      const conditions: Prisma.MovieWhereInput = {};

      // Ajout des conditions OR basées sur la recherche 'q'
      if (q && q.length > 0) {
        conditions.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { originalTitle: { contains: q, mode: 'insensitive' } },
          { titleJapanese: { contains: q, mode: 'insensitive' } },
          { titleEnglish: { contains: q, mode: 'insensitive' } },
          { director: { contains: q, mode: 'insensitive' } },
        ];
      }

      // Ajout des conditions AND selon les paramètres facultatifs
      conditions.AND = [];
      if (subtitles) {
        conditions.AND.push({ subtitles: { has: subtitles } });
      }

      if (decade) {
        const startOfDecade = Number(decade);
        const endOfDecade = startOfDecade + 9;

        conditions.AND.push({
          year: {
            gte: startOfDecade,
            lte: endOfDecade,
          },
        });
      }

      if (language) {
        conditions.AND.push({
          country: { contains: language, mode: 'insensitive' },
        });
      }

      if (genre) {
        conditions.AND.push({
          genresIds: {
            some: {
              genre: {
                OR: [
                  { nameFR: { contains: genre, mode: 'insensitive' } },
                  { nameEN: { contains: genre, mode: 'insensitive' } },
                  { nameJP: { contains: genre, mode: 'insensitive' } },
                ],
              },
            },
          },
        });
      }

      // Concaténation des conditions OR et AND si elles existent
      const whereClause: Prisma.MovieWhereInput = {
        ...(conditions.OR?.length ? { OR: conditions.OR } : {}),
        ...(conditions.AND?.length ? { AND: conditions.AND } : {}),
      };

      const movies = await prisma.movie.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        take: pageParam,
        //@ts-ignore
        cacheStrategy: { ttl: 300 },
      });

      return {
        movies,
        status: 200,
        prevOffset: pageParam,
      };
    } catch (error) {
      logError(error, 'fetchMovies');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
);

export const getMoviesCountries = async (): Promise<{
  status: number;
  countries?: string[];
}> => {
  try {
    const countriesValues = await prisma.movie.findMany({
      select: {
        country: true,
      },
      //@ts-ignore
      cacheStrategy: { ttl: 300 * 60 },
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
};

export const getAllGenres = async (): Promise<{
  status: number;
  genres?: IGenre[];
}> => {
  try {
    const genres = await prisma.genre.findMany();
    if (!genres) {
      return { status: 404, genres };
    }
    return { status: 200, genres };
  } catch (error) {
    logError(error, 'getAllGenres');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const addGenre = async (
  genre: IGenre
): Promise<{ status: number; genre?: IGenre }> => {
  try {
    const createdGenre = await prisma.genre.create({
      data: genre,
    });
    if (!createdGenre) {
      return { status: 404 };
    }
    revalidatePath(URL_DASHBOARD_ROUTE.genre);
    return { status: 200, genre: createdGenre };
  } catch (error) {
    logError(error, 'addGenre');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const updateGenre = async (
  genre: IGenre
): Promise<{ status: number; genre?: IGenre }> => {
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
    revalidatePath(URL_DASHBOARD_ROUTE.genre);
    return { status: 200, genre: updatedGenre };
  } catch (error) {
    logError(error, 'updateGenre');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const deleteGenre = async (
  id: string
): Promise<{ status: number; genre?: IGenre | undefined }> => {
  try {
    const deletedGenre = await prisma.genre.delete({
      where: {
        id: id,
      },
    });
    if (!deletedGenre) {
      return { status: 404 };
    }
    revalidatePath(URL_DASHBOARD_ROUTE.genre);
    return { status: 200, genre: deletedGenre };
  } catch (error) {
    logError(error, 'deleteGenre');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};
