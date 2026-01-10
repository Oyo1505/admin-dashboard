import HttpStatus from '@/shared/constants/httpStatus';
import {
  ACTIVE_USERS_PERIOD,
  MAX_TOP_GENRES,
  MAX_TOP_MOVIES,
  MAX_TOP_USERS,
  RECENT_ACTIVITY_PERIOD,
} from '@/shared/constants/analytics';
import { cache } from 'react';
import 'server-only';
import { handlePrismaError, logError } from '../errors';
import prisma from '../prisma';
import { IUserAnalytics } from './users';

export interface IAggregatedStats {
  totalUsers: number;
  totalMovies: number;
  totalGenres: number;
  activeUsers: number;
  publishedMovies: number;
  unpublishedMovies: number;
}

export interface ITopMovie {
  id: string;
  title: string;
  image: string;
  favoritesCount: number;
}

export interface ITopUser {
  id: string;
  name: string;
  email: string;
  visits: number;
  lastLogin: Date;
}

export interface ITopGenre {
  id: string;
  nameFR: string;
  nameEN: string;
  nameJP: string;
  count: number;
}

export interface IRecentActivity {
  newUsers: number;
  newMovies: number;
  recentUsers: { id: string; name: string; createdAt: Date }[];
  recentMovies: { id: string; title: string; createdAt: Date }[];
}

export class AnalyticsData {
  static getAnalyticsApplicationVisits = cache(async () => {
    try {
      const analytics = await prisma.analyticsApplication.findFirst();
      return { visits: analytics?.visits ?? 0, status: HttpStatus.OK };
    } catch (error) {
      logError(error, 'getAnalyticsApplicationVisits');
      const appError = handlePrismaError(error);
      return { visits: 0, status: appError.statusCode };
    }
  });

