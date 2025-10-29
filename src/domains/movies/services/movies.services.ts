import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { IMovie } from '@/models/movie/movie';
import { Prisma } from '@prisma/client';

/**
 * Service managing movie-related operations
 */
export class MoviesService {
  /**
   * Retrieves a list of movies with pagination and filters
   * @param pageParam - Number of movies to retrieve
   * @param search - Search parameters (URLSearchParams string)
   * Supported parameters:
   * - q: text search (title, director)
   * - subtitles: filter by subtitles
   * - language: filter by country/language
   * - decade: filter by decade (e.g., 1990)
   * - genre: filter by genre (FR/EN/JP)
   * @returns List of movies, HTTP status, and previous offset
   */
  static async fetchMovies({
    pageParam,
    search,
  }: {
    pageParam: number;
    search: string;
  }): Promise<{ status: number; movies?: IMovie[]; prevOffset?: number }> {
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
        });

        return {
          movies,
          status: 200,
          prevOffset: pageParam,
        };
      }

      // Extract search parameters
      const params = new URLSearchParams(search);
      const subtitles = params.get('subtitles');
      const language = params.get('language');
      const decade = params.get('decade');
      const genre = params.get('genre');
      const q = params.get('q');

      // Conditions for the query
      const conditions: Prisma.MovieWhereInput = {};

      // Add OR conditions based on 'q' search
      if (q && q.length > 0) {
        conditions.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { originalTitle: { contains: q, mode: 'insensitive' } },
          { titleJapanese: { contains: q, mode: 'insensitive' } },
          { titleEnglish: { contains: q, mode: 'insensitive' } },
          { director: { contains: q, mode: 'insensitive' } },
        ];
      }

      // Add AND conditions based on optional parameters
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

      // Concatenate OR and AND conditions if they exist
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
}
