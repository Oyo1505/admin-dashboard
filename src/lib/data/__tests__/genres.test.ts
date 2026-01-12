import { GenreData } from '../genres';
import prisma from '@/lib/prisma';
import { handlePrismaError, logError } from '@/lib/errors';
import { IGenre } from '@/models/movie/movie';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    genre: {
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    movie: {
      findMany: jest.fn(),
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

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: any) => fn,
}));

describe('GenreData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a genre successfully', async () => {
      const mockGenre: IGenre = {
        id: '1',
        nameFR: 'Action',
        nameEN: 'Action',
        nameJP: 'アクション',
      };

      const mockCreatedGenre = {
        ...mockGenre,
      };

      (prisma.genre.create as jest.Mock).mockResolvedValue(mockCreatedGenre);

      const result = await GenreData.create(mockGenre);

      expect(result).toEqual({
        status: 200,
        createdGenre: mockCreatedGenre,
      });
      expect(prisma.genre.create).toHaveBeenCalledWith({
        data: mockGenre,
      });
    });

    it('should handle database errors', async () => {
      const mockGenre: IGenre = {
        id: '2',
        nameFR: 'Action',
        nameEN: 'Action',
        nameJP: 'アクション',
      };

      const mockError = new Error('Database error');
      (prisma.genre.create as jest.Mock).mockRejectedValue(mockError);

      const result = await GenreData.create(mockGenre);

      expect(result).toEqual({
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(mockError, 'addGenre');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('delete', () => {
    it('should delete a genre successfully', async () => {
      const genreId = '1';
      const mockDeletedGenre = {
        id: genreId,
        nameFR: 'Action',
        nameEN: 'Action',
        nameJP: 'アクション',
      };

      (prisma.genre.delete as jest.Mock).mockResolvedValue(mockDeletedGenre);

      const result = await GenreData.delete(genreId);

      expect(result).toEqual({
        deletedGenre: mockDeletedGenre,
        status: 200,
      });
      expect(prisma.genre.delete).toHaveBeenCalledWith({
        where: {
          id: genreId,
        },
      });
    });

    it('should handle database errors', async () => {
      const genreId = '1';
      const mockError = new Error('Genre not found');
      (prisma.genre.delete as jest.Mock).mockRejectedValue(mockError);

      const result = await GenreData.delete(genreId);

      expect(result).toEqual({
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(mockError, 'delete Genre data');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('update', () => {
    it('should update a genre successfully', async () => {
      const mockGenre: IGenre = {
        id: '1',
        nameFR: 'Action',
        nameEN: 'Action',
        nameJP: 'アクション',
      };

      const mockUpdatedGenre = {
        ...mockGenre,
        nameFR: 'Action Updated',
      };

      (prisma.genre.update as jest.Mock).mockResolvedValue(mockUpdatedGenre);

      const result = await GenreData.update(mockGenre);

      expect(result).toEqual({
        status: 200,
        updatedGenre: mockUpdatedGenre,
      });
      expect(prisma.genre.update).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
        data: mockGenre,
      });
    });

    it('should return 404 when updated genre is null', async () => {
      const mockGenre: IGenre = {
        id: '1',
        nameFR: 'Action',
        nameEN: 'Action',
        nameJP: 'アクション',
      };

      (prisma.genre.update as jest.Mock).mockResolvedValue(null);

      const result = await GenreData.update(mockGenre);

      expect(result).toEqual({
        status: 404,
      });
    });

    it('should handle database errors', async () => {
      const mockGenre: IGenre = {
        id: '1',
        nameFR: 'Action',
        nameEN: 'Action',
        nameJP: 'アクション',
      };

      const mockError = new Error('Database error');
      (prisma.genre.update as jest.Mock).mockRejectedValue(mockError);

      const result = await GenreData.update(mockGenre);

      expect(result).toEqual({
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(mockError, 'updateGenre');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getAllGenres', () => {
    it('should return all genres successfully', async () => {
      const mockGenres = [
        {
          id: '1',
          nameFR: 'Action',
          nameEN: 'Action',
          nameJP: 'アクション',
        },
        {
          id: '2',
          nameFR: 'Comédie',
          nameEN: 'Comedy',
          nameJP: 'コメディ',
        },
      ];

      (prisma.genre.findMany as jest.Mock).mockResolvedValue(mockGenres);

      const result = await GenreData.getAllGenres();

      expect(result).toEqual({
        genres: mockGenres,
        status: 200,
      });
      expect(prisma.genre.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no genres found', async () => {
      (prisma.genre.findMany as jest.Mock).mockResolvedValue([]);

      const result = await GenreData.getAllGenres();

      expect(result).toEqual({
        genres: [],
        status: 200,
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      (prisma.genre.findMany as jest.Mock).mockRejectedValue(mockError);

      const result = await GenreData.getAllGenres();

      expect(result).toEqual({
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(mockError, 'getAllGenres');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getMoviesByARandomGenreById', () => {
    it('should return movies for a given genre', async () => {
      const genreId = 'action-123';
      const mockMovies = [
        {
          id: 'movie-1',
          title: 'Action Movie 1',
          genresIds: [{ genreId: 'action-123' }],
        },
        {
          id: 'movie-2',
          title: 'Action Movie 2',
          genresIds: [{ genreId: 'action-123' }],
        },
      ];

      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMovies);

      const result = await GenreData.getMoviesByARandomGenreById(genreId);

      expect(result).toEqual({
        movies: mockMovies,
        status: 200,
      });
      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        where: {
          genresIds: {
            some: {
              genreId: { contains: genreId, mode: 'insensitive' },
            },
          },
        },
      });
    });

    it('should return 400 when genreId is empty', async () => {
      const result = await GenreData.getMoviesByARandomGenreById('');

      expect(result).toEqual({
        status: 400,
      });
      expect(prisma.movie.findMany).not.toHaveBeenCalled();
    });

    it('should return 400 when genreId is whitespace', async () => {
      const result = await GenreData.getMoviesByARandomGenreById('   ');

      expect(result).toEqual({
        status: 400,
      });
      expect(prisma.movie.findMany).not.toHaveBeenCalled();
    });

    it('should return empty array when no movies found', async () => {
      const genreId = 'unknown-genre';
      (prisma.movie.findMany as jest.Mock).mockResolvedValue([]);

      const result =
        await GenreData.getMoviesByARandomGenreById(genreId);

      expect(result).toEqual({
        movies: [],
        status: 200,
      });
    });

    it('should handle database errors', async () => {
      const genreId = 'action-123';
      const mockError = new Error('Database query failed');
      (prisma.movie.findMany as jest.Mock).mockRejectedValue(mockError);

      const result =
        await GenreData.getMoviesByARandomGenreById(genreId);

      expect(result).toEqual({
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(
        mockError,
        'getMoviesByARandomGenreById'
      );
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });
});
