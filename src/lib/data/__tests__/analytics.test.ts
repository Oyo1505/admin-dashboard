import { AnalyticsData } from '../analytics';
import prisma from '@/lib/prisma';
import { handlePrismaError, logError } from '@/lib/errors';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    analyticsApplication: {
      findFirst: jest.fn(),
    },
    analyticsUser: {
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

describe('AnalyticsData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAnalyticsApplicationVisits', () => {
    it('should return application visits successfully', async () => {
      const mockAnalytics = {
        id: '1',
        visits: 1500,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.analyticsApplication.findFirst as jest.Mock).mockResolvedValue(
        mockAnalytics
      );

      const result = await AnalyticsData.getAnalyticsApplicationVisits();

      expect(result).toEqual({
        visits: 1500,
        status: 200,
      });
      expect(prisma.analyticsApplication.findFirst).toHaveBeenCalled();
    });

    it('should return 0 visits when no analytics found', async () => {
      (prisma.analyticsApplication.findFirst as jest.Mock).mockResolvedValue(
        null
      );

      const result = await AnalyticsData.getAnalyticsApplicationVisits();

      expect(result).toEqual({
        visits: 0,
        status: 200,
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      (prisma.analyticsApplication.findFirst as jest.Mock).mockRejectedValue(
        mockError
      );

      const result = await AnalyticsData.getAnalyticsApplicationVisits();

      expect(result).toEqual({
        visits: 0,
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(
        mockError,
        'getAnalyticsApplicationVisits'
      );
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getAnalyticsUser', () => {
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      name: 'Test User',
    };

    it('should return user analytics successfully', async () => {
      const mockAnalytics = [
        {
          id: 'analytics-1',
          userId: 'user-123',
          lastLogin: new Date('2024-01-01'),
          lastMovieWatched: 'movie-456',
          visits: 10,
        },
        {
          id: 'analytics-2',
          userId: 'user-123',
          lastLogin: new Date('2024-01-02'),
          lastMovieWatched: null,
          visits: 5,
        },
      ];

      (prisma.analyticsUser.findMany as jest.Mock).mockResolvedValue(
        mockAnalytics
      );

      const result = await AnalyticsData.getAnalyticsUser(mockUser);

      expect(result).toEqual({
        analytics: mockAnalytics,
        status: 200,
      });
      expect(prisma.analyticsUser.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
        },
      });
    });

    it('should return undefined when no analytics found', async () => {
      (prisma.analyticsUser.findMany as jest.Mock).mockResolvedValue(null);

      const result = await AnalyticsData.getAnalyticsUser(mockUser);

      expect(result).toEqual({
        analytics: undefined,
        status: 200,
      });
    });

    it('should return empty array when user has no analytics', async () => {
      (prisma.analyticsUser.findMany as jest.Mock).mockResolvedValue([]);

      const result = await AnalyticsData.getAnalyticsUser(mockUser);

      expect(result).toEqual({
        analytics: [],
        status: 200,
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database query failed');
      (prisma.analyticsUser.findMany as jest.Mock).mockRejectedValue(mockError);

      const result = await AnalyticsData.getAnalyticsUser(mockUser);

      expect(result).toEqual({
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(mockError, 'getAnalyticsUser');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });
});
