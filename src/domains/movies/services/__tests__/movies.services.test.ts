import { MoviesService } from '../movies.services';
import { SearchData } from '@/lib/data/search';

jest.mock('@/lib/data/search');

describe('MoviesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchMovies', () => {
    it('should fetch all published movies when search is empty', async () => {
      const mockResult = {
        movies: [
          {
            id: '1',
            title: 'Test Movie',
            genresIds: [],
          },
        ],
        status: 200,
        prevOffset: 10,
      };

      (SearchData.findAllPublishedMovies as jest.Mock).mockResolvedValue(
        mockResult
      );

      const result = await MoviesService.fetchMovies({
        pageParam: 10,
        search: '',
      });

      expect(result).toEqual(mockResult);
      expect(SearchData.findAllPublishedMovies).toHaveBeenCalledWith(10);
      expect(SearchData.buildSearchConditions).not.toHaveBeenCalled();
      expect(SearchData.searchMovies).not.toHaveBeenCalled();
    });

    it('should fetch all published movies when search is only whitespace', async () => {
      const mockResult = {
        movies: [],
        status: 200,
        prevOffset: 20,
      };

      (SearchData.findAllPublishedMovies as jest.Mock).mockResolvedValue(
        mockResult
      );

      const result = await MoviesService.fetchMovies({
        pageParam: 20,
        search: '   ',
      });

      expect(result).toEqual(mockResult);
      expect(SearchData.findAllPublishedMovies).toHaveBeenCalledWith(20);
    });

    it('should search movies with filters when search parameters are provided', async () => {
      const mockWhereClause = {
        OR: [{ title: { contains: 'Matrix', mode: 'insensitive' } }],
      };

      const mockResult = {
        movies: [
          {
            id: '1',
            title: 'The Matrix',
            genresIds: [],
          },
        ],
        status: 200,
        prevOffset: 10,
      };

      (SearchData.buildSearchConditions as jest.Mock).mockReturnValue(
        mockWhereClause
      );
      (SearchData.searchMovies as jest.Mock).mockResolvedValue(mockResult);

      const result = await MoviesService.fetchMovies({
        pageParam: 10,
        search: 'q=Matrix',
      });

      expect(result).toEqual(mockResult);
      expect(SearchData.buildSearchConditions).toHaveBeenCalled();
      expect(SearchData.searchMovies).toHaveBeenCalledWith(mockWhereClause, 10);
      expect(SearchData.findAllPublishedMovies).not.toHaveBeenCalled();
    });

    it('should handle multiple search parameters', async () => {
      const searchParams = 'q=Matrix&subtitles=EN&decade=1990&genre=Sci-Fi';
      const mockWhereClause = {
        OR: [{ title: { contains: 'Matrix', mode: 'insensitive' } }],
        AND: [
          { subtitles: { has: 'EN' } },
          { year: { gte: 1990, lte: 1999 } },
          { genresIds: { some: { genre: { OR: [] } } } },
        ],
      };

      const mockResult = {
        movies: [
          {
            id: '1',
            title: 'The Matrix',
            genresIds: [],
          },
        ],
        status: 200,
        prevOffset: 15,
      };

      (SearchData.buildSearchConditions as jest.Mock).mockReturnValue(
        mockWhereClause
      );
      (SearchData.searchMovies as jest.Mock).mockResolvedValue(mockResult);

      const result = await MoviesService.fetchMovies({
        pageParam: 15,
        search: searchParams,
      });

      expect(result).toEqual(mockResult);
      expect(SearchData.buildSearchConditions).toHaveBeenCalled();

      const callArg = (SearchData.buildSearchConditions as jest.Mock).mock
        .calls[0][0];
      expect(callArg).toBeInstanceOf(URLSearchParams);
      expect(callArg.get('q')).toBe('Matrix');
      expect(callArg.get('subtitles')).toBe('EN');
      expect(callArg.get('decade')).toBe('1990');
      expect(callArg.get('genre')).toBe('Sci-Fi');

      expect(SearchData.searchMovies).toHaveBeenCalledWith(mockWhereClause, 15);
    });

    it('should handle search errors', async () => {
      const mockError = {
        status: 500,
      };

      (SearchData.searchMovies as jest.Mock).mockResolvedValue(mockError);
      (SearchData.buildSearchConditions as jest.Mock).mockReturnValue({});

      const result = await MoviesService.fetchMovies({
        pageParam: 10,
        search: 'q=test',
      });

      expect(result).toEqual(mockError);
      expect(result.status).toBe(500);
      expect(result.movies).toBeUndefined();
    });

    it('should handle errors when fetching all movies', async () => {
      const mockError = {
        status: 500,
      };

      (SearchData.findAllPublishedMovies as jest.Mock).mockResolvedValue(
        mockError
      );

      const result = await MoviesService.fetchMovies({
        pageParam: 10,
        search: '',
      });

      expect(result).toEqual(mockError);
      expect(result.status).toBe(500);
      expect(result.movies).toBeUndefined();
    });
  });
});
