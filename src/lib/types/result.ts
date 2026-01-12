/**
 * Standardized result types for data layer operations
 * Ensures consistent return types across all data access methods
 */

/**
 * Standard result type for single data operations
 * @template T - The type of data being returned
 */
export interface DataResult<T> {
  data?: T;
  status: number;
  message?: string;
}

/**
 * Standard result type for list/collection operations
 * @template T - The type of items in the collection
 */
export interface ListResult<T> {
  items: T[];
  status: number;
  total?: number;
  message?: string;
  nextCursor?: string;
}

/**
 * Standard result type for operations that only need status
 */
export interface StatusResult {
  status: number;
  message?: string;
}

/**
 * Standard result type for paginated data
 * @template T - The type of items in the page
 */
export interface PaginatedResult<T> {
  items: T[];
  status: number;
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  message?: string;
}
