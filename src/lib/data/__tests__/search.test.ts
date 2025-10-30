import { SearchData } from '../search';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    movie: {
      findMany: jest.fn(),
    },
  },
}));

describe('SearchData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllPublishedMovies', () => {
    it('should return all published movies with correct structure', async () => {
      const mockMovies = [
        {
          id: '1',
          title: 'Test Movie',
          publish: true,
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
      ];

      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMovies);

      const result = await SearchData.findAllPublishedMovies(10);

      expect(result).toEqual({
        movies: mockMovies,
        status: 200,
        prevOffset: 10,
      });

      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        where: { publish: true },
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
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    });

    it('should handle database errors', async () => {
      (prisma.movie.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await SearchData.findAllPublishedMovies(10);

      expect(result.status).toBe(500);
      expect(result.movies).toBeUndefined();
    });
  });

  describe('buildSearchConditions', () => {
    it('should build conditions for text search only', () => {
      const params = new URLSearchParams('q=Matrix');

      const conditions = SearchData.buildSearchConditions(params);

      expect(conditions.OR).toHaveLength(5);
      expect(conditions.OR).toContainEqual({
        title: { contains: 'Matrix', mode: 'insensitive' },
      });
      expect(conditions.OR).toContainEqual({
        director: { contains: 'Matrix', mode: 'insensitive' },
      });
    });

    it('should build conditions for subtitles filter', () => {
      const params = new URLSearchParams('subtitles=FR');

      const conditions = SearchData.buildSearchConditions(params);

      expect(conditions.AND).toContainEqual({
        subtitles: { has: 'FR' },
      });
    });

    it('should build conditions for decade filter', () => {
      const params = new URLSearchParams('decade=1990');

      const conditions = SearchData.buildSearchConditions(params);

      expect(conditions.AND).toContainEqual({
        year: {
          gte: 1990,
          lte: 1999,
        },
      });
    });

    it('should build conditions for language filter', () => {
      const params = new URLSearchParams('language=France');

      const conditions = SearchData.buildSearchConditions(params);

      expect(conditions.AND).toContainEqual({
        country: { contains: 'France', mode: 'insensitive' },
      });
    });

    it('should build conditions for genre filter', () => {
      const params = new URLSearchParams('genre=Action');

      const conditions = SearchData.buildSearchConditions(params);

      expect(conditions.AND).toContainEqual({
        genresIds: {
          some: {
            genre: {
              OR: [
                { nameFR: { contains: 'Action', mode: 'insensitive' } },
                { nameEN: { contains: 'Action', mode: 'insensitive' } },
                { nameJP: { contains: 'Action', mode: 'insensitive' } },
              ],
            },
          },
        },
      });
    });

    it('should build combined conditions for multiple filters', () => {
      const params = new URLSearchParams(
        'q=Matrix&subtitles=EN&decade=1990&language=USA&genre=Sci-Fi'
      );

      const conditions = SearchData.buildSearchConditions(params);

      expect(conditions.OR).toHaveLength(5);
      expect(conditions.AND).toHaveLength(4);
    });

    it('should return empty conditions for no parameters', () => {
      const params = new URLSearchParams('');

      const conditions = SearchData.buildSearchConditions(params);

      expect(conditions.OR).toBeUndefined();
      expect(conditions.AND).toBeUndefined();
    });
  });

  describe('searchMovies', () => {
    it('should search movies with given conditions', async () => {
      const mockMovies = [
        {
          id: '1',
          title: 'Matrix',
          genresIds: [
            {
              genre: {
                id: '1',
                nameFR: 'Science-Fiction',
                nameEN: 'Sci-Fi',
                nameJP: 'SF',
              },
            },
          ],
        },
      ];

      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMovies);

      const whereClause = {
        OR: [{ title: { contains: 'Matrix', mode: 'insensitive' as const } }],
      };

      const result = await SearchData.searchMovies(whereClause, 10);

      expect(result).toEqual({
        movies: mockMovies,
        status: 200,
        prevOffset: 10,
      });

      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        where: whereClause,
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
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    });

    it('should handle search errors', async () => {
      (prisma.movie.findMany as jest.Mock).mockRejectedValue(
        new Error('Search failed')
      );

      const whereClause = { OR: [] };
      const result = await SearchData.searchMovies(whereClause, 10);

      expect(result.status).toBe(500);
      expect(result.movies).toBeUndefined();
    });

    it('should return empty array when no movies match', async () => {
      (prisma.movie.findMany as jest.Mock).mockResolvedValue([]);

      const whereClause = { OR: [] };
      const result = await SearchData.searchMovies(whereClause, 10);

      expect(result).toEqual({
        movies: [],
        status: 200,
        prevOffset: 10,
      });
    });
  });
});
