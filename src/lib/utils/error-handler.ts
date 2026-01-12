import { handlePrismaError, logError } from '@/lib/errors';
import HttpStatus from '@/shared/constants/httpStatus';

/**
 * Generic error handling wrapper for async operations
 * Reduces boilerplate try-catch code and centralizes error handling
 *
 * @template T - The type of data returned by the operation
 * @param operation - Async function to execute
 * @param context - Context string for error logging (e.g., function name)
 * @param successTransform - Optional function to transform successful result
 * @returns Promise with standardized response format
 *
 * @example
 * ```typescript
 * // Default usage - returns { data, status: 200 }
 * return await withErrorHandling(
 *   async () => await prisma.movie.create({ data }),
 *   'MovieData.create'
 * );
 *
 * // Custom success transform - returns { status: 200 }
 * return await withErrorHandling(
 *   async () => await prisma.movie.delete({ where: { id } }),
 *   'MovieData.delete',
 *   () => ({ status: HttpStatus.OK })
 * );
 * ```
 */
export async function withErrorHandling<T, R = { data?: T; status: number; message?: string }>(
  operation: () => Promise<T>,
  context: string,
  successTransform?: (result: T) => R
): Promise<R | { status: number; message?: string }> {
  try {
    const result = await operation();
    return successTransform
      ? successTransform(result)
      : ({ data: result, status: HttpStatus.OK } as R);
  } catch (error) {
    logError(error, context);
    const appError = handlePrismaError(error);
    return { status: appError.statusCode, message: appError.message };
  }
}

/**
 * Alias for Prisma-specific error handling
 * @see withErrorHandling
 */
export const withPrismaErrorHandling = withErrorHandling;
