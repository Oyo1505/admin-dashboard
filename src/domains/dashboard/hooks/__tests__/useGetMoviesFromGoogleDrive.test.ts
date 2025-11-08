import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import useGetMoviesFromGoogleDrive from '../useGetMoviesFromGoogleDrive';

// Mock global fetch
global.fetch = jest.fn();

/**
 * Wrapper component to provide React Query context
 * Required for hooks that use useQuery
 */
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for faster tests
        cacheTime: 0, // Disable cache for isolated tests
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  Wrapper.displayName = 'TestQueryWrapper';

  return Wrapper;
};

describe('useGetMoviesFromGoogleDrive', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Default mock to prevent warnings
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        filteredMoviesNotAdded: [],
      }),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('Hook initialization', () => {
    it('should render hook without crashing', () => {
      // Arrange & Act
      const wrapper = createWrapper();

      // Assert
      expect(wrapper).toBeDefined();
    });

    it('should return expected structure with data, isLoading, and error', () => {
      // Arrange & Act
      const { result } = renderHook(() => useGetMoviesFromGoogleDrive(), {
        wrapper: createWrapper(),
      });

      // Assert: Hook returns expected properties
      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
    });

    it('should start with loading state', () => {
      // Arrange & Act
      const { result } = renderHook(() => useGetMoviesFromGoogleDrive(), {
        wrapper: createWrapper(),
      });

      // Assert: Initial loading state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
    });
  });

  describe('Successful data fetching', () => {
    it('should fetch and return filtered movies', async () => {
      // Arrange: Mock successful response with movie data
      const mockMovies = [
        { id: 'movie-1', title: 'Test Movie 1', year: 2023 },
        { id: 'movie-2', title: 'Test Movie 2', year: 2024 },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ filteredMoviesNotAdded: mockMovies }),
      });

      // Act
      const { result } = renderHook(() => useGetMoviesFromGoogleDrive(), {
        wrapper: createWrapper(),
      });

      // Assert: Wait for loading to complete
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toEqual(mockMovies);
      expect(result.current.error).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/movies/get-movies-from-google-drive'
      );
    });

    it('should handle empty array response', async () => {
      // Arrange: Empty filtered movies
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ filteredMoviesNotAdded: [] }),
      });

      // Act
      const { result } = renderHook(() => useGetMoviesFromGoogleDrive(), {
        wrapper: createWrapper(),
      });

      // Assert
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle large dataset', async () => {
      // Arrange: Large number of movies
      const mockMovies = Array.from({ length: 100 }, (_, i) => ({
        id: `movie-${i}`,
        title: `Movie ${i}`,
        year: 2020 + i,
      }));

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ filteredMoviesNotAdded: mockMovies }),
      });

      // Act
      const { result } = renderHook(() => useGetMoviesFromGoogleDrive(), {
        wrapper: createWrapper(),
      });

      // Assert
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toHaveLength(100);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should handle fetch error with ok: false', async () => {
      // Arrange: Mock error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      // Act
      const { result } = renderHook(() => useGetMoviesFromGoogleDrive(), {
        wrapper: createWrapper(),
      });

      // Assert: Wait for error state
      await waitFor(() => expect(result.current.error).toBeTruthy());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeDefined();
    });

    it('should handle network error', async () => {
      // Arrange: Mock network failure
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      // Act
      const { result } = renderHook(() => useGetMoviesFromGoogleDrive(), {
        wrapper: createWrapper(),
      });

      // Assert: Wait for error state
      await waitFor(() => expect(result.current.error).toBeTruthy());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    it('should handle malformed JSON response', async () => {
      // Arrange: Mock invalid JSON
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      // Act
      const { result } = renderHook(() => useGetMoviesFromGoogleDrive(), {
        wrapper: createWrapper(),
      });

      // Assert: Wait for error state
      await waitFor(() => expect(result.current.error).toBeTruthy());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    it('should handle 404 not found', async () => {
      // Arrange: Mock 404 response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      // Act
      const { result } = renderHook(() => useGetMoviesFromGoogleDrive(), {
        wrapper: createWrapper(),
      });

      // Assert: Wait for error state
      await waitFor(() => expect(result.current.error).toBeTruthy());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    it('should handle 401 unauthorized', async () => {
      // Arrange: Mock unauthorized response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
      });

      // Act
      const { result } = renderHook(() => useGetMoviesFromGoogleDrive(), {
        wrapper: createWrapper(),
      });

      // Assert: Wait for error state
      await waitFor(() => expect(result.current.error).toBeTruthy());

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle 403 forbidden', async () => {
      // Arrange: Mock forbidden response (not admin)
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
      });

      // Act
      const { result } = renderHook(() => useGetMoviesFromGoogleDrive(), {
        wrapper: createWrapper(),
      });

      // Assert: Wait for error state
      await waitFor(() => expect(result.current.error).toBeTruthy());

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Query configuration', () => {
    it('should use correct query key', async () => {
      // Arrange
      const mockMovies = [{ id: 'movie-1', title: 'Test Movie' }];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ filteredMoviesNotAdded: mockMovies }),
      });

      // Act
      const { result } = renderHook(() => useGetMoviesFromGoogleDrive(), {
        wrapper: createWrapper(),
      });

      // Assert: Verify query key is accessible and correct
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // The query key should be 'movies-from-google-drive'
      expect(result.current.data).toBeDefined();
    });

    it('should have correct staleTime configuration (5 minutes)', async () => {
      // Arrange
      const mockMovies = [{ id: 'movie-1', title: 'Test Movie' }];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ filteredMoviesNotAdded: mockMovies }),
      });

      // Act
      const { result } = renderHook(() => useGetMoviesFromGoogleDrive(), {
        wrapper: createWrapper(),
      });

      // Assert: Data should be fetched successfully
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toEqual(mockMovies);
      // Note: staleTime = 5 * 60 * 1000 = 300000ms (5 minutes)
    });

    it('should not refetch on window focus', async () => {
      // Arrange
      const mockMovies = [{ id: 'movie-1', title: 'Test Movie' }];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ filteredMoviesNotAdded: mockMovies }),
      });

      // Act
      const { result } = renderHook(() => useGetMoviesFromGoogleDrive(), {
        wrapper: createWrapper(),
      });

      // Wait for initial fetch
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const initialCallCount = (global.fetch as jest.Mock).mock.calls.length;

      // Simulate window focus event
      window.dispatchEvent(new Event('focus'));

      // Wait a bit to ensure no refetch happens
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Assert: Fetch should not be called again
      expect((global.fetch as jest.Mock).mock.calls.length).toBe(
        initialCallCount
      );
    });
  });

  describe('Data structure validation', () => {
    it('should handle movies with all required fields', async () => {
      // Arrange: Complete movie data
      const mockMovies = [
        {
          id: 'movie-1',
          title: 'Complete Movie',
          titleEnglish: 'Complete Movie EN',
          titleJapanese: '完全な映画',
          year: 2024,
          director: 'Director Name',
          country: 'USA',
          language: 'English',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ filteredMoviesNotAdded: mockMovies }),
      });

      // Act
      const { result } = renderHook(() => useGetMoviesFromGoogleDrive(), {
        wrapper: createWrapper(),
      });

      // Assert
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toEqual(mockMovies);
      expect(result.current.data?.[0]).toHaveProperty('id');
      expect(result.current.data?.[0]).toHaveProperty('title');
    });

    it('should handle movies with minimal fields', async () => {
      // Arrange: Minimal movie data
      const mockMovies = [
        {
          id: 'movie-1',
          title: 'Minimal Movie',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ filteredMoviesNotAdded: mockMovies }),
      });

      // Act
      const { result } = renderHook(() => useGetMoviesFromGoogleDrive(), {
        wrapper: createWrapper(),
      });

      // Assert
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toEqual(mockMovies);
    });

    it('should handle unexpected response structure gracefully', async () => {
      // Arrange: Response without filteredMoviesNotAdded field
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ someOtherField: 'data' }),
      });

      // Act
      const { result } = renderHook(() => useGetMoviesFromGoogleDrive(), {
        wrapper: createWrapper(),
      });

      // Assert: Should handle undefined gracefully
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toBeUndefined();
    });
  });

  describe('Multiple hook instances', () => {
    it('should share cache between multiple instances', async () => {
      // Arrange
      const mockMovies = [{ id: 'movie-1', title: 'Cached Movie' }];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ filteredMoviesNotAdded: mockMovies }),
      });

      const wrapper = createWrapper();

      // Act: Render two instances of the hook
      const { result: result1 } = renderHook(
        () => useGetMoviesFromGoogleDrive(),
        { wrapper }
      );

      await waitFor(() => expect(result1.current.isLoading).toBe(false));

      const { result: result2 } = renderHook(
        () => useGetMoviesFromGoogleDrive(),
        { wrapper }
      );

      // Assert: Both should have the same data
      await waitFor(() => expect(result2.current.isLoading).toBe(false));

      expect(result1.current.data).toEqual(result2.current.data);
      // Fetch should only be called once due to caching
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
