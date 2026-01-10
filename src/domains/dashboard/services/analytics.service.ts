import { AnalyticsData } from '@/lib/data/analytics';
import { MovieData } from '@/lib/data/movies';
import {
  MAX_CONNECTION_HISTORY,
  MAX_RECENT_FAVORITES,
  MAX_TOP_GENRES,
  MAX_TOP_MOVIES,
  MAX_TOP_USERS,
  RECENT_ACTIVITY_PERIOD,
  MIN_LIMIT,
  MAX_LIMIT,
  MIN_DAYS,
  MAX_DAYS,
} from '@/shared/constants/analytics';
import HttpStatus from '@/shared/constants/httpStatus';
import { logError } from '@/lib/errors';
import 'server-only';

/**
 * Analytics Service Layer
 * Handles business logic for analytics operations
 */
export class AnalyticsService {
  /**
   * Get comprehensive user statistics
   * @param userId - User ID
   * @returns User statistics including favorites and activity
   */
  static async getUserStats(userId: string) {
    try {
      if (!userId?.trim()) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'User ID is required',
        };
      }

      const [favoriteStatsResult, recentFavoritesResult] = await Promise.all([
        MovieData.getUserFavoriteStats(userId),
        MovieData.getRecentFavorites(userId, MAX_RECENT_FAVORITES),
      ]);

      if (
        favoriteStatsResult.status !== HttpStatus.OK ||
        recentFavoritesResult.status !== HttpStatus.OK
      ) {
        return {
          status:
            favoriteStatsResult.status !== HttpStatus.OK
              ? favoriteStatsResult.status
              : recentFavoritesResult.status,
          message: 'Failed to fetch user statistics',
        };
      }

