import { UserData } from '../users';
import prisma from '@/lib/prisma';
import { handlePrismaError, logError } from '@/lib/errors';
import { AnalyticsData } from '../analytics';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
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

jest.mock('../analytics', () => ({
  AnalyticsData: {
    getAnalyticsUser: jest.fn(),
  },
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: any) => fn,
}));

describe('UserData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUnique', () => {
    it('should find user by email successfully', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: new Date(),
        image: 'https://example.com/avatar.jpg',
        role: 'USER',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await UserData.findUnique('john@example.com');

      expect(result).toEqual({
        user: mockUser,
        status: 200,
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
    });

    it('should return undefined when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await UserData.findUnique('notfound@example.com');

      expect(result).toEqual({
        user: undefined,
        status: 200,
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(mockError);

      const result = await UserData.findUnique('john@example.com');

      expect(result).toEqual({
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(mockError, 'findUnique');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getUserConnected', () => {
    const mockUser = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      emailVerified: new Date(),
      image: 'https://example.com/avatar.jpg',
      role: 'USER' as const,
    };

    it('should return user with analytics successfully', async () => {
      const mockAnalytics = [
        {
          id: 'analytics-1',
          lastLogin: new Date('2024-01-01'),
          lastMovieWatched: 'movie-123',
          visits: 10,
        },
      ];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (AnalyticsData.getAnalyticsUser as jest.Mock).mockResolvedValue({
        analytics: mockAnalytics,
        status: 200,
      });

      const result = await UserData.getUserConnected('john@example.com');

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          emailVerified: mockUser.emailVerified,
          image: mockUser.image,
          role: mockUser.role,
          analytics: [
            {
              id: 'analytics-1',
              lastLogin: mockAnalytics[0].lastLogin,
              lastMovieWatched: 'movie-123',
            },
          ],
        },
        status: 200,
      });
    });

    it('should return user without analytics when none exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (AnalyticsData.getAnalyticsUser as jest.Mock).mockResolvedValue({
        analytics: undefined,
        status: 200,
      });

      const result = await UserData.getUserConnected('john@example.com');

      expect(result.status).toBe(200);
      expect(result.user).toBeDefined();
      expect(result.user?.analytics).toBeUndefined();
    });

    it('should handle null lastMovieWatched', async () => {
      const mockAnalyticsWithNull = [
        {
          id: 'analytics-1',
          lastLogin: new Date('2024-01-01'),
          lastMovieWatched: null,
          visits: 10,
        },
      ];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (AnalyticsData.getAnalyticsUser as jest.Mock).mockResolvedValue({
        analytics: mockAnalyticsWithNull,
        status: 200,
      });

      const result = await UserData.getUserConnected('john@example.com');

      expect(result.user?.analytics?.[0].lastMovieWatched).toBeUndefined();
    });

    it('should return 400 when email is empty', async () => {
      const result = await UserData.getUserConnected('');

      expect(result).toEqual({
        status: 400,
      });
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should return 400 when email is whitespace', async () => {
      const result = await UserData.getUserConnected('   ');

      expect(result).toEqual({
        status: 400,
      });
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await UserData.getUserConnected('notfound@example.com');

      expect(result).toEqual({
        status: 404,
      });
    });

    it('should handle errors from analytics fetch', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (AnalyticsData.getAnalyticsUser as jest.Mock).mockImplementation(() => {
        throw new Error('Analytics service failed');
      });

      const result = await UserData.getUserConnected('john@example.com');

      expect(result).toEqual({
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(
        expect.any(Error),
        'getUserConnected'
      );
      expect(handlePrismaError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getAllAnalyticsUser', () => {
    it('should return all users with analytics', async () => {
      const mockUsersWithAnalytics = [
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          emailVerified: new Date(),
          image: 'https://example.com/john.jpg',
          role: 'USER',
          analytics: [
            {
              id: 'analytics-1',
              userId: 'user-1',
              lastLogin: new Date('2024-01-01'),
              lastMovieWatched: 'movie-123',
              visits: 10,
            },
          ],
        },
        {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          emailVerified: new Date(),
          image: 'https://example.com/jane.jpg',
          role: 'ADMIN',
          analytics: [
            {
              id: 'analytics-2',
              userId: 'user-2',
              lastLogin: new Date('2024-01-02'),
              lastMovieWatched: null,
              visits: 5,
            },
          ],
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(
        mockUsersWithAnalytics
      );

      const result = await UserData.getAllAnalyticsUser();

      expect(result.status).toBe(200);
      expect(result.users).toHaveLength(2);
      expect(result.users?.[0]).toEqual({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: mockUsersWithAnalytics[0].emailVerified,
        image: 'https://example.com/john.jpg',
        role: 'USER',
        analytics: [
          {
            id: 'analytics-1',
            lastLogin: mockUsersWithAnalytics[0].analytics[0].lastLogin,
            lastMovieWatched: 'movie-123',
            visits: 10,
          },
        ],
      });
      expect(result.users?.[1].analytics[0].lastMovieWatched).toBeUndefined();
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          analytics: {
            some: {},
          },
        },
        include: {
          analytics: {
            orderBy: {
              lastLogin: 'desc',
            },
          },
        },
      });
    });

    it('should return empty array when no users with analytics', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      const result = await UserData.getAllAnalyticsUser();

      expect(result).toEqual({
        users: [],
        status: 200,
      });
    });

    it('should handle users with multiple analytics records', async () => {
      const mockUserWithMultipleAnalytics = [
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          emailVerified: new Date(),
          image: 'https://example.com/john.jpg',
          role: 'USER',
          analytics: [
            {
              id: 'analytics-1',
              userId: 'user-1',
              lastLogin: new Date('2024-01-03'),
              lastMovieWatched: 'movie-123',
              visits: 15,
            },
            {
              id: 'analytics-2',
              userId: 'user-1',
              lastLogin: new Date('2024-01-01'),
              lastMovieWatched: 'movie-456',
              visits: 8,
            },
          ],
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(
        mockUserWithMultipleAnalytics
      );

      const result = await UserData.getAllAnalyticsUser();

      expect(result.users?.[0].analytics).toHaveLength(2);
      expect(result.users?.[0].analytics[0].visits).toBe(15);
      expect(result.users?.[0].analytics[1].visits).toBe(8);
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database query failed');
      (prisma.user.findMany as jest.Mock).mockRejectedValue(mockError);

      const result = await UserData.getAllAnalyticsUser();

      expect(result).toEqual({
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(mockError, 'getAllAnalyticsUser');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });
});
