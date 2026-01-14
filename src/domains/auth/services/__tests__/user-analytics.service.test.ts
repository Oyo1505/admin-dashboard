import { UserAnalyticsService } from '../user-analytics.service';
import { validateId } from '@/lib/api-wrapper';
import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { isSameDay } from '@/shared/utils/date/isSameDay';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    analyticsUser: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    analyticsApplication: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/api-wrapper', () => ({
  validateId: jest.fn(),
}));

jest.mock('@/lib/errors', () => ({
  handlePrismaError: jest.fn((error) => ({
    statusCode: 500,
    message: 'Database error',
  })),
  logError: jest.fn(),
}));

jest.mock('@/shared/utils/date/isSameDay', () => ({
  isSameDay: jest.fn(),
}));

describe('UserAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recordUserLogin', () => {
    it('should create analytics record for first login', async () => {
      (validateId as jest.Mock).mockImplementation(() => {});
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
      });
      (prisma.analyticsUser.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.analyticsUser.create as jest.Mock).mockResolvedValue({
        id: '1',
        userId: 'user-123',
        visits: 1,
        lastLogin: new Date(),
      });

      const result = await UserAnalyticsService.recordUserLogin('user-123');

      expect(result).toEqual({
        status: 200,
        message: 'Login recorded successfully',
      });
      expect(validateId).toHaveBeenCalledWith('user-123');
      expect(prisma.analyticsUser.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          lastLogin: expect.any(Date),
          visits: 1,
        },
      });
    });

    it('should update analytics record for returning user on different day', async () => {
      (validateId as jest.Mock).mockImplementation(() => {});
      (isSameDay as jest.Mock).mockReturnValue(false); // Different day
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
      });
      (prisma.analyticsUser.findFirst as jest.Mock).mockResolvedValue({
        id: 'analytics-1',
        userId: 'user-123',
        visits: 5,
        lastLogin: new Date('2024-01-01'),
      });
      (prisma.analyticsUser.update as jest.Mock).mockResolvedValue({
        id: 'analytics-1',
        userId: 'user-123',
        visits: 6,
        lastLogin: new Date(),
      });

      const result = await UserAnalyticsService.recordUserLogin('user-123');

      expect(result).toEqual({
        status: 200,
        message: 'Login recorded successfully',
      });
      expect(prisma.analyticsUser.update).toHaveBeenCalledWith({
        where: { id: 'analytics-1' },
        data: {
          lastLogin: expect.any(Date),
          visits: { increment: 1 },
        },
      });
    });

    it('should NOT update analytics if user already logged in same day (optimization)', async () => {
      (validateId as jest.Mock).mockImplementation(() => {});
      (isSameDay as jest.Mock).mockReturnValue(true); // Same day
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
      });
      (prisma.analyticsUser.findFirst as jest.Mock).mockResolvedValue({
        id: 'analytics-1',
        userId: 'user-123',
        visits: 5,
        lastLogin: new Date(), // Today
      });

      const result = await UserAnalyticsService.recordUserLogin('user-123');

      expect(result).toEqual({
        status: 200,
        message: 'Login recorded successfully',
      });
      // Should NOT call update because same day
      expect(prisma.analyticsUser.update).not.toHaveBeenCalled();
      expect(prisma.analyticsUser.create).not.toHaveBeenCalled();
    });

    it('should update analytics if lastLogin is null (legacy user)', async () => {
      (validateId as jest.Mock).mockImplementation(() => {});
      (isSameDay as jest.Mock).mockReturnValue(false); // null date returns false
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
      });
      (prisma.analyticsUser.findFirst as jest.Mock).mockResolvedValue({
        id: 'analytics-1',
        userId: 'user-123',
        visits: 5,
        lastLogin: null, // Legacy user without lastLogin
      });
      (prisma.analyticsUser.update as jest.Mock).mockResolvedValue({
        id: 'analytics-1',
        userId: 'user-123',
        visits: 6,
        lastLogin: new Date(),
      });

      const result = await UserAnalyticsService.recordUserLogin('user-123');

      expect(result).toEqual({
        status: 200,
        message: 'Login recorded successfully',
      });
      expect(isSameDay).toHaveBeenCalledWith(expect.any(Date), null);
      expect(prisma.analyticsUser.update).toHaveBeenCalledWith({
        where: { id: 'analytics-1' },
        data: {
          lastLogin: expect.any(Date),
          visits: { increment: 1 },
        },
      });
    });

    it('should return 404 when user not found', async () => {
      (validateId as jest.Mock).mockImplementation(() => {});
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await UserAnalyticsService.recordUserLogin('user-123');

      expect(result).toEqual({
        status: 404,
        message: 'User not found',
      });
      expect(prisma.analyticsUser.create).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      (validateId as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid ID format');
      });

      const result = await UserAnalyticsService.recordUserLogin('invalid-id');

      expect(result).toEqual({
        status: 500,
        message: 'Database error',
      });
      expect(logError).toHaveBeenCalledWith(
        expect.any(Error),
        'UserAnalyticsService.recordUserLogin'
      );
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      (validateId as jest.Mock).mockImplementation(() => {});
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(mockError);

      const result = await UserAnalyticsService.recordUserLogin('user-123');

      expect(result).toEqual({
        status: 500,
        message: 'Database error',
      });
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('recordMovieViewed', () => {
    it('should record movie viewing successfully', async () => {
      (prisma.analyticsUser.updateMany as jest.Mock).mockResolvedValue({
        count: 1,
      });

      const result = await UserAnalyticsService.recordMovieViewed(
        'user-123',
        'movie-456'
      );

      expect(result).toEqual({
        status: 200,
        message: 'Movie viewing recorded',
      });
      expect(prisma.analyticsUser.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: {
          lastMovieWatched: 'movie-456',
        },
      });
    });

    it('should return 400 when userId is empty', async () => {
      const result = await UserAnalyticsService.recordMovieViewed(
        '',
        'movie-456'
      );

      expect(result).toEqual({
        status: 400,
        message: 'User ID is required',
      });
      expect(prisma.analyticsUser.updateMany).not.toHaveBeenCalled();
    });

    it('should return 400 when userId is whitespace', async () => {
      const result = await UserAnalyticsService.recordMovieViewed(
        '   ',
        'movie-456'
      );

      expect(result).toEqual({
        status: 400,
        message: 'User ID is required',
      });
    });

    it('should return 400 when movieId is empty', async () => {
      const result = await UserAnalyticsService.recordMovieViewed(
        'user-123',
        ''
      );

      expect(result).toEqual({
        status: 400,
        message: 'Movie ID is required',
      });
      expect(prisma.analyticsUser.updateMany).not.toHaveBeenCalled();
    });

    it('should return 400 when movieId is whitespace', async () => {
      const result = await UserAnalyticsService.recordMovieViewed(
        'user-123',
        '   '
      );

      expect(result).toEqual({
        status: 400,
        message: 'Movie ID is required',
      });
    });

    it('should return 404 when no analytics record found', async () => {
      (prisma.analyticsUser.updateMany as jest.Mock).mockResolvedValue({
        count: 0,
      });

      const result = await UserAnalyticsService.recordMovieViewed(
        'user-123',
        'movie-456'
      );

      expect(result).toEqual({
        status: 404,
        message: 'No analytics record found for this user',
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Update failed');
      (prisma.analyticsUser.updateMany as jest.Mock).mockRejectedValue(
        mockError
      );

      const result = await UserAnalyticsService.recordMovieViewed(
        'user-123',
        'movie-456'
      );

      expect(result).toEqual({
        status: 500,
        message: 'Database error',
      });
      expect(logError).toHaveBeenCalledWith(
        mockError,
        'UserAnalyticsService.recordMovieViewed'
      );
    });
  });

  describe('incrementApplicationVisits', () => {
    it('should create initial application analytics', async () => {
      (prisma.analyticsApplication.findFirst as jest.Mock).mockResolvedValue(
        null
      );
      (prisma.analyticsApplication.create as jest.Mock).mockResolvedValue({
        id: '1',
        visits: 1,
      });

      const result = await UserAnalyticsService.incrementApplicationVisits();

      expect(result).toEqual({
        status: 200,
        visits: 1,
        message: 'Application analytics initialized',
      });
      expect(prisma.analyticsApplication.create).toHaveBeenCalledWith({
        data: { visits: 1 },
      });
    });

    it('should increment existing application visits', async () => {
      (prisma.analyticsApplication.findFirst as jest.Mock).mockResolvedValue({
        id: '1',
        visits: 100,
      });
      (prisma.analyticsApplication.update as jest.Mock).mockResolvedValue({
        id: '1',
        visits: 101,
      });

      const result = await UserAnalyticsService.incrementApplicationVisits();

      expect(result).toEqual({
        status: 200,
        visits: 101,
        message: 'Application visits incremented',
      });
      expect(prisma.analyticsApplication.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { visits: { increment: 1 } },
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      (prisma.analyticsApplication.findFirst as jest.Mock).mockRejectedValue(
        mockError
      );

      const result = await UserAnalyticsService.incrementApplicationVisits();

      expect(result).toEqual({
        status: 500,
        message: 'Database error',
      });
      expect(logError).toHaveBeenCalledWith(
        mockError,
        'UserAnalyticsService.incrementApplicationVisits'
      );
    });
  });

  describe('getUserAnalyticsSummary', () => {
    it('should return analytics summary for user', async () => {
      (validateId as jest.Mock).mockImplementation(() => {});
      const mockAnalytics = [
        {
          id: '1',
          userId: 'user-123',
          visits: 10,
          lastLogin: new Date('2024-03-15'),
          lastMovieWatched: 'movie-456',
        },
        {
          id: '2',
          userId: 'user-123',
          visits: 5,
          lastLogin: new Date('2024-03-10'),
          lastMovieWatched: 'movie-123',
        },
      ];

      (prisma.analyticsUser.findMany as jest.Mock).mockResolvedValue(
        mockAnalytics
      );

      const result =
        await UserAnalyticsService.getUserAnalyticsSummary('user-123');

      expect(result).toEqual({
        status: 200,
        summary: {
          totalVisits: 15,
          lastLogin: new Date('2024-03-15'),
          lastMovieWatched: 'movie-456',
        },
        message: 'Analytics summary retrieved',
      });
      expect(validateId).toHaveBeenCalledWith('user-123');
      expect(prisma.analyticsUser.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { lastLogin: 'desc' },
      });
    });

    it('should handle null visits in analytics records', async () => {
      (validateId as jest.Mock).mockImplementation(() => {});
      const mockAnalytics = [
        {
          id: '1',
          userId: 'user-123',
          visits: null,
          lastLogin: new Date('2024-03-15'),
          lastMovieWatched: null,
        },
      ];

      (prisma.analyticsUser.findMany as jest.Mock).mockResolvedValue(
        mockAnalytics
      );

      const result =
        await UserAnalyticsService.getUserAnalyticsSummary('user-123');

      expect(result.summary?.totalVisits).toBe(0);
      expect(result.summary?.lastMovieWatched).toBeNull();
    });

    it('should return 404 when no analytics found', async () => {
      (validateId as jest.Mock).mockImplementation(() => {});
      (prisma.analyticsUser.findMany as jest.Mock).mockResolvedValue([]);

      const result =
        await UserAnalyticsService.getUserAnalyticsSummary('user-123');

      expect(result).toEqual({
        status: 404,
        message: 'No analytics found for this user',
      });
    });

    it('should return 404 when analytics is null', async () => {
      (validateId as jest.Mock).mockImplementation(() => {});
      (prisma.analyticsUser.findMany as jest.Mock).mockResolvedValue(null);

      const result =
        await UserAnalyticsService.getUserAnalyticsSummary('user-123');

      expect(result).toEqual({
        status: 404,
        message: 'No analytics found for this user',
      });
    });

    it('should handle validation errors', async () => {
      (validateId as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid ID');
      });

      const result =
        await UserAnalyticsService.getUserAnalyticsSummary('invalid-id');

      expect(result).toEqual({
        status: 500,
        message: 'Database error',
      });
      expect(logError).toHaveBeenCalledWith(
        expect.any(Error),
        'UserAnalyticsService.getUserAnalyticsSummary'
      );
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database query failed');
      (validateId as jest.Mock).mockImplementation(() => {});
      (prisma.analyticsUser.findMany as jest.Mock).mockRejectedValue(mockError);

      const result =
        await UserAnalyticsService.getUserAnalyticsSummary('user-123');

      expect(result).toEqual({
        status: 500,
        message: 'Database error',
      });
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('resetUserAnalytics', () => {
    it('should reset user analytics successfully', async () => {
      (validateId as jest.Mock).mockImplementation(() => {});
      (prisma.analyticsUser.deleteMany as jest.Mock).mockResolvedValue({
        count: 3,
      });

      const result = await UserAnalyticsService.resetUserAnalytics('user-123');

      expect(result).toEqual({
        status: 200,
        message: 'User analytics reset successfully',
      });
      expect(validateId).toHaveBeenCalledWith('user-123');
      expect(prisma.analyticsUser.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });

    it('should handle validation errors', async () => {
      (validateId as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid ID format');
      });

      const result =
        await UserAnalyticsService.resetUserAnalytics('invalid-id');

      expect(result).toEqual({
        status: 500,
        message: 'Database error',
      });
      expect(logError).toHaveBeenCalledWith(
        expect.any(Error),
        'UserAnalyticsService.resetUserAnalytics'
      );
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Delete failed');
      (validateId as jest.Mock).mockImplementation(() => {});
      (prisma.analyticsUser.deleteMany as jest.Mock).mockRejectedValue(
        mockError
      );

      const result = await UserAnalyticsService.resetUserAnalytics('user-123');

      expect(result).toEqual({
        status: 500,
        message: 'Database error',
      });
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });
});
