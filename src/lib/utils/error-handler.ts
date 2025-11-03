import { handlePrismaError, logError } from '@/lib/errors';

/**
 * Generic error handling wrapper for async operations
 * Reduces boilerplate try-catch code and centralizes error handling
 *
 * @template T - The type of data returned by the operation
 * @param operation - Async function to execute
 * @param context - Context string for error logging (e.g., function name)
 * @returns Promise with standardized response format
 *
 * @example
 * ```typescript
 * return await withErrorHandling(
 *   async () => await prisma.movie.create({ data }),
 *   'MovieData.create'
 * );
 * ```
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<{ data?: T; status: number; message?: string }> {
  try {
    const data = await operation();
    return { data, status: 200 };
  } catch (error) {
    logError(error, context);
    const appError = handlePrismaError(error);
    return { status: appError.statusCode, message: appError.message };
  }
}
