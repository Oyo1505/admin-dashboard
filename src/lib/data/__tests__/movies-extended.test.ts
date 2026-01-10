import { MovieData } from '../movies';
import prisma from '@/lib/prisma';
import { handlePrismaError, logError } from '@/lib/errors';
import HttpStatus from '@/shared/constants/httpStatus';
import { IGenre } from '@/models/movie/movie';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    userFavoriteMovies: {
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

describe('MovieData - Extended Methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecentFavorites', () => {
    it('should return recent favorites for a user', async () => {
      const mockFavorites = [
        {
          id: 1,
          userId: 'user1',
          movieId: 'movie1',
          movie: {
            id: 'movie1',
            title: 'Inception',
            image: 'inception.jpg',
            year: 2010,
            genresIds: [
              {
                genre: {
                  id: '1',
                  nameFR: 'Action',
                  nameEN: 'Action',
                  nameJP: 'アクション',
                },
              },
            ],
          },
        },
        {
          id: 2,
          userId: 'user1',
          movieId: 'movie2',
          movie: {
            id: 'movie2',
            title: 'Interstellar',
            image: 'interstellar.jpg',
            year: 2014,
            genresIds: [
              {
                genre: {
                  id: '2',
                  nameFR: 'Science-Fiction',
                  nameEN: 'Sci-Fi',
                  nameJP: 'SF',
                },
              },
            ],
          },
        },
      ];

      (prisma.userFavoriteMovies.findMany as jest.Mock).mockResolvedValue(
        mockFavorites
      );

      const result = await MovieData.getRecentFavorites('user1', 5);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.favorites).toHaveLength(2);
      expect(result.favorites?.[0].id).toBe('movie1');
      expect(result.favorites?.[0].title).toBe('Inception');
      expect(prisma.userFavoriteMovies.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user1' },
          take: 5,
          orderBy: { id: 'desc' },
        })
      );
    });

    it('should return empty array when user has no favorites', async () => {
      (prisma.userFavoriteMovies.findMany as jest.Mock).mockResolvedValue([]);

      const result = await MovieData.getRecentFavorites('user1', 5);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.favorites).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      (prisma.userFavoriteMovies.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await MovieData.getRecentFavorites('user1', 5);

      expect(result.status).toBe(500);
      expect(result.favorites).toBeUndefined();
      expect(logError).toHaveBeenCalledWith(
        expect.any(Error),
        'getRecentFavorites'
      );
    });
  });

  describe('getUserFavoriteStats', () => {
    it('should return correct stats with favorite genre', async () => {
      const mockFavorites = [
        {
          id: 1,
          userId: 'user1',
          movieId: 'movie1',
          movie: {
            genresIds: [
              {
                genre: {
                  id: '1',
                  nameFR: 'Action',
                  nameEN: 'Action',
                  nameJP: 'アクション',
                },
              },
              {
                genre: {
                  id: '2',
                  nameFR: 'Drame',
                  nameEN: 'Drama',
                  nameJP: 'ドラマ',
                },
              },
            ],
          },
        },
        {
          id: 2,
          userId: 'user1',
          movieId: 'movie2',
          movie: {
            genresIds: [
              {
                genre: {
                  id: '1',
                  nameFR: 'Action',
                  nameEN: 'Action',
                  nameJP: 'アクション',
                },
              },
            ],
          },
        },
        {
          id: 3,
          userId: 'user1',
          movieId: 'movie3',
          movie: {
            genresIds: [
              {
                genre: {
                  id: '1',
                  nameFR: 'Action',
                  nameEN: 'Action',
                  nameJP: 'アクション',
                },
              },
            ],
          },
        },
      ];

      (prisma.userFavoriteMovies.findMany as jest.Mock).mockResolvedValue(
        mockFavorites
      );

      const result = await MovieData.getUserFavoriteStats('user1');

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.stats?.totalFavorites).toBe(3);
      expect(result.stats?.favoriteGenre).toBeDefined();
      expect(result.stats?.favoriteGenre?.id).toBe('1'); // Action appears 3 times
      expect(result.stats?.favoriteGenre?.nameFR).toBe('Action');
    });

    it('should return zero favorites when user has none', async () => {
      (prisma.userFavoriteMovies.findMany as jest.Mock).mockResolvedValue([]);

      const result = await MovieData.getUserFavoriteStats('user1');

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.stats?.totalFavorites).toBe(0);
      expect(result.stats?.favoriteGenre).toBeUndefined();
    });

    it('should handle movies with no genres', async () => {
      const mockFavorites = [
        {
          id: 1,
          userId: 'user1',
          movieId: 'movie1',
          movie: {
            genresIds: [],
          },
        },
      ];

      (prisma.userFavoriteMovies.findMany as jest.Mock).mockResolvedValue(
        mockFavorites
      );

      const result = await MovieData.getUserFavoriteStats('user1');

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.stats?.totalFavorites).toBe(1);
      expect(result.stats?.favoriteGenre).toBeUndefined();
    });

    it('should correctly count genre occurrences across multiple movies', async () => {
      const mockFavorites = [
        {
          id: 1,
          userId: 'user1',
          movieId: 'movie1',
          movie: {
            genresIds: [
              {
                genre: {
                  id: '1',
                  nameFR: 'Action',
                  nameEN: 'Action',
                  nameJP: 'アクション',
                },
              },
            ],
          },
        },
        {
          id: 2,
          userId: 'user1',
          movieId: 'movie2',
          movie: {
            genresIds: [
              {
                genre: {
                  id: '2',
                  nameFR: 'Drame',
                  nameEN: 'Drama',
                  nameJP: 'ドラマ',
                },
              },
            ],
          },
        },
        {
          id: 3,
          userId: 'user1',
          movieId: 'movie3',
          movie: {
            genresIds: [
              {
                genre: {
                  id: '2',
                  nameFR: 'Drame',
                  nameEN: 'Drama',
                  nameJP: 'ドラマ',
                },
              },
            ],
          },
        },
      ];

      (prisma.userFavoriteMovies.findMany as jest.Mock).mockResolvedValue(
        mockFavorites
      );

      const result = await MovieData.getUserFavoriteStats('user1');

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.stats?.favoriteGenre?.id).toBe('2'); // Drame appears 2 times vs Action 1 time
      expect(result.stats?.favoriteGenre?.nameFR).toBe('Drame');
    });

    it('should handle errors gracefully', async () => {
      (prisma.userFavoriteMovies.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await MovieData.getUserFavoriteStats('user1');

      expect(result.status).toBe(500);
      expect(result.stats).toBeUndefined();
      expect(logError).toHaveBeenCalledWith(
        expect.any(Error),
        'getUserFavoriteStats'
      );
    });
  });
});
