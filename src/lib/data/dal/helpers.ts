import { DALError } from './core/errors';

/**
 * Higher-order function to wrap actions with DAL error handling
 * Automatically catches DALError and converts to appropriate HTTP response
 *
 * @param authCheck - Optional auth verification function to run before handler
 * @param handler - The actual action handler function
 * @returns Wrapped function with error handling
 *
 * @example
 * ```typescript
 * export const addMovie = withDALAuth(
 *   verifyAdmin,
 *   async (movie: IMovieFormData) => {
 *     return await MovieService.addMovie(movie);
 *   }
 * );
 * ```
 */
export function withDALAuth<TArgs extends any[], TReturn>(
  authCheck: (...args: TArgs) => Promise<any>,
  handler: (...args: TArgs) => Promise<TReturn>
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      await authCheck(...args);
      return await handler(...args);
    } catch (error) {
      if (error instanceof DALError) {
        return {
          status: error.toHTTPStatus(),
          message: error.message,
        } as TReturn;
      }
      // Re-throw non-DAL errors to be handled by global error handler
      throw error;
    }
  };
}

/**
 * Simplified version when auth check doesn't need args
 *
 * @example
 * ```typescript
 * export const addMovie = withAuth(
 *   verifyAdmin,
 *   async (movie: IMovieFormData) => {
 *     return await MovieService.addMovie(movie);
 *   }
 * );
 * ```
 */
export function withAuth<TArgs extends any[], TReturn>(
  authCheck: () => Promise<any>,
  handler: (...args: TArgs) => Promise<TReturn>
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      await authCheck();
      return await handler(...args);
    } catch (error) {
      if (error instanceof DALError) {
        return {
          status: error.toHTTPStatus(),
          message: error.message,
        } as TReturn;
      }
      throw error;
    }
  };
}
