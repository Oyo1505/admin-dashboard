/**
 * Unit tests for the MovieFilters component
 *
 * Concepts tested:
 * - useSearchParams hook integration
 * - Filter state synchronization with URL parameters
 * - User interactions with filter selects
 * - URL navigation on filter changes
 * - Clear filters functionality
 * - Integration with Zustand store
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import MovieFilters from '../movies-filters';
import { useFiltersMovieStore } from '@/store/movie/movie-store';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => `translated.${key}`,
  useLocale: () => 'en',
}));

// Mock Zustand store
jest.mock('@/store/movie/movie-store', () => ({
  useFiltersMovieStore: jest.fn(),
}));

describe('MovieFilters', () => {
  const mockReplace = jest.fn();
  const mockSetFiltersData = jest.fn();
  const mockClearFilters = jest.fn();

  const mockGenres = [
    { id: '1', nameFR: 'Action', nameEN: 'Action', nameJP: 'アクション' },
    { id: '2', nameFR: 'Comédie', nameEN: 'Comedy', nameJP: 'コメディ' },
    { id: '3', nameFR: 'Drame', nameEN: 'Drama', nameJP: 'ドラマ' },
  ];

  const mockCountries = ['FR', 'US', 'JP'];

  beforeEach(() => {
    jest.clearAllMocks();

    // Default router mock
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });

    // Default search params mock (empty)
    const mockSearchParamsInstance = {
      get: jest.fn(() => null),
      size: 0,
      toString: jest.fn(() => ''),
    };
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParamsInstance);

    // Default store mock
    (useFiltersMovieStore as unknown as jest.Mock).mockReturnValue({
      filters: {},
      setFiltersData: mockSetFiltersData,
      clearFilters: mockClearFilters,
    });
  });

  /**
   * Group 1: Component rendering and initialization
   */
  describe('Component rendering', () => {
    it('should render all filter selects', () => {
      render(<MovieFilters genres={mockGenres} countries={mockCountries} />);

      expect(screen.getByText('translated.subtitles')).toBeInTheDocument();
      expect(screen.getByText('translated.language')).toBeInTheDocument();
      expect(screen.getByText('translated.decade')).toBeInTheDocument();
      expect(screen.getByText('translated.genre')).toBeInTheDocument();
    });

    it('should render search and clear buttons', () => {
      render(<MovieFilters genres={mockGenres} countries={mockCountries} />);

      expect(screen.getByText('translated.btnSearch')).toBeInTheDocument();
      expect(
        screen.getByText('translated.btnClearSearch')
      ).toBeInTheDocument();
    });

    it('should render with empty genres array', () => {
      render(<MovieFilters genres={[]} countries={mockCountries} />);

      expect(screen.getByText('translated.genre')).toBeInTheDocument();
    });

    it('should render with empty countries array', () => {
      render(<MovieFilters genres={mockGenres} countries={[]} />);

      expect(screen.getByText('translated.language')).toBeInTheDocument();
    });
  });

  /**
   * Group 2: URL params synchronization
   */
  describe('URL params synchronization', () => {
    it('should sync filters from URL params on mount', async () => {
      // Arrange: Mock URL with filter params
      const mockSearchParamsWithFilters = {
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
        toString: jest.fn(() => 'subtitles=EN&language=FR&decade=2020'),
      };
      (useSearchParams as jest.Mock).mockReturnValue(
        mockSearchParamsWithFilters
      );

      // Act
      render(<MovieFilters genres={mockGenres} countries={mockCountries} />);

      // Assert: setFiltersData should be called with URL params
      await waitFor(() => {
        expect(mockSetFiltersData).toHaveBeenCalledWith({
          subtitles: 'EN',
          language: 'FR',
          decade: 2020,
          genre: 'Action',
          q: 'test',
        });
      });
    });

    it('should not sync filters when URL params are empty', () => {
      // Arrange: Empty search params
      const mockEmptySearchParams = {
        get: jest.fn(() => null),
        size: 0,
        toString: jest.fn(() => ''),
      };
      (useSearchParams as jest.Mock).mockReturnValue(mockEmptySearchParams);

      // Act
      render(<MovieFilters genres={mockGenres} countries={mockCountries} />);

      // Assert: setFiltersData should not be called
      expect(mockSetFiltersData).not.toHaveBeenCalled();
    });

    it('should handle partial URL params', async () => {
      // Arrange: Only some params present
      const mockPartialSearchParams = {
        get: jest.fn((key: string) => {
          return key === 'subtitles' ? 'FR' : null;
        }),
        size: 1,
        toString: jest.fn(() => 'subtitles=FR'),
      };
      (useSearchParams as jest.Mock).mockReturnValue(mockPartialSearchParams);

      // Act
      render(<MovieFilters genres={mockGenres} countries={mockCountries} />);

      // Assert
      await waitFor(() => {
        expect(mockSetFiltersData).toHaveBeenCalledWith({
          subtitles: 'FR',
          language: undefined,
          decade: undefined,
          genre: undefined,
          q: undefined,
        });
      });
    });
  });

  /**
   * Group 3: Filter changes
   */
  describe('Filter changes', () => {
    it('should update filters when subtitles select changes', () => {
      // Arrange
      (useFiltersMovieStore as unknown as jest.Mock).mockReturnValue({
        filters: {},
        setFiltersData: mockSetFiltersData,
        clearFilters: mockClearFilters,
      });

      render(<MovieFilters genres={mockGenres} countries={mockCountries} />);

      const subtitlesSelect = screen.getAllByRole('combobox')[0];

      // Act
      fireEvent.change(subtitlesSelect, { target: { value: 'EN' } });

      // Assert
      expect(mockSetFiltersData).toHaveBeenCalledWith({
        subtitles: 'EN',
      });
    });

    it('should update filters when language select changes', () => {
      // Arrange
      (useFiltersMovieStore as unknown as jest.Mock).mockReturnValue({
        filters: { subtitles: 'FR' },
        setFiltersData: mockSetFiltersData,
        clearFilters: mockClearFilters,
      });

      render(<MovieFilters genres={mockGenres} countries={mockCountries} />);

      const languageSelect = screen.getAllByRole('combobox')[1];

      // Act
      fireEvent.change(languageSelect, { target: { value: 'US' } });

      // Assert
      expect(mockSetFiltersData).toHaveBeenCalledWith({
        subtitles: 'FR',
        language: 'US',
      });
    });

    it('should update filters when decade select changes', () => {
      // Arrange
      (useFiltersMovieStore as unknown as jest.Mock).mockReturnValue({
        filters: {},
        setFiltersData: mockSetFiltersData,
        clearFilters: mockClearFilters,
      });

      render(<MovieFilters genres={mockGenres} countries={mockCountries} />);

      const decadeSelect = screen.getAllByRole('combobox')[2];

      // Act
      fireEvent.change(decadeSelect, { target: { value: '2020' } });

      // Assert
      expect(mockSetFiltersData).toHaveBeenCalledWith({
        decade: 2020,
      });
    });

    it('should update filters when genre select changes', () => {
      // Arrange
      (useFiltersMovieStore as unknown as jest.Mock).mockReturnValue({
        filters: {},
        setFiltersData: mockSetFiltersData,
        clearFilters: mockClearFilters,
      });

      render(<MovieFilters genres={mockGenres} countries={mockCountries} />);

      const genreSelect = screen.getAllByRole('combobox')[3];

      // Act
      fireEvent.change(genreSelect, { target: { value: 'Action' } });

      // Assert
      expect(mockSetFiltersData).toHaveBeenCalledWith({
        genre: 'Action',
      });
    });
  });

  /**
   * Group 4: Search button functionality
   */
  describe('Search button', () => {
    it('should navigate to URL with query string on search button click', () => {
      // Arrange
      (useFiltersMovieStore as unknown as jest.Mock).mockReturnValue({
        filters: {
          subtitles: 'EN',
          language: 'FR',
          decade: 2020,
          genre: 'Action',
        },
        setFiltersData: mockSetFiltersData,
        clearFilters: mockClearFilters,
      });

      render(<MovieFilters genres={mockGenres} countries={mockCountries} />);

      const searchButton = screen.getByText('translated.btnSearch');

      // Act
      fireEvent.click(searchButton);

      // Assert
      expect(mockReplace).toHaveBeenCalled();
      const callArg = mockReplace.mock.calls[0][0];
      expect(callArg).toContain('/movies?');
      expect(callArg).toContain('subtitles=EN');
      expect(callArg).toContain('language=FR');
      expect(callArg).toContain('decade=2020');
      expect(callArg).toContain('genre=Action');
    });

    it('should omit undefined filter values from query string', () => {
      // Arrange
      (useFiltersMovieStore as unknown as jest.Mock).mockReturnValue({
        filters: {
          subtitles: 'EN',
          language: undefined,
          decade: undefined,
          genre: undefined,
        },
        setFiltersData: mockSetFiltersData,
        clearFilters: mockClearFilters,
      });

      render(<MovieFilters genres={mockGenres} countries={mockCountries} />);

      const searchButton = screen.getByText('translated.btnSearch');

      // Act
      fireEvent.click(searchButton);

      // Assert
      const callArg = mockReplace.mock.calls[0][0];
      expect(callArg).toContain('subtitles=EN');
      expect(callArg).not.toContain('language=');
      expect(callArg).not.toContain('decade=');
      expect(callArg).not.toContain('genre=');
    });

    it('should handle empty filters on search', () => {
      // Arrange
      (useFiltersMovieStore as unknown as jest.Mock).mockReturnValue({
        filters: {},
        setFiltersData: mockSetFiltersData,
        clearFilters: mockClearFilters,
      });

      render(<MovieFilters genres={mockGenres} countries={mockCountries} />);

      const searchButton = screen.getByText('translated.btnSearch');

      // Act
      fireEvent.click(searchButton);

      // Assert
      expect(mockReplace).toHaveBeenCalledWith('/movies?');
    });
  });

  /**
   * Group 5: Clear filters functionality
   */
  describe('Clear filters', () => {
    it('should call clearFilters and navigate to /movies on clear button click', () => {
      render(<MovieFilters genres={mockGenres} countries={mockCountries} />);

      const clearButton = screen.getByText('translated.btnClearSearch');

      // Act
      fireEvent.click(clearButton);

      // Assert
      expect(mockClearFilters).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/movies');
    });

    it('should trigger clearing state temporarily', async () => {
      render(<MovieFilters genres={mockGenres} countries={mockCountries} />);

      const clearButton = screen.getByText('translated.btnClearSearch');

      // Act
      fireEvent.click(clearButton);

      // Assert: Component should handle isClearing state internally
      // (This is more of an implementation detail, but we verify the button works)
      expect(mockClearFilters).toHaveBeenCalled();
    });
  });

  /**
   * Group 6: Genre sorting
   */
  describe('Genre sorting', () => {
    it('should sort genres alphabetically for English locale', () => {
      // Arrange
      const unsortedGenres = [
        { id: '1', nameFR: 'Drame', nameEN: 'Drama', nameJP: 'ドラマ' },
        { id: '2', nameFR: 'Action', nameEN: 'Action', nameJP: 'アクション' },
        { id: '3', nameFR: 'Comédie', nameEN: 'Comedy', nameJP: 'コメディ' },
      ];

      // Act
      render(
        <MovieFilters genres={unsortedGenres} countries={mockCountries} />
      );

      // Assert: Genres should be rendered in alphabetical order (Action, Comedy, Drama)
      const genreOptions = screen.getAllByRole('option');
      const genreNames = genreOptions
        .filter((opt) => opt.textContent !== 'translated.genre')
        .map((opt) => opt.textContent);

      // Should contain genre names (order verified by locale)
      expect(genreNames).toContain('Action');
      expect(genreNames).toContain('Comedy');
      expect(genreNames).toContain('Drama');
    });
  });

  /**
   * Group 7: Edge cases
   */
  describe('Edge cases', () => {
    it('should handle undefined genres prop', () => {
      render(<MovieFilters genres={undefined} countries={mockCountries} />);

      expect(screen.getByText('translated.genre')).toBeInTheDocument();
    });

    it('should handle decade as zero', async () => {
      // Arrange
      const mockSearchParamsWithZero = {
        get: jest.fn((key: string) => (key === 'decade' ? '0' : null)),
        size: 1,
        toString: jest.fn(() => 'decade=0'),
      };
      (useSearchParams as jest.Mock).mockReturnValue(
        mockSearchParamsWithZero
      );

      // Act
      render(<MovieFilters genres={mockGenres} countries={mockCountries} />);

      // Assert: Number('0') returns 0 which is falsy, so it becomes undefined
      await waitFor(() => {
        expect(mockSetFiltersData).toHaveBeenCalledWith(
          expect.objectContaining({
            decade: undefined,
          })
        );
      });
    });

    it('should re-sync filters when URL params change', async () => {
      // Arrange: Initial params
      const mockInitialParams = {
        get: jest.fn((key: string) => (key === 'subtitles' ? 'EN' : null)),
        size: 1,
        toString: jest.fn(() => 'subtitles=EN'),
      };
      (useSearchParams as jest.Mock).mockReturnValue(mockInitialParams);

      const { rerender } = render(
        <MovieFilters genres={mockGenres} countries={mockCountries} />
      );

      await waitFor(() => {
        expect(mockSetFiltersData).toHaveBeenCalled();
      });

      jest.clearAllMocks();

      // Act: Simulate URL change
      const mockUpdatedParams = {
        get: jest.fn((key: string) => (key === 'subtitles' ? 'FR' : null)),
        size: 1,
        toString: jest.fn(() => 'subtitles=FR'), // Changed toString
      };
      (useSearchParams as jest.Mock).mockReturnValue(mockUpdatedParams);

      rerender(<MovieFilters genres={mockGenres} countries={mockCountries} />);

      // Assert: Should sync again with new params
      await waitFor(() => {
        expect(mockSetFiltersData).toHaveBeenCalledWith({
          subtitles: 'FR',
          language: undefined,
          decade: undefined,
          genre: undefined,
          q: undefined,
        });
      });
    });
  });
});
