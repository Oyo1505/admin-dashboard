/**
 * Unit tests for the Movies component
 *
 * Concepts tested:
 * - useSearchParams hook integration with URL filters
 * - TanStack Query infinite scroll integration
 * - Movie store state management
 * - Conditional rendering based on filter state
 * - Load more functionality
 * - Loading states and error handling
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import Movies from '../movies';
import { useMovieFormStore } from '@/store/movie/movie-store';
import useUserStore from '@/store/user/user-store';
import { useGetMoviesInfiniteScroll } from '../../../hooks/use-get-all-image-infinite-scroll';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => `translated.${key}`,
}));

// Mock next/dynamic for LoadingSpinner
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => <div>Loading...</div>;
  DynamicComponent.displayName = 'LoadingSpinner';
  return DynamicComponent;
});

// Mock movie card components - must be before imports
jest.mock(
  '../../movie-card_search-page/movie-card_search-page',
  () =>
    function MovieCardSearchPage({ movie }: { movie: { title: string } }) {
      return <div data-testid="movie-card-desktop">{movie.title}</div>;
    }
);

jest.mock(
  '../../movie-card-mobile-view_search-page/movie-card-mobile-view_search-page',
  () =>
    function MovieCardMobileView({ movie }: { movie: { title: string } }) {
      return <div data-testid="movie-card-mobile">{movie.title}</div>;
    }
);

// Mock the infinite scroll hook
jest.mock('../../../hooks/use-get-all-image-infinite-scroll', () => ({
  useGetMoviesInfiniteScroll: jest.fn(),
}));

// Mock Zustand stores
jest.mock('@/store/movie/movie-store', () => ({
  useMovieFormStore: jest.fn(),
}));

jest.mock('@/store/user/user-store', () => ({
  __esModule: true,
  default: jest.fn(),
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

describe('Movies Component', () => {
  const mockSetMoviesStore = jest.fn();
  const mockFetchNextPage = jest.fn();

  const mockMovies = [
    { id: '1', title: 'Movie 1' },
    { id: '2', title: 'Movie 2' },
    { id: '3', title: 'Movie 3' },
  ];

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    role: 'USER',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default search params mock (empty)
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => null),
      size: 0,
      toString: jest.fn(() => ''),
    });

    // Default movie store mock
    (useMovieFormStore as unknown as jest.Mock).mockReturnValue({
      moviesFromStore: [],
      setMoviesStore: mockSetMoviesStore,
    });

    // Default user store mock
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
    });

    // Default infinite scroll hook mock
    (useGetMoviesInfiniteScroll as jest.Mock).mockReturnValue({
      data: null,
      isFetching: false,
      status: 'pending',
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      isFetchingNextPage: false,
    });
  });

  /**
   * Group 1: Component rendering and loading states
   */
  describe('Component rendering', () => {
    it('should show loading spinner when status is pending and fetching', () => {
      // Arrange
      (useGetMoviesInfiniteScroll as jest.Mock).mockReturnValue({
        data: null,
        isFetching: true,
        status: 'pending',
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: false,
      });

      // Act
      render(<Movies offset={12} />, { wrapper: createWrapper() });

      // Assert
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show "No Movie" message when movies array is empty', () => {
      // Arrange
      (useGetMoviesInfiniteScroll as jest.Mock).mockReturnValue({
        data: { pages: [{ movies: [] }] },
        isFetching: false,
        status: 'success',
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: false,
      });

      (useMovieFormStore as unknown as jest.Mock).mockReturnValue({
        moviesFromStore: [],
        setMoviesStore: mockSetMoviesStore,
      });

      // Act
      render(<Movies offset={12} />, { wrapper: createWrapper() });

      // Assert
      expect(screen.getByText('translated.NoMovie')).toBeInTheDocument();
    });

    it('should render movies when data is available', () => {
      // Arrange
      (useGetMoviesInfiniteScroll as jest.Mock).mockReturnValue({
        data: { pages: [{ movies: mockMovies }] },
        isFetching: false,
        status: 'success',
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: false,
      });

      (useMovieFormStore as unknown as jest.Mock).mockReturnValue({
        moviesFromStore: mockMovies,
        setMoviesStore: mockSetMoviesStore,
      });

      // Act
      render(<Movies offset={12} viewport="desktop" />, {
        wrapper: createWrapper(),
      });

      // Assert
      expect(screen.getByText('Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Movie 2')).toBeInTheDocument();
      expect(screen.getByText('Movie 3')).toBeInTheDocument();
    });
  });

  /**
   * Group 2: Search params and query string generation
   */
  describe('Search params handling', () => {
    it('should build query string from URL search params', () => {
      // Arrange
      const mockSearchParams = {
        get: jest.fn((key: string) => {
          const params: Record<string, string> = {
            subtitles: 'EN',
            language: 'FR',
            decade: '2020',
            genre: 'Action',
            q: 'test',
          };
          return params[key] || null;
        }),
        size: 5,
        toString: jest.fn(() => 'subtitles=EN&language=FR'),
      };

      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      // Act
      render(<Movies offset={12} />, { wrapper: createWrapper() });

      // Assert: useGetMoviesInfiniteScroll should be called with formatted query
      expect(useGetMoviesInfiniteScroll).toHaveBeenCalledWith({
        pageParam: 12,
        search: expect.stringContaining('subtitles=EN'),
      });
    });

    it('should handle empty search params', () => {
      // Arrange: Empty params
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn(() => null),
        size: 0,
        toString: jest.fn(() => ''),
      });

      // Act
      render(<Movies offset={12} />, { wrapper: createWrapper() });

      // Assert
      expect(useGetMoviesInfiniteScroll).toHaveBeenCalledWith({
        pageParam: 12,
        search: '',
      });
    });

    it('should correctly identify hasFilters from search params size', () => {
      // Arrange: With filters
      const mockSearchParamsWithFilters = {
        get: jest.fn((key: string) => (key === 'subtitles' ? 'EN' : null)),
        size: 1, // Has filters
        toString: jest.fn(() => 'subtitles=EN'),
      };

      (useSearchParams as jest.Mock).mockReturnValue(
        mockSearchParamsWithFilters
      );

      (useGetMoviesInfiniteScroll as jest.Mock).mockReturnValue({
        data: {
          pages: [
            { movies: [] },
            { movies: mockMovies }, // Latest page with filters
          ],
        },
        isFetching: false,
        status: 'success',
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: false,
      });

      // Act
      render(<Movies offset={12} />, { wrapper: createWrapper() });

      // Assert: Should set movies from last page when hasFilters is true
      waitFor(() => {
        expect(mockSetMoviesStore).toHaveBeenCalledWith(mockMovies);
      });
    });
  });

  /**
   * Group 3: Movie store synchronization
   *
   * Note: Store synchronization from hook data is tested in use-get-all-image-infinite-scroll.test.tsx
   * Component tests focus on user interactions and rendering based on store state
   */
  describe('Movie store synchronization', () => {
    it('should render movies from store state', () => {
      // Arrange
      (useMovieFormStore as unknown as jest.Mock).mockReturnValue({
        moviesFromStore: mockMovies,
        setMoviesStore: mockSetMoviesStore,
      });

      (useGetMoviesInfiniteScroll as jest.Mock).mockReturnValue({
        data: { pages: [{ movies: mockMovies }] },
        isFetching: false,
        status: 'success',
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: false,
      });

      // Act
      render(<Movies offset={12} />, { wrapper: createWrapper() });

      // Assert: Component renders based on store state
      expect(screen.getByText('Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Movie 2')).toBeInTheDocument();
      expect(screen.getByText('Movie 3')).toBeInTheDocument();
    });
  });

  /**
   * Group 4: Load more functionality
   */
  describe('Load more functionality', () => {
    it('should show load more button when hasNextPage is true', () => {
      // Arrange
      (useGetMoviesInfiniteScroll as jest.Mock).mockReturnValue({
        data: { pages: [{ movies: mockMovies }] },
        isFetching: false,
        status: 'success',
        hasNextPage: true, // More pages available
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: false,
      });

      (useMovieFormStore as unknown as jest.Mock).mockReturnValue({
        moviesFromStore: mockMovies.concat(Array(10).fill(mockMovies[0])), // 13 movies
        setMoviesStore: mockSetMoviesStore,
      });

      // Act
      render(<Movies offset={12} />, { wrapper: createWrapper() });

      // Assert
      expect(screen.getByText('translated.btnLoadMore')).toBeInTheDocument();
    });

    it('should not show load more button when hasNextPage is false', () => {
      // Arrange
      (useGetMoviesInfiniteScroll as jest.Mock).mockReturnValue({
        data: { pages: [{ movies: mockMovies }] },
        isFetching: false,
        status: 'success',
        hasNextPage: false, // No more pages
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: false,
      });

      (useMovieFormStore as unknown as jest.Mock).mockReturnValue({
        moviesFromStore: mockMovies,
        setMoviesStore: mockSetMoviesStore,
      });

      // Act
      render(<Movies offset={12} />, { wrapper: createWrapper() });

      // Assert
      expect(
        screen.queryByText('translated.btnLoadMore')
      ).not.toBeInTheDocument();
    });

    it('should call fetchNextPage when load more button is clicked', async () => {
      // Arrange
      mockFetchNextPage.mockResolvedValue({
        data: {
          pages: [
            { movies: mockMovies },
            { movies: [{ id: '4', title: 'Movie 4' }] },
          ],
        },
      });

      (useGetMoviesInfiniteScroll as jest.Mock).mockReturnValue({
        data: { pages: [{ movies: mockMovies }] },
        isFetching: false,
        status: 'success',
        hasNextPage: true,
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: false,
      });

      (useMovieFormStore as unknown as jest.Mock).mockReturnValue({
        moviesFromStore: mockMovies.concat(Array(10).fill(mockMovies[0])),
        setMoviesStore: mockSetMoviesStore,
      });

      // Act
      render(<Movies offset={12} />, { wrapper: createWrapper() });

      const loadMoreButton = screen.getByText('translated.btnLoadMore');
      fireEvent.click(loadMoreButton);

      // Assert
      await waitFor(() => {
        expect(mockFetchNextPage).toHaveBeenCalledTimes(1);
      });
    });

    it('should not show load more button when movies count is less than 12', () => {
      // Arrange
      (useGetMoviesInfiniteScroll as jest.Mock).mockReturnValue({
        data: { pages: [{ movies: mockMovies }] },
        isFetching: false,
        status: 'success',
        hasNextPage: true,
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: false,
      });

      (useMovieFormStore as unknown as jest.Mock).mockReturnValue({
        moviesFromStore: mockMovies, // Only 3 movies (< 12)
        setMoviesStore: mockSetMoviesStore,
      });

      // Act
      render(<Movies offset={12} />, { wrapper: createWrapper() });

      // Assert: Button should not show when < 12 movies
      expect(
        screen.queryByText('translated.btnLoadMore')
      ).not.toBeInTheDocument();
    });
  });

  /**
   * Group 5: Viewport rendering
   */
  describe('Viewport rendering', () => {
    it('should render desktop cards when viewport is desktop', () => {
      // Arrange
      (useGetMoviesInfiniteScroll as jest.Mock).mockReturnValue({
        data: { pages: [{ movies: mockMovies }] },
        isFetching: false,
        status: 'success',
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: false,
      });

      (useMovieFormStore as unknown as jest.Mock).mockReturnValue({
        moviesFromStore: mockMovies,
        setMoviesStore: mockSetMoviesStore,
      });

      // Act
      render(<Movies offset={12} viewport="desktop" />, {
        wrapper: createWrapper(),
      });

      // Assert
      const desktopCards = screen.getAllByTestId('movie-card-desktop');
      expect(desktopCards).toHaveLength(3);
      expect(screen.queryByTestId('movie-card-mobile')).not.toBeInTheDocument();
    });

    it('should render tablet cards when viewport is tablet', () => {
      // Arrange
      (useGetMoviesInfiniteScroll as jest.Mock).mockReturnValue({
        data: { pages: [{ movies: mockMovies }] },
        isFetching: false,
        status: 'success',
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: false,
      });

      (useMovieFormStore as unknown as jest.Mock).mockReturnValue({
        moviesFromStore: mockMovies,
        setMoviesStore: mockSetMoviesStore,
      });

      // Act
      render(<Movies offset={12} viewport="tablet" />, {
        wrapper: createWrapper(),
      });

      // Assert: Tablet uses desktop card component
      const desktopCards = screen.getAllByTestId('movie-card-desktop');
      expect(desktopCards).toHaveLength(3);
    });

    it('should render mobile cards when viewport is mobile', () => {
      // Arrange
      (useGetMoviesInfiniteScroll as jest.Mock).mockReturnValue({
        data: { pages: [{ movies: mockMovies }] },
        isFetching: false,
        status: 'success',
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: false,
      });

      (useMovieFormStore as unknown as jest.Mock).mockReturnValue({
        moviesFromStore: mockMovies,
        setMoviesStore: mockSetMoviesStore,
      });

      // Act
      render(<Movies offset={12} viewport="mobile" />, {
        wrapper: createWrapper(),
      });

      // Assert
      const mobileCards = screen.getAllByTestId('movie-card-mobile');
      expect(mobileCards).toHaveLength(3);
      expect(
        screen.queryByTestId('movie-card-desktop')
      ).not.toBeInTheDocument();
    });
  });

  /**
   * Group 6: Edge cases
   */
  describe('Edge cases', () => {
    it('should handle movies without titles gracefully', () => {
      // Arrange: Movies with missing titles
      const moviesWithoutTitles = [
        { id: '1', title: 'Movie 1' },
        { id: '2', title: null }, // No title
        { id: '3', title: 'Movie 3' },
      ];

      (useGetMoviesInfiniteScroll as jest.Mock).mockReturnValue({
        data: { pages: [{ movies: moviesWithoutTitles }] },
        isFetching: false,
        status: 'success',
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: false,
      });

      (useMovieFormStore as unknown as jest.Mock).mockReturnValue({
        moviesFromStore: moviesWithoutTitles,
        setMoviesStore: mockSetMoviesStore,
      });

      // Act
      render(<Movies offset={12} viewport="desktop" />, {
        wrapper: createWrapper(),
      });

      // Assert: Only movies with titles should render
      expect(screen.getByText('Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Movie 3')).toBeInTheDocument();
      const desktopCards = screen.getAllByTestId('movie-card-desktop');
      expect(desktopCards).toHaveLength(2); // Not 3
    });

    it('should show loading spinner when fetching next page with non-success status', () => {
      // Arrange
      (useGetMoviesInfiniteScroll as jest.Mock).mockReturnValue({
        data: { pages: [{ movies: mockMovies }] },
        isFetching: false,
        status: 'pending', // Non-success status
        hasNextPage: true,
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: true, // Fetching next page
      });

      (useMovieFormStore as unknown as jest.Mock).mockReturnValue({
        moviesFromStore: mockMovies.concat(Array(10).fill(mockMovies[0])),
        setMoviesStore: mockSetMoviesStore,
      });

      // Act
      render(<Movies offset={12} />, { wrapper: createWrapper() });

      // Assert: Loading spinner should be visible when isFetchingNextPage && status !== 'success'
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(
        screen.queryByText('translated.btnLoadMore')
      ).not.toBeInTheDocument();
    });

    it('should handle data with undefined pages gracefully', async () => {
      // Arrange
      mockFetchNextPage.mockResolvedValue({
        data: undefined, // No data returned
      });

      (useGetMoviesInfiniteScroll as jest.Mock).mockReturnValue({
        data: { pages: [{ movies: mockMovies }] },
        isFetching: false,
        status: 'success',
        hasNextPage: true,
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: false,
      });

      (useMovieFormStore as unknown as jest.Mock).mockReturnValue({
        moviesFromStore: mockMovies.concat(Array(10).fill(mockMovies[0])),
        setMoviesStore: mockSetMoviesStore,
      });

      // Act
      render(<Movies offset={12} />, { wrapper: createWrapper() });

      const loadMoreButton = screen.getByText('translated.btnLoadMore');
      fireEvent.click(loadMoreButton);

      // Assert: Should not call setMoviesStore when data is undefined
      // The condition if (res?.data?.pages) prevents execution
      await waitFor(() => {
        expect(mockSetMoviesStore).not.toHaveBeenCalled();
      });
    });

    it('should handle fetchNextPage errors gracefully', async () => {
      // Arrange
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockFetchNextPage.mockRejectedValue(new Error('Network error'));

      (useGetMoviesInfiniteScroll as jest.Mock).mockReturnValue({
        data: { pages: [{ movies: mockMovies }] },
        isFetching: false,
        status: 'success',
        hasNextPage: true,
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: false,
      });

      (useMovieFormStore as unknown as jest.Mock).mockReturnValue({
        moviesFromStore: mockMovies.concat(Array(10).fill(mockMovies[0])),
        setMoviesStore: mockSetMoviesStore,
      });

      // Act
      render(<Movies offset={12} />, { wrapper: createWrapper() });

      const loadMoreButton = screen.getByText('translated.btnLoadMore');
      fireEvent.click(loadMoreButton);

      // Assert: Error should be logged
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
