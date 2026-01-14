import { validateId } from '@/lib/api-wrapper';
import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import HttpStatus from '@/shared/constants/httpStatus';
import { isSameDay } from '@/shared/utils/date/isSameDay';

/**
 * User Analytics Service
 *
 * Encapsulates business logic for user analytics tracking:
 * - User login tracking
 * - Visit counting and incrementing
 * - Last movie watched tracking
 * - Application-wide analytics
 *
 * This service handles the creation and update of analytics records
 * following the "upsert" pattern for efficient data management.
 *
 * @example
 * ```typescript
 * // Track user login
 * await UserAnalyticsService.recordUserLogin('user-id-123');
 *
 * // Track movie viewing
 * await UserAnalyticsService.recordMovieViewed('user-id-123', 'movie-id-456');
 *
 * // Increment application visits
 * await UserAnalyticsService.incrementApplicationVisits();
 * ```
 */
export class UserAnalyticsService {
  /**
   * Record a user login event
   *
   * Business logic:
   * 1. Validate user ID format
   * 2. Verify user exists in database
   * 3. If no analytics record exists, create one with initial values
   * 4. If analytics record exists, update last login and increment visits
   *
   * @param userId - User ID to record login for
   * @returns Operation result with status
   *
   * @throws {Error} If user ID is invalid or database operation fails
   *
   * @example
   * ```typescript
   * const result = await UserAnalyticsService.recordUserLogin('user-id-123');
   * if (result.status === 200) {
   *   console.log('Login tracked successfully');
   * } else if (result.status === 404) {
   *   console.log('User not found');
   * }
   * ```
   */
  static async recordUserLogin(
    userId: string
  ): Promise<{ status: number; message?: string }> {
    try {
      // 1. Validate user ID format
      validateId(userId);

      // 2. Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { status: HttpStatus.NOT_FOUND, message: 'User not found' };
      }

      // 3. Check if analytics record exists
      const analytics = await prisma.analyticsUser.findFirst({
        where: { userId },
      });

      const now = new Date();
      const lastLogin = analytics?.lastLogin;

      if (!analytics) {
        // 4a. Create initial analytics record
        await prisma.analyticsUser.create({
          data: {
            userId,
            lastLogin: now,
            visits: 1,
          },
        });
      } else if (!isSameDay(now, lastLogin)) {
        // 4b. Update existing analytics record
        await prisma.analyticsUser.update({
          where: { id: analytics.id },
          data: {
            lastLogin: now,
            visits: { increment: 1 },
          },
        });
      }

      return { status: HttpStatus.OK, message: 'Login recorded successfully' };
    } catch (error) {
      logError(error, 'UserAnalyticsService.recordUserLogin');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode, message: appError.message };
    }
  }

  /**
   * Record the last movie watched by a user
   *
   * Business logic:
   * 1. Validate user ID
   * 2. Validate movie ID (not empty)
   * 3. Update analytics record with last movie watched
   *
   * Note: This method uses updateMany to handle cases where
   * the analytics record might not exist yet
   *
   * @param userId - User ID
   * @param movieId - Movie ID that was watched
   * @returns Operation result with status
   *
   * @example
   * ```typescript
   * const result = await UserAnalyticsService.recordMovieViewed(
   *   'user-id-123',
   *   'movie-id-456'
   * );
   * if (result.status === 200) {
   *   console.log('Movie viewing tracked');
   * }
   * ```
   */
  static async recordMovieViewed(
    userId: string,
    movieId: string
  ): Promise<{ status: number; message?: string }> {
    try {
      // 1. Validate inputs
      if (!userId?.trim()) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'User ID is required',
        };
      }

      if (!movieId?.trim()) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Movie ID is required',
        };
      }

      // 2. Update analytics with last movie watched
      const updateResult = await prisma.analyticsUser.updateMany({
        where: { userId },
        data: {
          lastMovieWatched: movieId,
        },
      });

      // 3. Check if any record was updated
      if (updateResult.count === 0) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'No analytics record found for this user',
        };
      }

      return { status: HttpStatus.OK, message: 'Movie viewing recorded' };
    } catch (error) {
      logError(error, 'UserAnalyticsService.recordMovieViewed');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode, message: appError.message };
    }
  }

  /**
   * Increment application-wide visit counter
   *
   * Business logic:
   * 1. Check if application analytics record exists
   * 2. If not exists, create initial record with visits = 1
   * 3. If exists, increment visits counter
   *
   * Note: This is a singleton pattern - only one application
   * analytics record should exist at a time
   *
   * @returns Operation result with current visit count
   *
   * @example
   * ```typescript
   * const result = await UserAnalyticsService.incrementApplicationVisits();
   * if (result.status === 200) {
   *   console.log(`Total visits: ${result.visits}`);
   * }
   * ```
   */
  static async incrementApplicationVisits(): Promise<{
    status: number;
    visits?: number;
    message?: string;
  }> {
    try {
      // 1. Get existing application analytics record
      const analytics = await prisma.analyticsApplication.findFirst();

      if (!analytics) {
        // 2a. Create initial record
        const newAnalytics = await prisma.analyticsApplication.create({
          data: {
            visits: 1,
          },
        });

        return {
          status: HttpStatus.OK,
          visits: newAnalytics.visits,
          message: 'Application analytics initialized',
        };
      }

      // 2b. Increment existing record
      const updatedAnalytics = await prisma.analyticsApplication.update({
        where: { id: analytics.id },
        data: {
          visits: { increment: 1 },
        },
      });

      return {
        status: HttpStatus.OK,
        visits: updatedAnalytics.visits,
        message: 'Application visits incremented',
      };
    } catch (error) {
      logError(error, 'UserAnalyticsService.incrementApplicationVisits');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode, message: appError.message };
    }
  }

  /**
   * Get analytics summary for a user
   *
   * Business logic:
   * 1. Validate user ID
   * 2. Fetch all analytics records for user
   * 3. Calculate summary statistics (total visits, last login, etc.)
   *
   * @param userId - User ID to get analytics for
   * @returns Analytics summary with status
   *
   * @example
   * ```typescript
   * const result = await UserAnalyticsService.getUserAnalyticsSummary('user-id-123');
   * if (result.status === 200 && result.summary) {
   *   console.log(`Total visits: ${result.summary.totalVisits}`);
   *   console.log(`Last login: ${result.summary.lastLogin}`);
   * }
   * ```
   */
  static async getUserAnalyticsSummary(userId: string): Promise<{
    status: number;
    summary?: {
      totalVisits: number;
      lastLogin: Date | null;
      lastMovieWatched: string | null;
    };
    message?: string;
  }> {
    try {
      // 1. Validate user ID
      validateId(userId);

      // 2. Fetch analytics records
      const analytics = await prisma.analyticsUser.findMany({
        where: { userId },
        orderBy: { lastLogin: 'desc' },
      });

      if (!analytics || analytics.length === 0) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'No analytics found for this user',
        };
      }

      // 3. Calculate summary
      const totalVisits = analytics.reduce(
        (sum, record) => sum + (record.visits || 0),
        0
      );
      const lastLogin = analytics[0]?.lastLogin || null;
      const lastMovieWatched = analytics[0]?.lastMovieWatched || null;

      return {
        status: HttpStatus.OK,
        summary: {
          totalVisits,
          lastLogin,
          lastMovieWatched,
        },
        message: 'Analytics summary retrieved',
      };
    } catch (error) {
      logError(error, 'UserAnalyticsService.getUserAnalyticsSummary');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode, message: appError.message };
    }
  }

  /**
   * Reset user analytics (admin function)
   *
   * Business logic:
   * 1. Validate user ID
   * 2. Delete all analytics records for user
   *
   * Warning: This is a destructive operation and should only
   * be used by admin users
   *
   * @param userId - User ID to reset analytics for
   * @returns Operation result with status
   *
   * @example
   * ```typescript
   * // Only for admin use
   * const result = await UserAnalyticsService.resetUserAnalytics('user-id-123');
   * if (result.status === 200) {
   *   console.log('User analytics reset successfully');
   * }
   * ```
   */
  static async resetUserAnalytics(userId: string): Promise<{
    status: number;
    message?: string;
  }> {
    try {
      // 1. Validate user ID
      validateId(userId);

      // 2. Delete all analytics records
      await prisma.analyticsUser.deleteMany({
        where: { userId },
      });

      return {
        status: HttpStatus.OK,
        message: 'User analytics reset successfully',
      };
    } catch (error) {
      logError(error, 'UserAnalyticsService.resetUserAnalytics');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode, message: appError.message };
    }
  }
}
