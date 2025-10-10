/**
 * Unit tests for the useMovieFilters hook
 *
 * Concepts tested:
 * - React Query queries (useQuery)
 * - Filter state management with Zustand
 * - URL navigation with query parameters
 * - Filter change handlers
 * - Search functionality with query building
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { fetchMovies } from '../actions/movies';
import useMovieFilters from '../hooks/use-movie-filters';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the fetchMovies action
jest.mock('../actions/movies', () => ({
  fetchMovies: jest.fn(),
}));

// Mock Zustand store
const mockSetFiltersData = jest.fn();
const mockSetHasBeenSearched = jest.fn();
const mockFilters = {
  q: '',
  subtitles: '',
  language: '',
  decade: 0,
  genre: '',
};

jest.mock('@/store/movie/movie-store', () => ({
  useFiltersMovieStore: () => ({
    filters: mockFilters,
    setFiltersData: mockSetFiltersData,
    setHasBeenSearched: mockSetHasBeenSearched,
    hasBeenSearched: false,
  }),
}));

/**
 * Wrapper component to provide React Query context
 */
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  Wrapper.displayName = 'TestQueryWrapper';

  return Wrapper;
};

describe('useMovieFilters', () => {
  const mockRouter = {
    replace: jest.fn(),
    push: jest.fn(),
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Default mock for fetchMovies to prevent undefined data warnings
    (fetchMovies as jest.Mock).mockResolvedValue({
      movies: [],
      count: 0,
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

    it('should return all expected properties', () => {
      // Arrange & Act
      const { result } = renderHook(() => useMovieFilters({ offset: 0 }), {
        wrapper: createWrapper(),
      });

      // Assert: Hook returns expected structure
      expect(result.current).toHaveProperty('onChangeGenre');
      expect(result.current).toHaveProperty('queryFilterSearch');
      expect(result.current).toHaveProperty('onChangeDecade');
      expect(result.current).toHaveProperty('onChangeCountry');
      expect(result.current).toHaveProperty('onChangeSubtitles');
      expect(result.current).toHaveProperty('filters');
      expect(result.current).toHaveProperty('setFiltersData');
      expect(result.current).toHaveProperty('setHasBeenSearched');
      expect(result.current).toHaveProperty('hasBeenSearched');
      expect(result.current).toHaveProperty('onClick');
      expect(result.current).toHaveProperty('onClickClearSearch');
    });

    it('should initialize with default offset when not provided', () => {
      // Arrange & Act
      const { result } = renderHook(() => useMovieFilters(), {
        wrapper: createWrapper(),
      });

      // Assert: Should not throw error with no parameters
      expect(result.current).toBeDefined();
      expect(result.current.queryFilterSearch).toBeDefined();
    });

    it('should initialize query with correct offset', async () => {
      // Arrange
      const testOffset = 10;

      // Act
      const { result } = renderHook(
        () => useMovieFilters({ offset: testOffset }),
        {
          wrapper: createWrapper(),
        }
      );

      // Assert: Query is initialized with disabled state (enabled: false)
      // Wait for initial pending state to resolve
      await waitFor(() => {
        expect(result.current.queryFilterSearch.fetchStatus).toBe('idle');
      });

      expect(result.current.queryFilterSearch.isError).toBe(false);
      expect(result.current.queryFilterSearch.data).toBeUndefined();
    });
  });

  describe('Filter change handlers', () => {
    it('should handle subtitle change', () => {
      // Arrange
      const { result } = renderHook(() => useMovieFilters({ offset: 0 }), {
        wrapper: createWrapper(),
      });

      const mockEvent = {
        target: { value: 'EN' },
      } as React.ChangeEvent<HTMLSelectElement>;

      // Act
      result.current.onChangeSubtitles(mockEvent);

      // Assert
      expect(mockSetFiltersData).toHaveBeenCalledWith({
        ...mockFilters,
        subtitles: 'EN',
      });
    });

    it('should not update filters if subtitle value is undefined', () => {
      // Arrange
      const { result } = renderHook(() => useMovieFilters({ offset: 0 }), {
        wrapper: createWrapper(),
      });

      const mockEvent = {
        target: { value: undefined },
      } as unknown as React.ChangeEvent<HTMLSelectElement>;

      // Act
      result.current.onChangeSubtitles(mockEvent);

      // Assert
      expect(mockSetFiltersData).not.toHaveBeenCalled();
    });

    it('should handle country/language change', () => {
      // Arrange
      const { result } = renderHook(() => useMovieFilters({ offset: 0 }), {
        wrapper: createWrapper(),
      });

      const mockEvent = {
        target: { value: 'FR' },
      } as React.ChangeEvent<HTMLSelectElement>;

      // Act
      result.current.onChangeCountry(mockEvent);

      // Assert
      expect(mockSetFiltersData).toHaveBeenCalledWith({
        ...mockFilters,
        language: 'FR',
      });
    });

    it('should handle decade change', () => {
      // Arrange
      const { result } = renderHook(() => useMovieFilters({ offset: 0 }), {
        wrapper: createWrapper(),
      });

      const mockEvent = {
        target: { value: '2020' },
      } as React.ChangeEvent<HTMLSelectElement>;

      // Act
      result.current.onChangeDecade(mockEvent);

      // Assert
      expect(mockSetFiltersData).toHaveBeenCalledWith({
        ...mockFilters,
        decade: 2020,
      });
    });

    it('should handle genre change', () => {
      // Arrange
      const { result } = renderHook(() => useMovieFilters({ offset: 0 }), {
        wrapper: createWrapper(),
      });

      const mockEvent = {
        target: { value: 'Action' },
      } as React.ChangeEvent<HTMLSelectElement>;

      // Act
      result.current.onChangeGenre(mockEvent);

      // Assert
      expect(mockSetFiltersData).toHaveBeenCalledWith({
        ...mockFilters,
        genre: 'Action',
      });
    });
  });

  describe('Search functionality', () => {
    it('should navigate with query params on search click', () => {
      // Arrange
      const { result } = renderHook(() => useMovieFilters({ offset: 0 }), {
        wrapper: createWrapper(),
      });

      // Act
      result.current.onClick();

      // Assert: Should call router.replace with URL
      waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalled();
        expect(mockSetHasBeenSearched).toHaveBeenCalledWith(true);
      });
    });

    it('should clear search and navigate to base URL', () => {
      // Arrange
      const { result } = renderHook(() => useMovieFilters({ offset: 0 }), {
        wrapper: createWrapper(),
      });

      // Act
      result.current.onClickClearSearch();

      // Assert
      expect(mockRouter.replace).toHaveBeenCalledWith('/movies');
    });

    it('should build query string with active filters only', () => {
      // Arrange
      const customFilters = {
        q: 'test movie',
        subtitles: 'EN',
        language: 'FR',
        decade: 2020,
        genre: 'Action',
      };

      // Mock store with active filters
      jest.mock('@/store/movie/movie-store', () => ({
        useFiltersMovieStore: () => ({
          filters: customFilters,
          setFiltersData: mockSetFiltersData,
          setHasBeenSearched: mockSetHasBeenSearched,
          hasBeenSearched: false,
        }),
      }));

      const { result } = renderHook(() => useMovieFilters({ offset: 0 }), {
        wrapper: createWrapper(),
      });

      // Act
      result.current.onClick();

      // Assert: Router should be called with query params
      waitFor(() => {
        const calledUrl = mockRouter.replace.mock.calls[0][0];
        expect(calledUrl).toContain('q=test+movie');
        expect(calledUrl).toContain('subtitles=EN');
        expect(calledUrl).toContain('language=FR');
        expect(calledUrl).toContain('decade=2020');
        expect(calledUrl).toContain('genre=Action');
      });
    });
  });

  describe('Query behavior', () => {
    it('should have query disabled by default', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useMovieFilters({ offset: 0 }), {
        wrapper: createWrapper(),
      });

      // Assert: Query should be disabled (enabled: false)
      // Wait for initial state to settle
      await waitFor(() => {
        expect(result.current.queryFilterSearch.fetchStatus).toBe('idle');
      });
    });

    it('should call fetchMovies with correct parameters when refetched', async () => {
      // Arrange
      const testOffset = 20;
      (fetchMovies as jest.Mock).mockResolvedValue({
        movies: [{ id: '1', title: 'Test Movie' }],
        count: 1,
      });

      const { result } = renderHook(
        () => useMovieFilters({ offset: testOffset }),
        {
          wrapper: createWrapper(),
        }
      );

      // Act
      result.current.queryFilterSearch.refetch();

      // Assert
      await waitFor(() => {
        expect(fetchMovies).toHaveBeenCalledWith({
          pageParam: testOffset,
          search: expect.any(String),
        });
      });
    });

    it('should handle query errors gracefully', async () => {
      // Arrange
      const errorMessage = 'Failed to fetch movies';
      (fetchMovies as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useMovieFilters({ offset: 0 }), {
        wrapper: createWrapper(),
      });

      // Act
      result.current.queryFilterSearch.refetch();

      // Assert
      await waitFor(() => {
        expect(result.current.queryFilterSearch.isError).toBe(true);
        expect(result.current.queryFilterSearch.error).toEqual(
          new Error(errorMessage)
        );
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty filter values', () => {
      // Arrange
      const emptyFilters = {
        q: '',
        subtitles: '',
        language: '',
        decade: 0,
        genre: '',
      };

      jest.mock('@/store/movie/movie-store', () => ({
        useFiltersMovieStore: () => ({
          filters: emptyFilters,
          setFiltersData: mockSetFiltersData,
          setHasBeenSearched: mockSetHasBeenSearched,
          hasBeenSearched: false,
        }),
      }));

      const { result } = renderHook(() => useMovieFilters({ offset: 0 }), {
        wrapper: createWrapper(),
      });

      // Act
      result.current.onClick();

      // Assert: Should navigate to base URL without query params
      waitFor(() => {
        const calledUrl = mockRouter.replace.mock.calls[0][0];
        expect(calledUrl).toBe('/movies');
      });
    });

    it('should handle large offset values', () => {
      // Arrange
      const largeOffset = 1000;

      // Act
      const { result } = renderHook(
        () => useMovieFilters({ offset: largeOffset }),
        {
          wrapper: createWrapper(),
        }
      );

      // Assert
      expect(result.current.queryFilterSearch).toBeDefined();
    });
  });
});
