import { MovieData } from '../movies';
import prisma from '@/lib/prisma';
import { handlePrismaError, logError } from '@/lib/errors';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    movie: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    genre: {
      findMany: jest.fn(),
    },
    userFavoriteMovies: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('@/lib/errors', () => ({
  handlePrismaError: jest.fn((error) => ({
    statusCode: 500,
    message: 'Database error',
  })),
  logError: jest.fn(),
}));

describe('MovieData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockMovieData = {
      title: 'Inception',
      titleEnglish: 'Inception',
      titleJapanese: 'インセプション',
      director: 'Christopher Nolan',
      year: 2010,
      duration: 148,
      genresIds: ['1', '2'],
      country: 'USA',
      language: 'English',
      subtitles: ['FR', 'EN'],
      synopsis: 'A thief who steals corporate secrets...',
      trailer: 'https://youtube.com/watch?v=...',
      link: 'https://example.com/inception',
      image: 'https://example.com/inception.jpg',
      idGoogleDive: 'google-drive-id-123',
      imdbId: 'tt1375666',
      originalTitle: 'Inception',
    };

    it('should create a movie successfully and return it with status 200', async () => {
      const mockCreatedMovie = {
        id: '1',
        ...mockMovieData,
        publish: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        genresIds: [
          {
            genre: {
              id: '1',
              nameFR: 'Science-Fiction',
              nameEN: 'Science Fiction',
              nameJP: 'サイエンスフィクション',
            },
          },
          {
            genre: {
              id: '2',
              nameFR: 'Action',
              nameEN: 'Action',
              nameJP: 'アクション',
            },
          },
        ],
      };

      (prisma.movie.create as jest.Mock).mockResolvedValue(mockCreatedMovie);

      const result = await MovieData.create(mockMovieData);

      expect(result).toEqual({
        movie: mockCreatedMovie,
        status: 200,
      });

      expect(prisma.movie.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: mockMovieData.title,
          director: mockMovieData.director,
          year: mockMovieData.year,
        }),
        include: {
          genresIds: {
            select: {
              genre: {
                select: {
                  id: true,
                  nameFR: true,
                  nameEN: true,
                  nameJP: true,
                },
              },
            },
          },
        },
      });
    });

    it('should handle database errors and return status 500', async () => {
      const mockError = new Error('Database connection failed');
      (prisma.movie.create as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieData.create(mockMovieData);

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(mockError, 'MovieData.create');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });

    it('should include genres in the created movie', async () => {
      const mockCreatedMovie = {
        id: '1',
        ...mockMovieData,
        genresIds: [
          {
            genre: {
              id: '1',
              nameFR: 'Science-Fiction',
              nameEN: 'Science Fiction',
              nameJP: 'サイエンスフィクション',
            },
          },
        ],
      };

      (prisma.movie.create as jest.Mock).mockResolvedValue(mockCreatedMovie);

      const result = await MovieData.create(mockMovieData);

      expect(result.movie?.genresIds).toBeDefined();
      expect(result.movie?.genresIds).toHaveLength(1);
      expect(result.movie?.genresIds?.[0].genre.nameFR).toBe('Science-Fiction');
    });

    it('should convert zero duration and year to null', async () => {
      const movieWithZeros: typeof mockMovieData = {
        ...mockMovieData,
        duration: 0,
        year: 0,
      };

      const mockCreatedMovie = {
        id: '1',
        ...movieWithZeros,
        duration: null,
        year: null,
        genresIds: [],
      };

      (prisma.movie.create as jest.Mock).mockResolvedValue(mockCreatedMovie);

      await MovieData.create(movieWithZeros);

      // The create method treats 0 as falsy and converts to null
      expect(prisma.movie.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            duration: null,
            year: null,
          }),
        })
      );
    });
  });

  describe('togglePublish', () => {
    it('should toggle publish status from false to true', async () => {
      const movieId = '1';
      const currentStatus = false;

      (prisma.movie.update as jest.Mock).mockResolvedValue({
        publish: true,
      });

      const result = await MovieData.togglePublish(movieId, currentStatus);

      expect(result).toEqual({
        publish: true,
        status: 200,
      });

      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: movieId },
        data: { publish: true },
        select: { publish: true },
      });
    });

    it('should toggle publish status from true to false', async () => {
      const movieId = '1';
      const currentStatus = true;

      (prisma.movie.update as jest.Mock).mockResolvedValue({
        publish: false,
      });

      const result = await MovieData.togglePublish(movieId, currentStatus);

      expect(result).toEqual({
        publish: false,
        status: 200,
      });

      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: movieId },
        data: { publish: false },
        select: { publish: true },
      });
    });

    it('should handle database errors when toggling publish', async () => {
      const movieId = '1';
      const currentStatus = false;
      const mockError = new Error('Database error');

      (prisma.movie.update as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieData.togglePublish(movieId, currentStatus);

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(
        mockError,
        'MovieData.togglePublish'
      );
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('Favorite Movies Operations', () => {
    const userId = 'user-123';
    const movieId = 'movie-456';

    describe('findUniqueFavorite', () => {
      it('should find an existing favorite and return it with status 200', async () => {
        const mockFavorite = {
          id: 1,
          userId,
          movieId,
        };

        (prisma.userFavoriteMovies.findUnique as jest.Mock).mockResolvedValue(
          mockFavorite
        );

        const result = await MovieData.findUniqueFavorite(userId, movieId);

        expect(result).toEqual({
          favorite: {
            id: '1',
            userId,
            movieId,
          },
          status: 200,
        });

        expect(prisma.userFavoriteMovies.findUnique).toHaveBeenCalledWith({
          where: {
            userId_movieId: {
              userId,
              movieId,
            },
          },
        });
      });

      it('should return 404 when favorite does not exist', async () => {
        (prisma.userFavoriteMovies.findUnique as jest.Mock).mockResolvedValue(
          null
        );

        const result = await MovieData.findUniqueFavorite(userId, movieId);

        expect(result).toEqual({
          favorite: undefined,
          status: 404,
        });
      });

      it('should handle database errors when finding favorite', async () => {
        const mockError = new Error('Database connection failed');
        (prisma.userFavoriteMovies.findUnique as jest.Mock).mockRejectedValue(
          mockError
        );

        const result = await MovieData.findUniqueFavorite(userId, movieId);

        expect(result).toEqual({
          status: 500,
        });

        expect(logError).toHaveBeenCalledWith(mockError, 'findUniqueFavorite');
        expect(handlePrismaError).toHaveBeenCalledWith(mockError);
      });
    });

    describe('createFavorite', () => {
      it('should create a favorite successfully and return it with status 200', async () => {
        const mockCreatedFavorite = {
          id: 1,
          userId,
          movieId,
        };

        (prisma.userFavoriteMovies.create as jest.Mock).mockResolvedValue(
          mockCreatedFavorite
        );

        const result = await MovieData.createFavorite(userId, movieId);

        expect(result).toEqual({
          favorite: {
            id: '1',
            userId,
            movieId,
          },
          status: 200,
          message: 'Added to favorite',
        });

        expect(prisma.userFavoriteMovies.create).toHaveBeenCalledWith({
          data: {
            userId,
            movieId,
          },
        });
      });

      it('should handle database errors when creating favorite', async () => {
        const mockError = new Error('Unique constraint violation');
        (prisma.userFavoriteMovies.create as jest.Mock).mockRejectedValue(
          mockError
        );

        const result = await MovieData.createFavorite(userId, movieId);

        expect(result).toEqual({
          status: 500,
        });

        expect(logError).toHaveBeenCalledWith(mockError, 'createFavorite');
        expect(handlePrismaError).toHaveBeenCalledWith(mockError);
      });
    });

    describe('deleteFavorite', () => {
      it('should delete a favorite successfully and return status 200', async () => {
        (prisma.userFavoriteMovies.delete as jest.Mock).mockResolvedValue({
          id: 1,
          userId,
          movieId,
        });

        const result = await MovieData.deleteFavorite(userId, movieId);

        expect(result).toEqual({
          status: 200,
          message: 'Success: movie deleted',
        });

        expect(prisma.userFavoriteMovies.delete).toHaveBeenCalledWith({
          where: {
            userId_movieId: {
              userId,
              movieId,
            },
          },
        });
      });

      it('should handle database errors when deleting favorite', async () => {
        const mockError = new Error('Record not found');
        (prisma.userFavoriteMovies.delete as jest.Mock).mockRejectedValue(
          mockError
        );

        const result = await MovieData.deleteFavorite(userId, movieId);

        expect(result).toEqual({
          status: 500,
        });

        expect(logError).toHaveBeenCalledWith(mockError, 'deleteFavorite');
        expect(handlePrismaError).toHaveBeenCalledWith(mockError);
      });
    });
  });
});
