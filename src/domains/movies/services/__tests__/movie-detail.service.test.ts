import { MovieDetailService } from '../movie-detail.service';
import { validateId } from '@/lib/api-wrapper';
import { MovieData } from '@/lib/data/movies';
import { handlePrismaError, logError } from '@/lib/errors';
import { IMovie } from '@/models/movie/movie';

// Mock dependencies
jest.mock('@/lib/api-wrapper', () => ({
  validateId: jest.fn(),
}));

jest.mock('@/lib/data/movies', () => ({
  MovieData: {
    findUniqueIncludesGenres: jest.fn(),
    findManyMovieGenres: jest.fn(),
  },
}));

jest.mock('@/lib/errors', () => ({
  handlePrismaError: jest.fn((error) => ({
    statusCode: 500,
    message: 'Database error',
  })),
  logError: jest.fn(),
}));

describe('MovieDetailService', () => {
  const mockMovie: IMovie = {
    id: 'movie-123',
    title: 'The Matrix',
    synopsis: 'A computer hacker learns about reality',
    country: 'USA',
    year: 1999,
    duration: 136,
    director: 'Wachowskis',
    genresIds: [
      { id: 'rel-1', movieId: 'movie-123', genreId: 'genre-action' },
      { id: 'rel-2', movieId: 'movie-123', genreId: 'genre-scifi' },
    ],
    subtitles: [],
    googleDriveId: 'gdrive-123',
    linkAsImage: 'http://example.com/matrix.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockSuggestedMovies: IMovie[] = [
    {
      id: 'movie-456',
      title: 'Inception',
      synopsis: 'A thief who steals secrets',
      country: 'USA',
      year: 2010,
      duration: 148,
      director: 'Christopher Nolan',
      genresIds: [
        { id: 'rel-3', movieId: 'movie-456', genreId: 'genre-scifi' },
      ],
      subtitles: [],
      googleDriveId: 'gdrive-456',
      linkAsImage: 'http://example.com/inception.jpg',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('movieDetail', () => {
    it('should return movie with suggested movies', async () => {
      (validateId as jest.Mock).mockImplementation(() => {});
      (MovieData.findUniqueIncludesGenres as jest.Mock).mockResolvedValue({
        movieInDb: mockMovie,
        status: 200,
      });
      (MovieData.findManyMovieGenres as jest.Mock).mockResolvedValue({
        movies: mockSuggestedMovies,
        status: 200,
      });

      const result = await MovieDetailService.movieDetail('movie-123');

      expect(result).toEqual({
        movie: mockMovie,
        suggestedMovies: mockSuggestedMovies,
        status: 200,
      });
      expect(validateId).toHaveBeenCalledWith('movie-123');
      expect(MovieData.findUniqueIncludesGenres).toHaveBeenCalledWith(
        'movie-123'
      );
      expect(MovieData.findManyMovieGenres).toHaveBeenCalledWith(
        expect.objectContaining({
          movieId: 'movie-123',
          genreId: expect.any(String),
        }),
        mockMovie
      );
    });

    it('should return 404 when movie not found', async () => {
      (validateId as jest.Mock).mockImplementation(() => {});
      (MovieData.findUniqueIncludesGenres as jest.Mock).mockResolvedValue({
        movieInDb: null,
        status: 404,
      });

      const result = await MovieDetailService.movieDetail('nonexistent-id');

      expect(result).toEqual({
        status: 404,
      });
      expect(MovieData.findManyMovieGenres).not.toHaveBeenCalled();
    });

    it('should handle movie with no genres', async () => {
      const movieWithoutGenres = {
        ...mockMovie,
        genresIds: [],
      };

      (validateId as jest.Mock).mockImplementation(() => {});
      (MovieData.findUniqueIncludesGenres as jest.Mock).mockResolvedValue({
        movieInDb: movieWithoutGenres,
        status: 200,
      });

      const result = await MovieDetailService.movieDetail('movie-123');

      expect(result).toEqual({
        movie: movieWithoutGenres,
        suggestedMovies: [],
        status: 200,
      });
      expect(MovieData.findManyMovieGenres).not.toHaveBeenCalled();
    });

    it('should handle movie with null genresIds', async () => {
      const movieWithNullGenres = {
        ...mockMovie,
        genresIds: null,
      };

      (validateId as jest.Mock).mockImplementation(() => {});
      (MovieData.findUniqueIncludesGenres as jest.Mock).mockResolvedValue({
        movieInDb: movieWithNullGenres,
        status: 200,
      });

      const result = await MovieDetailService.movieDetail('movie-123');

      expect(result).toEqual({
        movie: movieWithNullGenres,
        suggestedMovies: [],
        status: 200,
      });
      expect(MovieData.findManyMovieGenres).not.toHaveBeenCalled();
    });

    it('should select random genre from multiple genres', async () => {
      (validateId as jest.Mock).mockImplementation(() => {});
      (MovieData.findUniqueIncludesGenres as jest.Mock).mockResolvedValue({
        movieInDb: mockMovie,
        status: 200,
      });
      (MovieData.findManyMovieGenres as jest.Mock).mockResolvedValue({
        movies: mockSuggestedMovies,
        status: 200,
      });

      // Mock Math.random to return predictable value
      const mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await MovieDetailService.movieDetail('movie-123');

      expect(result.status).toBe(200);
      expect(MovieData.findManyMovieGenres).toHaveBeenCalled();

      mathRandomSpy.mockRestore();
    });

    it('should handle empty suggested movies', async () => {
      (validateId as jest.Mock).mockImplementation(() => {});
      (MovieData.findUniqueIncludesGenres as jest.Mock).mockResolvedValue({
        movieInDb: mockMovie,
        status: 200,
      });
      (MovieData.findManyMovieGenres as jest.Mock).mockResolvedValue({
        movies: [],
        status: 200,
      });

      const result = await MovieDetailService.movieDetail('movie-123');

      expect(result).toEqual({
        movie: mockMovie,
        suggestedMovies: [],
        status: 200,
      });
    });

    it('should handle validation errors', async () => {
      (validateId as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid ID format');
      });

      const result = await MovieDetailService.movieDetail('invalid-id');

      expect(result).toEqual({
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(
        expect.any(Error),
        'movieDetail services'
      );
      expect(handlePrismaError).toHaveBeenCalledWith(expect.any(Error));
      expect(MovieData.findUniqueIncludesGenres).not.toHaveBeenCalled();
    });

    it('should handle database errors from findUniqueIncludesGenres', async () => {
      const mockError = new Error('Database query failed');
      (validateId as jest.Mock).mockImplementation(() => {});
      (MovieData.findUniqueIncludesGenres as jest.Mock).mockRejectedValue(
        mockError
      );

      const result = await MovieDetailService.movieDetail('movie-123');

      expect(result).toEqual({
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(mockError, 'movieDetail services');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });

    it('should handle database errors from findManyMovieGenres', async () => {
      const mockError = new Error('Failed to fetch suggested movies');
      (validateId as jest.Mock).mockImplementation(() => {});
      (MovieData.findUniqueIncludesGenres as jest.Mock).mockResolvedValue({
        movieInDb: mockMovie,
        status: 200,
      });
      (MovieData.findManyMovieGenres as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieDetailService.movieDetail('movie-123');

      expect(result).toEqual({
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(mockError, 'movieDetail services');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });

    it('should handle single genre correctly', async () => {
      const movieWithSingleGenre = {
        ...mockMovie,
        genresIds: [
          { id: 'rel-1', movieId: 'movie-123', genreId: 'genre-action' },
        ],
      };

      (validateId as jest.Mock).mockImplementation(() => {});
      (MovieData.findUniqueIncludesGenres as jest.Mock).mockResolvedValue({
        movieInDb: movieWithSingleGenre,
        status: 200,
      });
      (MovieData.findManyMovieGenres as jest.Mock).mockResolvedValue({
        movies: mockSuggestedMovies,
        status: 200,
      });

      const result = await MovieDetailService.movieDetail('movie-123');

      expect(result.status).toBe(200);
      expect(result.movie).toEqual(movieWithSingleGenre);
      expect(MovieData.findManyMovieGenres).toHaveBeenCalledWith(
        movieWithSingleGenre.genresIds[0],
        movieWithSingleGenre
      );
    });
  });
});
