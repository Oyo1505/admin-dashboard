/**
 * Reusable helper utilities for TanStack Query hooks
 * Reduces boilerplate in custom hooks
 */

/**
 * Generic fetch wrapper for API calls in TanStack Query
 * Handles response validation and error throwing
 *
 * @template T - The expected response type
 * @param endpoint - The API endpoint to fetch
 * @returns Promise resolving to the response data
 * @throws Error if the response is not ok
 *
 * @example
 * ```typescript
 * const getAnalyticsVisits = useQuery({
 *   queryKey: ['analytics-visits'],
 *   queryFn: () => fetchApi<{ visits: number }>('/api/analytics/get-analytics-application-visits'),
 *   select: (data) => data.visits,
 * });
 * ```
 */
export async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(endpoint);

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Generic POST request wrapper for API calls
 *
 * @template TData - The request body type
 * @template TResponse - The expected response type
 * @param endpoint - The API endpoint to POST to
 * @param data - The data to send in the request body
 * @returns Promise resolving to the response data
 * @throws Error if the response is not ok
 */
export async function postApi<TData, TResponse>(
  endpoint: string,
  data: TData
): Promise<TResponse> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to POST ${endpoint}: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Generic PUT request wrapper for API calls
 *
 * @template TData - The request body type
 * @template TResponse - The expected response type
 * @param endpoint - The API endpoint to PUT to
 * @param data - The data to send in the request body
 * @returns Promise resolving to the response data
 * @throws Error if the response is not ok
 */
export async function putApi<TData, TResponse>(
  endpoint: string,
  data: TData
): Promise<TResponse> {
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to PUT ${endpoint}: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Generic DELETE request wrapper for API calls
 *
 * @template TResponse - The expected response type
 * @param endpoint - The API endpoint to DELETE
 * @returns Promise resolving to the response data
 * @throws Error if the response is not ok
 */
export async function deleteApi<TResponse = void>(endpoint: string): Promise<TResponse> {
  const response = await fetch(endpoint, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to DELETE ${endpoint}: ${response.status} ${errorText}`);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json();
}
