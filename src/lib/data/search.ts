import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { IMovie } from '@/models/movie/movie';
import HttpStatus from '@/shared/constants/httpStatus';
import { Prisma } from '@prisma/client';

/**
 * Data layer for movie search operations
 */
export class SearchData {
  /**
   * Retrieves all published movies with pagination
   * @param limit - Number of movies to retrieve
   * @returns Movies list with status
   */
  static async findAllPublishedMovies(
    limit: number
  ): Promise<{ status: number; movies?: IMovie[]; prevOffset?: number }> {
    try {
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
        take: limit,
      });

      return {
        movies,
        status: HttpStatus.OK,
        prevOffset: limit,
      };
    } catch (error) {
      logError(error, 'findAllPublishedMovies');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }

  /**
   * Builds search conditions based on search parameters
   * @param params - URLSearchParams with search filters
   * @returns Prisma where clause
   */
  static buildSearchConditions(
    params: URLSearchParams
  ): Prisma.MovieWhereInput {
    const q = params.get('q');
    const subtitles = params.get('subtitles');
    const language = params.get('language');
    const decade = params.get('decade');
    const genre = params.get('genre');

    const conditions: Prisma.MovieWhereInput = {};

    // Text search conditions (OR)
    if (q && q.length > 0) {
      conditions.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { originalTitle: { contains: q, mode: 'insensitive' } },
        { titleJapanese: { contains: q, mode: 'insensitive' } },
        { titleEnglish: { contains: q, mode: 'insensitive' } },
        { director: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Filter conditions (AND)
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

    // Build final where clause
    return {
      ...(conditions.OR?.length ? { OR: conditions.OR } : {}),
      ...(conditions.AND?.length ? { AND: conditions.AND } : {}),
    };
  }

  /**
   * Searches movies based on filters with pagination
   * @param whereClause - Prisma where clause
   * @param limit - Number of movies to retrieve
   * @returns Movies list with status
   */
  static async searchMovies(
    whereClause: Prisma.MovieWhereInput,
    limit: number
  ): Promise<{ status: number; movies?: IMovie[]; prevOffset?: number }> {
    try {
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
        take: limit,
      });

      return {
        movies,
        status: HttpStatus.OK,
        prevOffset: limit,
      };
    } catch (error) {
      logError(error, 'searchMovies');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
}
