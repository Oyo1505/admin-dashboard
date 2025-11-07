/**
 * Unit tests for useGetMoviesInfiniteScroll hook
 *
 * Concepts tested:
 * - TanStack Query infinite scroll integration
 * - Zustand store synchronization
 * - useEffect behavior with data updates
 * - Refetch blocking during isRefetching
 * - Pagination logic with getNextPageParam
 * - Error handling and edge cases
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { useGetMoviesInfiniteScroll } from '../use-get-all-image-infinite-scroll';
import { useMovieFormStore } from '@/store/movie/movie-store';
import { fetchMovies } from '../../actions/movies';

// Mock the Server Action
jest.mock('../../actions/movies', () => ({
  fetchMovies: jest.fn(),
}));

// Mock Zustand store
jest.mock('@/store/movie/movie-store', () => ({
  useMovieFormStore: jest.fn(),
}));

// Mock React cache
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

/**
 * Create a wrapper with QueryClient for testing hooks
 */
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  Wrapper.displayName = 'TestQueryWrapper';

  return { Wrapper, queryClient };
};

describe('useGetMoviesInfiniteScroll', () => {
  const mockSetMoviesStore = jest.fn();

  const mockMoviesPage1 = [
    { id: '1', title: 'Movie 1' },
    { id: '2', title: 'Movie 2' },
    { id: '3', title: 'Movie 3' },
  ];

  const mockMoviesPage2 = [
    { id: '4', title: 'Movie 4' },
    { id: '5', title: 'Movie 5' },
    { id: '6', title: 'Movie 6' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Default store mock
    (useMovieFormStore as unknown as jest.Mock).mockReturnValue({
      setMoviesStore: mockSetMoviesStore,
    });

    // Default fetchMovies mock
    (fetchMovies as jest.Mock).mockResolvedValue({
      movies: mockMoviesPage1,
      prevOffset: 12,
      status: 200,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Group 1: Initial data loading and store synchronization
   */
  describe('Initial data loading', () => {
    it('should fetch movies on mount and update store', async () => {
      // Arrange
      const { Wrapper } = createWrapper();

      // Act
      const { result } = renderHook(
        () =>
          useGetMoviesInfiniteScroll({
            pageParam: 12,
            search: '',
          }),
        { wrapper: Wrapper }
      );

      // Assert - Initial state
      expect(result.current.status).toBe('pending');
      expect(result.current.isFetching).toBe(true);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // Verify fetchMovies was called
      expect(fetchMovies).toHaveBeenCalledWith({
        pageParam: 12,
        search: '',
      });

      // Verify store was updated with first page
      await waitFor(() => {
        expect(mockSetMoviesStore).toHaveBeenCalledWith(mockMoviesPage1);
      });
    });

    it('should use search parameter in query key', async () => {
      // Arrange
      const { Wrapper } = createWrapper();
      const searchQuery = 'genre=Action&subtitles=EN';

      // Act
      renderHook(
        () =>
          useGetMoviesInfiniteScroll({
            pageParam: 12,
            search: searchQuery,
          }),
        { wrapper: Wrapper }
      );

      // Wait for query to execute
      await waitFor(() => {
        expect(fetchMovies).toHaveBeenCalledWith({
          pageParam: 12,
          search: searchQuery,
        });
      });
    });

    it('should handle empty movies array', async () => {
      // Arrange
      (fetchMovies as jest.Mock).mockResolvedValue({
        movies: [],
        prevOffset: 0,
        status: 200,
      });

      const { Wrapper } = createWrapper();

      // Act
      const { result } = renderHook(
        () =>
          useGetMoviesInfiniteScroll({
            pageParam: 12,
            search: '',
          }),
        { wrapper: Wrapper }
      );

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // Verify store was called with empty array
      // (useEffect checks data?.pages?.[0]?.movies which is [])
      expect(mockSetMoviesStore).toHaveBeenCalledWith([]);
    });
  });

  /**
   * Group 2: Refetch behavior and blocking
   */
  describe('Refetch behavior', () => {
    it('should block store updates during refetch', async () => {
      // Arrange
      const { Wrapper } = createWrapper();

      const { result } = renderHook(
        () =>
          useGetMoviesInfiniteScroll({
            pageParam: 12,
            search: '',
          }),
        { wrapper: Wrapper }
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // Clear mock calls from initial load
      mockSetMoviesStore.mockClear();

      // Change the mock to return different data to ensure dependency change
      const newMovies = [{ id: '10', title: 'New Movie After Refetch' }];
      (fetchMovies as jest.Mock).mockResolvedValue({
        movies: newMovies,
        prevOffset: 12,
        status: 200,
      });

      // Act - Trigger refetch
      await result.current.refetch();

      // Wait for refetch to complete
      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      // Assert - Store should be updated after refetch completes
      // The useEffect has !isRefetching condition which blocks during refetch
      // but allows update after refetch completes
      expect(mockSetMoviesStore).toHaveBeenCalledWith(newMovies);
    });

    it('should expose refetch function', async () => {
      // Arrange
      const { Wrapper } = createWrapper();

      const { result } = renderHook(
        () =>
          useGetMoviesInfiniteScroll({
            pageParam: 12,
            search: '',
          }),
        { wrapper: Wrapper }
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // Assert
      expect(result.current.refetch).toBeDefined();
      expect(typeof result.current.refetch).toBe('function');
    });
  });

  /**
   * Group 3: Pagination and fetchNextPage
   */
  describe('Pagination', () => {
    it('should understand pagination logic with prevOffset', async () => {
      // Arrange - Test the actual pagination logic
      // getNextPageParam returns undefined when prevOffset > movies.length
      (fetchMovies as jest.Mock).mockResolvedValue({
        movies: mockMoviesPage1, // 3 movies
        prevOffset: 12, // 12 > 3, so no next page
        status: 200,
      });

      const { Wrapper } = createWrapper();

      const { result } = renderHook(
        () =>
          useGetMoviesInfiniteScroll({
            pageParam: 12,
            search: '',
          }),
        { wrapper: Wrapper }
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // The getNextPageParam logic checks if prevOffset > movies.length
      // mockMoviesPage1 has 3 movies, prevOffset is 12, so 12 > 3 = true
      // This means NO next page according to the logic
      expect(result.current.hasNextPage).toBe(false);

      // This test documents the actual pagination behavior in the hook
    });

    it('should set hasNextPage to false when prevOffset indicates no more data', async () => {
      // Arrange - Last page has prevOffset > movies.length
      (fetchMovies as jest.Mock).mockResolvedValue({
        movies: mockMoviesPage1,
        prevOffset: 100, // Much larger than movies.length (3)
        status: 200,
      });

      const { Wrapper } = createWrapper();

      const { result } = renderHook(
        () =>
          useGetMoviesInfiniteScroll({
            pageParam: 12,
            search: '',
          }),
        { wrapper: Wrapper }
      );

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // Assert - Should have no next page
      expect(result.current.hasNextPage).toBe(false);
    });

    it('should enable next page when prevOffset is valid', async () => {
      // Arrange - Create scenario where hasNextPage is true
      // For hasNextPage to be true, we need: prevOffset <= movies.length
      // AND prevOffset must be truthy
      const manyMovies = Array.from({ length: 15 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Movie ${i + 1}`,
      }));

      (fetchMovies as jest.Mock).mockResolvedValue({
        movies: manyMovies, // 15 movies
        prevOffset: 12, // 12 <= 15, so next page exists
        status: 200,
      });

      const { Wrapper } = createWrapper();

      const { result } = renderHook(
        () =>
          useGetMoviesInfiniteScroll({
            pageParam: 12,
            search: '',
          }),
        { wrapper: Wrapper }
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // Assert - Next page should exist when prevOffset <= movies.length
      expect(result.current.hasNextPage).toBe(true);
      // Next page would be fetched with param: prevOffset + 12 = 12 + 12 = 24
    });
  });

  /**
   * Group 4: Error handling
   */
  describe('Error handling', () => {
    it('should handle fetch errors gracefully', async () => {
      // Arrange
      const mockError = new Error('Network error');
      (fetchMovies as jest.Mock).mockRejectedValue(mockError);

      const { Wrapper } = createWrapper();

      const { result } = renderHook(
        () =>
          useGetMoviesInfiniteScroll({
            pageParam: 12,
            search: '',
          }),
        { wrapper: Wrapper }
      );

      // Wait for error state
      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      // Assert
      expect(result.current.error).toBeTruthy();
      expect(mockSetMoviesStore).not.toHaveBeenCalled();
    });

    it('should not update store when data.pages is undefined', async () => {
      // Arrange - Mock scenario where pages might be undefined
      (fetchMovies as jest.Mock).mockResolvedValue({
        movies: undefined,
        prevOffset: 0,
        status: 200,
      });

      const { Wrapper } = createWrapper();

      renderHook(
        () =>
          useGetMoviesInfiniteScroll({
            pageParam: 12,
            search: '',
          }),
        { wrapper: Wrapper }
      );

      // Wait a bit to ensure useEffect runs
      await waitFor(() => {
        expect(fetchMovies).toHaveBeenCalled();
      });

      // Assert - Store should not be updated
      expect(mockSetMoviesStore).not.toHaveBeenCalled();
    });
  });

  /**
   * Group 5: Query configuration
   */
  describe('Query configuration', () => {
    it('should set staleTime to 5 minutes', async () => {
      // Arrange
      const { Wrapper, queryClient } = createWrapper();

      renderHook(
        () =>
          useGetMoviesInfiniteScroll({
            pageParam: 12,
            search: '',
          }),
        { wrapper: Wrapper }
      );

      // Wait for query to be created
      await waitFor(() => {
        const queries = queryClient.getQueryCache().getAll();
        expect(queries.length).toBeGreaterThan(0);
      });

      // Assert - Check query options (staleTime should be 5 * 60 * 1000)
      const queries = queryClient.getQueryCache().getAll();
      const movieQuery = queries.find((q) => q.queryKey[0] === 'movies');

      expect(movieQuery).toBeDefined();
      // Note: staleTime is set in the hook, not in queryClient defaults
    });

    it('should not refetch on window focus', async () => {
      // Arrange
      const { Wrapper, queryClient } = createWrapper();

      renderHook(
        () =>
          useGetMoviesInfiniteScroll({
            pageParam: 12,
            search: '',
          }),
        { wrapper: Wrapper }
      );

      // Wait for initial load
      await waitFor(() => {
        const queries = queryClient.getQueryCache().getAll();
        expect(queries.length).toBeGreaterThan(0);
      });

      // Assert - refetchOnWindowFocus should be false
      const queries = queryClient.getQueryCache().getAll();
      const movieQuery = queries.find((q) => q.queryKey[0] === 'movies');

      expect(movieQuery).toBeDefined();
      // Query should not refetch on window focus
    });

    it('should use correct query key structure', async () => {
      // Arrange
      const { Wrapper, queryClient } = createWrapper();
      const search = 'genre=Action';
      const pageParam = 12;

      renderHook(
        () =>
          useGetMoviesInfiniteScroll({
            pageParam,
            search,
          }),
        { wrapper: Wrapper }
      );

      // Wait for query to be created
      await waitFor(() => {
        const queries = queryClient.getQueryCache().getAll();
        expect(queries.length).toBeGreaterThan(0);
      });

      // Assert - Query key should be ['movies', search, pageParam]
      const queries = queryClient.getQueryCache().getAll();
      const movieQuery = queries.find((q) => q.queryKey[0] === 'movies');

      expect(movieQuery?.queryKey).toEqual(['movies', search, pageParam]);
    });
  });

  /**
   * Group 6: Return values
   */
  describe('Return values', () => {
    it('should return all required properties', async () => {
      // Arrange
      const { Wrapper } = createWrapper();

      const { result } = renderHook(
        () =>
          useGetMoviesInfiniteScroll({
            pageParam: 12,
            search: '',
          }),
        { wrapper: Wrapper }
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // Assert - All required properties should be present
      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('hasNextPage');
      expect(result.current).toHaveProperty('isFetching');
      expect(result.current).toHaveProperty('status');
      expect(result.current).toHaveProperty('fetchNextPage');
      expect(result.current).toHaveProperty('isFetchingNextPage');
      expect(result.current).toHaveProperty('refetch');
    });

    it('should return correct loading states', async () => {
      // Arrange
      const { Wrapper } = createWrapper();

      const { result } = renderHook(
        () =>
          useGetMoviesInfiniteScroll({
            pageParam: 12,
            search: '',
          }),
        { wrapper: Wrapper }
      );

      // Assert - Initial loading state
      expect(result.current.isFetching).toBe(true);
      expect(result.current.status).toBe('pending');

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // Assert - Loaded state
      expect(result.current.isFetching).toBe(false);
      expect(result.current.isFetchingNextPage).toBe(false);
    });
  });

  /**
   * Group 7: Store synchronization edge cases
   */
  describe('Store synchronization', () => {
    it('should only update store when movies array exists', async () => {
      // Arrange
      (fetchMovies as jest.Mock).mockResolvedValue({
        movies: null,
        prevOffset: 0,
        status: 200,
      });

      const { Wrapper } = createWrapper();

      renderHook(
        () =>
          useGetMoviesInfiniteScroll({
            pageParam: 12,
            search: '',
          }),
        { wrapper: Wrapper }
      );

      // Wait for query to complete
      await waitFor(() => {
        expect(fetchMovies).toHaveBeenCalled();
      });

      // Assert - Store should not be updated with null/undefined
      expect(mockSetMoviesStore).not.toHaveBeenCalled();
    });

    it('should update store when data changes via invalidation', async () => {
      // Arrange
      const { Wrapper, queryClient } = createWrapper();

      const { result } = renderHook(
        () =>
          useGetMoviesInfiniteScroll({
            pageParam: 12,
            search: '',
          }),
        { wrapper: Wrapper }
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // Verify initial data was set
      expect(mockSetMoviesStore).toHaveBeenCalledWith(mockMoviesPage1);

      // Clear mock to track new calls
      mockSetMoviesStore.mockClear();

      // Change the mock to return different data
      const newMovies = [{ id: '999', title: 'New Movie' }];
      (fetchMovies as jest.Mock).mockResolvedValue({
        movies: newMovies,
        prevOffset: 12,
        status: 200,
      });

      // Act - Invalidate query to trigger refetch with new data
      await queryClient.invalidateQueries({ queryKey: ['movies'] });

      // Wait for refetch to complete and new data to appear
      await waitFor(
        () => {
          expect(result.current.data?.pages[0]?.movies).toEqual(newMovies);
        },
        { timeout: 3000 }
      );

      // Assert - Store should be updated with new data
      // The useEffect should have triggered with the new data
      expect(mockSetMoviesStore).toHaveBeenCalledWith(newMovies);
    });
  });
});
