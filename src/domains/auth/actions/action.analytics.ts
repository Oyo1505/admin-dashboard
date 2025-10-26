'use server';
import { UserAnalyticsService } from '../services';

/**
 * User Analytics Actions
 *
 * These are Server Actions that serve as Controllers for user analytics.
 * They delegate business logic to UserAnalyticsService.
 *
 * Architecture:
 * - Actions (this file): HTTP validation + orchestration
 * - Service: Business logic (analytics tracking)
 * - Adapter (lib/data/analytics.ts): Database access
 */

/**
 * Track user login event
 *
 * Controller action that delegates to UserAnalyticsService
 * Updates last login timestamp and increments visit counter
 *
 * @param userId - User ID to track login for
 * @returns Operation result with status
 *
 * @example
 * ```typescript
 * const result = await updateAnalyticsLastLogin('user-id-123');
 * if (result.status === 200) {
 *   console.log('Login tracked successfully');
 * }
 * ```
 */
export const updateAnalyticsLastLogin = async (
  userId: string
): Promise<{ status?: number | undefined; message?: string | undefined }> => {
  // Delegate to Service for business logic
  return await UserAnalyticsService.recordUserLogin(userId);
};

/**
 * Track last movie watched by user
 *
 * Controller action that delegates to UserAnalyticsService
 * Records which movie the user last viewed
 *
 * @param userId - User ID
 * @param lastMovieWatched - Movie ID that was watched
 * @returns Operation result with status
 *
 * @example
 * ```typescript
 * const result = await updateAnalyticsLastMovieWatched('user-id', 'movie-id');
 * if (result.status === 200) {
 *   console.log('Movie viewing tracked');
 * }
 * ```
 */
export const updateAnalyticsLastMovieWatched = async (
  userId: string,
  lastMovieWatched: string
): Promise<{ status?: number | undefined; message?: string | undefined }> => {
  // Delegate to Service for business logic
  return await UserAnalyticsService.recordMovieViewed(userId, lastMovieWatched);
};

/**
 * Increment application-wide visit counter
 *
 * Controller action that delegates to UserAnalyticsService
 * Tracks total application visits across all users
 *
 * @returns Operation result with current visit count
 *
 * @example
 * ```typescript
 * const result = await updateAnalyticsApplicationVisits();
 * if (result.status === 200) {
 *   console.log(`Total visits: ${result.visits}`);
 * }
 * ```
 */
export const updateAnalyticsApplicationVisits = async (): Promise<{
  status?: number | undefined;
  visits?: number | undefined;
  message?: string | undefined;
}> => {
  // Delegate to Service for business logic
  return await UserAnalyticsService.incrementApplicationVisits();
};