  static getAnalyticsUser = cache(
    async (
      user: IUserAnalytics
    ): Promise<{
      analytics?: {
        id: string;
        lastLogin: Date;
        lastMovieWatched: string | null;
        visits: number;
      }[];
      status: number;
    }> => {
      try {
        const analytics = await prisma.analyticsUser.findMany({
          where: {
            userId: user.id,
          },
        });
        if (analytics) return { analytics, status: HttpStatus.OK };
        return { analytics: undefined, status: HttpStatus.OK };
      } catch (error) {
        logError(error, 'getAnalyticsUser');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );

  /**
   * Get aggregated statistics for admin dashboard
   */
  static getAggregatedStats = cache(
    async (): Promise<{
      stats?: IAggregatedStats;
      status: number;
    }> => {
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - ACTIVE_USERS_PERIOD);

        const [
          totalUsers,
          totalMovies,
          totalGenres,
          activeUsers,
          publishedMovies,
          unpublishedMovies,
        ] = await Promise.all([
          prisma.user.count(),
          prisma.movie.count(),
          prisma.genre.count(),
          prisma.analyticsUser.count({
            where: {
              lastLogin: {
                gte: cutoffDate,
              },
            },
          }),
          prisma.movie.count({
            where: { publish: true },
          }),
          prisma.movie.count({
            where: { publish: false },
          }),
        ]);

        return {
          stats: {
            totalUsers,
            totalMovies,
            totalGenres,
            activeUsers,
            publishedMovies,
            unpublishedMovies,
          },
          status: HttpStatus.OK,
        };
      } catch (error) {
        logError(error, 'getAggregatedStats');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );

  /**
   * Get top movies by favorites count
   */
  static getTopMovies = cache(
    async (
      limit: number = MAX_TOP_MOVIES
    ): Promise<{
      movies?: ITopMovie[];
      status: number;
    }> => {
      try {
        const movies = await prisma.movie.findMany({
          where: {
            publish: true,
          },
          select: {
            id: true,
            title: true,
            image: true,
            _count: {
              select: {
                favoriteMovies: true,
              },
            },
          },
          orderBy: {
            favoriteMovies: {
              _count: 'desc',
            },
          },
          take: limit,
        });

        const topMovies: ITopMovie[] = movies.map((movie) => ({
          id: movie.id,
          title: movie.title,
          image: movie.image,
          favoritesCount: movie._count.favoriteMovies,
        }));

        return { movies: topMovies, status: HttpStatus.OK };
      } catch (error) {
        logError(error, 'getTopMovies');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );

  /**
   * Get top users by visits count
   */
  static getTopUsers = cache(
    async (
      limit: number = MAX_TOP_USERS
    ): Promise<{
      users?: ITopUser[];
      status: number;
    }> => {
      try {
        const analytics = await prisma.analyticsUser.findMany({
          select: {
            userId: true,
            visits: true,
            lastLogin: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            visits: 'desc',
          },
          take: limit,
        });

        const topUsers: ITopUser[] = analytics.map((analytic) => ({
          id: analytic.user.id,
          name: analytic.user.name,
          email: analytic.user.email,
          visits: analytic.visits,
          lastLogin: analytic.lastLogin,
        }));

        return { users: topUsers, status: HttpStatus.OK };
      } catch (error) {
        logError(error, 'getTopUsers');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );

  /**
   * Get top genres by favorites count
   */
  static getTopGenres = cache(
    async (
      limit: number = MAX_TOP_GENRES
    ): Promise<{
      genres?: ITopGenre[];
      status: number;
    }> => {
      try {
        // Optimized query using raw SQL to avoid N+1 problem
        // This aggregates favorites count by genre in the database
        const topGenres = await prisma.$queryRaw<
          Array<{
            id: string;
            nameFR: string;
            nameEN: string;
            nameJP: string;
            count: bigint;
          }>
        >`
          SELECT
            g.id,
            g."nameFR",
            g."nameEN",
            g."nameJP",
            COUNT(DISTINCT ufm.id)::bigint as count
          FROM "Genre" g
          LEFT JOIN "MovieGenre" mg ON mg."genreId" = g.id
          LEFT JOIN "Movie" m ON m.id = mg."movieId"
          LEFT JOIN "UserFavoriteMovies" ufm ON ufm."movieId" = m.id
          GROUP BY g.id, g."nameFR", g."nameEN", g."nameJP"
          ORDER BY count DESC
          LIMIT ${limit}
        `;

        // Convert bigint to number for JSON serialization
        const genresWithCount = topGenres.map((genre) => ({
          id: genre.id,
          nameFR: genre.nameFR,
          nameEN: genre.nameEN,
          nameJP: genre.nameJP,
          count: Number(genre.count),
        }));

        return { genres: genresWithCount, status: HttpStatus.OK };
      } catch (error) {
        logError(error, 'getTopGenres');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );

  /**
   * Get recent activity (new users and movies)
   */
  static getRecentActivity = cache(
    async (
      days: number = RECENT_ACTIVITY_PERIOD
    ): Promise<{
      activity?: IRecentActivity;
      status: number;
    }> => {
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const [newUsers, newMovies, recentUsers, recentMovies] =
          await Promise.all([
            prisma.user.count({
              where: {
                createdAt: {
                  gte: cutoffDate,
                },
              },
            }),
            prisma.movie.count({
              where: {
                createdAt: {
                  gte: cutoffDate,
                },
              },
            }),
            prisma.user.findMany({
              where: {
                createdAt: {
                  gte: cutoffDate,
                },
              },
              select: {
                id: true,
                name: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 5,
            }),
            prisma.movie.findMany({
              where: {
                createdAt: {
                  gte: cutoffDate,
                },
              },
              select: {
                id: true,
                title: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 5,
            }),
          ]);

        return {
          activity: {
            newUsers,
            newMovies,
            recentUsers,
            recentMovies,
          },
          status: HttpStatus.OK,
        };
      } catch (error) {
        logError(error, 'getRecentActivity');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );
}