      return {
        status: HttpStatus.OK,
        data: {
          totalFavorites: favoriteStatsResult.stats?.totalFavorites ?? 0,
          favoriteGenre: favoriteStatsResult.stats?.favoriteGenre,
          recentFavorites: recentFavoritesResult.favorites ?? [],
        },
      };
    } catch (error) {
      logError(error, 'AnalyticsService.getUserStats');
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }

  /**
   * Get connection history for a user
   * @param userId - User ID
   * @param limit - Maximum number of connections to return
   * @returns User connection history
   */
  static async getUserConnectionHistory(
    userId: string,
    limit: number = MAX_CONNECTION_HISTORY
  ) {
    try {
      if (!userId?.trim()) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'User ID is required',
        };
      }

      // This would require adding a connection history table
      // For now, we'll return the analytics data
      const analyticsResult = await AnalyticsData.getAnalyticsUser({
        id: userId,
      } as any);

      if (analyticsResult.status !== HttpStatus.OK) {
        return {
          status: analyticsResult.status,
          message: 'Failed to fetch connection history',
        };
      }

      return {
        status: HttpStatus.OK,
        data: {
          connections: analyticsResult.analytics?.slice(0, limit) ?? [],
        },
      };
    } catch (error) {
      logError(error, 'AnalyticsService.getUserConnectionHistory');
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }

  /**
   * Get comprehensive admin dashboard statistics
   * @returns Admin dashboard statistics
   */
  static async getAdminDashboardStats() {
    try {
      const [
        aggregatedStatsResult,
        topMoviesResult,
        topUsersResult,
        topGenresResult,
        recentActivityResult,
        applicationVisitsResult,
      ] = await Promise.all([
        AnalyticsData.getAggregatedStats(),
        AnalyticsData.getTopMovies(MAX_TOP_MOVIES),
        AnalyticsData.getTopUsers(MAX_TOP_USERS),
        AnalyticsData.getTopGenres(MAX_TOP_GENRES),
        AnalyticsData.getRecentActivity(RECENT_ACTIVITY_PERIOD),
        AnalyticsData.getAnalyticsApplicationVisits(),
      ]);

      // Check if any request failed
      const failedStatus =
        [
          aggregatedStatsResult,
          topMoviesResult,
          topUsersResult,
          topGenresResult,
          recentActivityResult,
          applicationVisitsResult,
        ].find((result) => result.status !== HttpStatus.OK)?.status ??
        HttpStatus.OK;

      if (failedStatus !== HttpStatus.OK) {
        return {
          status: failedStatus,
          message: 'Failed to fetch admin statistics',
        };
      }

      return {
        status: HttpStatus.OK,
        data: {
          aggregatedStats: aggregatedStatsResult.stats,
          topMovies: topMoviesResult.movies ?? [],
          topUsers: topUsersResult.users ?? [],
          topGenres: topGenresResult.genres ?? [],
          recentActivity: recentActivityResult.activity,
          totalVisits: applicationVisitsResult.visits ?? 0,
        },
      };
    } catch (error) {
      logError(error, 'AnalyticsService.getAdminDashboardStats');
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }

  /**
   * Get top movies by favorites
   * @param limit - Maximum number of movies to return
   * @returns Top movies
   */
  static async getTopMovies(limit: number = MAX_TOP_MOVIES) {
    try {
      // Validate limit parameter
      if (limit < MIN_LIMIT || limit > MAX_LIMIT) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `Limit must be between ${MIN_LIMIT} and ${MAX_LIMIT}`,
        };
      }

      const result = await AnalyticsData.getTopMovies(limit);

      if (result.status !== HttpStatus.OK) {
        return {
          status: result.status,
          message: 'Failed to fetch top movies',
        };
      }

      return {
        status: HttpStatus.OK,
        data: result.movies ?? [],
      };
    } catch (error) {
      logError(error, 'AnalyticsService.getTopMovies');
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }

  /**
   * Get top users by visits
   * @param limit - Maximum number of users to return
   * @returns Top users
   */
  static async getTopUsers(limit: number = MAX_TOP_USERS) {
    try {
      // Validate limit parameter
      if (limit < MIN_LIMIT || limit > MAX_LIMIT) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `Limit must be between ${MIN_LIMIT} and ${MAX_LIMIT}`,
        };
      }

      const result = await AnalyticsData.getTopUsers(limit);

      if (result.status !== HttpStatus.OK) {
        return {
          status: result.status,
          message: 'Failed to fetch top users',
        };
      }

      return {
        status: HttpStatus.OK,
        data: result.users ?? [],
      };
    } catch (error) {
      logError(error, 'AnalyticsService.getTopUsers');
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }

  /**
   * Get top genres by favorites
   * @param limit - Maximum number of genres to return
   * @returns Top genres
   */
  static async getTopGenres(limit: number = MAX_TOP_GENRES) {
    try {
      // Validate limit parameter
      if (limit < MIN_LIMIT || limit > MAX_LIMIT) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `Limit must be between ${MIN_LIMIT} and ${MAX_LIMIT}`,
        };
      }

      const result = await AnalyticsData.getTopGenres(limit);

      if (result.status !== HttpStatus.OK) {
        return {
          status: result.status,
          message: 'Failed to fetch top genres',
        };
      }

      return {
        status: HttpStatus.OK,
        data: result.genres ?? [],
      };
    } catch (error) {
      logError(error, 'AnalyticsService.getTopGenres');
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }

  /**
   * Get recent activity (new users and movies)
   * @param days - Number of days to look back
   * @returns Recent activity
   */
  static async getRecentActivity(days: number = RECENT_ACTIVITY_PERIOD) {
    try {
      // Validate days parameter
      if (days < MIN_DAYS || days > MAX_DAYS) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `Days must be between ${MIN_DAYS} and ${MAX_DAYS}`,
        };
      }

      const result = await AnalyticsData.getRecentActivity(days);

      if (result.status !== HttpStatus.OK) {
        return {
          status: result.status,
          message: 'Failed to fetch recent activity',
        };
      }

      return {
        status: HttpStatus.OK,
        data: result.activity,
      };
    } catch (error) {
      logError(error, 'AnalyticsService.getRecentActivity');
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }
}
