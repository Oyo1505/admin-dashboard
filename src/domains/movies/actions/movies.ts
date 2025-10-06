'use server';
import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { IMovie } from '@/models/movie/movie';
import { CACHE_TTL_LONG, CACHE_TTL_SHORT } from '@/shared/constants/time';
import type { Prisma } from '@prisma/client';
import { cache } from 'react';

export const getLastMovies = async (): Promise<{
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
      //@ts-ignore
      cacheStrategy: { ttl: CACHE_TTL_SHORT },
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
      cacheStrategy: { ttl: CACHE_TTL_SHORT },
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
      //@ts-ignore
      cacheStrategy: { ttl: CACHE_TTL_SHORT },
    });

    if (!movies) {
      return { status: 400, movies: [] };
    }
    return { status: 200, movies, country: getARadomCountry.country as string };
  } catch (error) {
    logError(error, 'getMoviesByARandomCountry');
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
          take: pageParam,
          //@ts-ignore
          cacheStrategy: { ttl: CACHE_TTL_SHORT },
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
        take: pageParam,
        //@ts-ignore
        cacheStrategy: { ttl: CACHE_TTL_SHORT },
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
      cacheStrategy: { ttl: CACHE_TTL_LONG },
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
