import { AnalyticsData } from '../analytics';
import prisma from '@/lib/prisma';
import { handlePrismaError, logError } from '@/lib/errors';
import HttpStatus from '@/shared/constants/httpStatus';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    movie: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    genre: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    analyticsUser: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}));

jest.mock('@/lib/errors', () => ({
  handlePrismaError: jest.fn((error) => ({
    statusCode: 500,
    message: 'Database error',
  })),
  logError: jest.fn(),
}));

describe('AnalyticsData - Extended Methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAggregatedStats', () => {
    it('should return aggregated statistics successfully', async () => {
      const mockStats = {
        totalUsers: 100,
        totalMovies: 500,
        totalGenres: 20,
        activeUsers: 45,
        publishedMovies: 450,
        unpublishedMovies: 50,
      };

      (prisma.user.count as jest.Mock).mockResolvedValue(100);
      (prisma.movie.count as jest.Mock)
        .mockResolvedValueOnce(500) // total movies
        .mockResolvedValueOnce(450) // published
        .mockResolvedValueOnce(50); // unpublished
      (prisma.genre.count as jest.Mock).mockResolvedValue(20);
      (prisma.analyticsUser.count as jest.Mock).mockResolvedValue(45);

      const result = await AnalyticsData.getAggregatedStats();

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.stats).toEqual(mockStats);
      expect(prisma.user.count).toHaveBeenCalled();
      expect(prisma.movie.count).toHaveBeenCalledTimes(3);
      expect(prisma.genre.count).toHaveBeenCalled();
      expect(prisma.analyticsUser.count).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (prisma.user.count as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await AnalyticsData.getAggregatedStats();

      expect(result.status).toBe(500);
      expect(result.stats).toBeUndefined();
      expect(logError).toHaveBeenCalled();
    });
  });

  describe('getTopMovies', () => {
    it('should return top movies by favorites count', async () => {
      const mockMovies = [
        {
          id: '1',
          title: 'Movie 1',
          image: 'image1.jpg',
          _count: { favoriteMovies: 50 },
        },
        {
          id: '2',
          title: 'Movie 2',
          image: 'image2.jpg',
          _count: { favoriteMovies: 30 },
        },
      ];

      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMovies);

      const result = await AnalyticsData.getTopMovies(5);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.movies).toHaveLength(2);
      expect(result.movies?.[0]).toEqual({
        id: '1',
        title: 'Movie 1',
        image: 'image1.jpg',
        favoritesCount: 50,
      });
      expect(prisma.movie.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { publish: true },
          take: 5,
        })
      );
    });

    it('should handle empty results', async () => {
      (prisma.movie.findMany as jest.Mock).mockResolvedValue([]);

      const result = await AnalyticsData.getTopMovies(5);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.movies).toEqual([]);
    });

    it('should handle errors', async () => {
      (prisma.movie.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await AnalyticsData.getTopMovies(5);

      expect(result.status).toBe(500);
      expect(result.movies).toBeUndefined();
      expect(logError).toHaveBeenCalled();
    });
  });

  describe('getTopUsers', () => {
    it('should return top users by visits count', async () => {
      const mockAnalytics = [
        {
          userId: 'user1',
          visits: 100,
          lastLogin: new Date('2024-01-10'),
          user: {
            id: 'user1',
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
        {
          userId: 'user2',
          visits: 80,
          lastLogin: new Date('2024-01-09'),
          user: {
            id: 'user2',
            name: 'Jane Smith',
            email: 'jane@example.com',
          },
        },
      ];

      (prisma.analyticsUser.findMany as jest.Mock).mockResolvedValue(
        mockAnalytics
      );

      const result = await AnalyticsData.getTopUsers(5);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.users).toHaveLength(2);
      expect(result.users?.[0]).toEqual({
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        visits: 100,
        lastLogin: new Date('2024-01-10'),
      });
    });

    it('should handle errors', async () => {
      (prisma.analyticsUser.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await AnalyticsData.getTopUsers(5);

      expect(result.status).toBe(500);
      expect(result.users).toBeUndefined();
      expect(logError).toHaveBeenCalled();
    });
  });

  describe('getTopGenres', () => {
    it('should return top genres by favorites count', async () => {
      const mockGenres = [
        {
          id: '1',
          nameFR: 'Action',
          nameEN: 'Action',
          nameJP: 'アクション',
          count: BigInt(3),
        },
        {
          id: '2',
          nameFR: 'Drame',
          nameEN: 'Drama',
          nameJP: 'ドラマ',
          count: BigInt(2),
        },
      ];

      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockGenres);

      const result = await AnalyticsData.getTopGenres(5);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.genres).toBeDefined();
      expect(result.genres?.[0].count).toBe(3);
      expect(result.genres?.[1].count).toBe(2);
    });

    it('should handle errors', async () => {
      (prisma.$queryRaw as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await AnalyticsData.getTopGenres(5);

      expect(result.status).toBe(500);
      expect(result.genres).toBeUndefined();
      expect(logError).toHaveBeenCalled();
    });
  });

  describe('getRecentActivity', () => {
    it('should return recent activity with counts and items', async () => {
      const mockRecentUsers = [
        { id: '1', name: 'User 1', createdAt: new Date() },
      ];
      const mockRecentMovies = [
        { id: '1', title: 'Movie 1', createdAt: new Date() },
      ];

      (prisma.user.count as jest.Mock).mockResolvedValue(5);
      (prisma.movie.count as jest.Mock).mockResolvedValue(10);
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockRecentUsers);
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockRecentMovies);

      const result = await AnalyticsData.getRecentActivity(7);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.activity).toEqual({
        newUsers: 5,
        newMovies: 10,
        recentUsers: mockRecentUsers,
        recentMovies: mockRecentMovies,
      });
    });

    it('should handle errors', async () => {
      (prisma.user.count as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await AnalyticsData.getRecentActivity(7);

      expect(result.status).toBe(500);
      expect(result.activity).toBeUndefined();
      expect(logError).toHaveBeenCalled();
    });
  });
});
