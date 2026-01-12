import { AnalyticsService } from '../analytics.service';
import { AnalyticsData } from '@/lib/data/analytics';
import { MovieData } from '@/lib/data/movies';
import HttpStatus from '@/shared/constants/httpStatus';

jest.mock('@/lib/data/analytics');
jest.mock('@/lib/data/movies');

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserStats', () => {
    it('should return user statistics successfully', async () => {
      const mockFavoriteStats = {
        stats: {
          totalFavorites: 10,
          favoriteGenre: {
            id: '1',
            nameFR: 'Action',
            nameEN: 'Action',
            nameJP: 'アクション',
          },
        },
        status: HttpStatus.OK,
      };

      const mockRecentFavorites = {
        favorites: [
          { id: 'movie1', title: 'Movie 1', image: 'img1.jpg' },
          { id: 'movie2', title: 'Movie 2', image: 'img2.jpg' },
        ],
        status: HttpStatus.OK,
      };

      (MovieData.getUserFavoriteStats as jest.Mock).mockResolvedValue(
        mockFavoriteStats
      );
      (MovieData.getRecentFavorites as jest.Mock).mockResolvedValue(
        mockRecentFavorites
      );

      const result = await AnalyticsService.getUserStats('user123');

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data).toEqual({
        totalFavorites: 10,
        favoriteGenre: mockFavoriteStats.stats.favoriteGenre,
        recentFavorites: mockRecentFavorites.favorites,
      });
      expect(MovieData.getUserFavoriteStats).toHaveBeenCalledWith('user123');
      expect(MovieData.getRecentFavorites).toHaveBeenCalledWith(
        'user123',
        expect.any(Number)
      );
    });

    it('should return BAD_REQUEST when userId is empty', async () => {
      const result = await AnalyticsService.getUserStats('');

      expect(result.status).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toBe('User ID is required');
      expect(MovieData.getUserFavoriteStats).not.toHaveBeenCalled();
    });

    it('should handle data layer errors', async () => {
      (MovieData.getUserFavoriteStats as jest.Mock).mockResolvedValue({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });

      const result = await AnalyticsService.getUserStats('user123');

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe('Failed to fetch user statistics');
    });

    it('should handle exceptions', async () => {
      (MovieData.getUserFavoriteStats as jest.Mock).mockRejectedValue(
        new Error('Unexpected error')
      );

      const result = await AnalyticsService.getUserStats('user123');

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe('Internal server error');
    });
  });

  describe('getAdminDashboardStats', () => {
    it('should return comprehensive admin stats successfully', async () => {
      const mockAggregatedStats = {
        stats: {
          totalUsers: 100,
          totalMovies: 500,
          totalGenres: 20,
          activeUsers: 45,
          publishedMovies: 450,
          unpublishedMovies: 50,
        },
        status: HttpStatus.OK,
      };

      const mockTopMovies = {
        movies: [{ id: '1', title: 'Movie 1', favoritesCount: 50 }],
        status: HttpStatus.OK,
      };

      const mockTopUsers = {
        users: [
          {
            id: 'user1',
            name: 'User 1',
            email: 'user1@test.com',
            visits: 100,
          },
        ],
        status: HttpStatus.OK,
      };

      const mockTopGenres = {
        genres: [{ id: '1', nameFR: 'Action', count: 100 }],
        status: HttpStatus.OK,
      };

      const mockRecentActivity = {
        activity: {
          newUsers: 5,
          newMovies: 10,
          recentUsers: [],
          recentMovies: [],
        },
        status: HttpStatus.OK,
      };

      const mockApplicationVisits = {
        visits: 1000,
        status: HttpStatus.OK,
      };

      (AnalyticsData.getAggregatedStats as jest.Mock).mockResolvedValue(
        mockAggregatedStats
      );
      (AnalyticsData.getTopMovies as jest.Mock).mockResolvedValue(
        mockTopMovies
      );
      (AnalyticsData.getTopUsers as jest.Mock).mockResolvedValue(mockTopUsers);
      (AnalyticsData.getTopGenres as jest.Mock).mockResolvedValue(
        mockTopGenres
      );
      (AnalyticsData.getRecentActivity as jest.Mock).mockResolvedValue(
        mockRecentActivity
      );
      (AnalyticsData.getAnalyticsApplicationVisits as jest.Mock).mockResolvedValue(
        mockApplicationVisits
      );

      const result = await AnalyticsService.getAdminDashboardStats();

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data).toEqual({
        aggregatedStats: mockAggregatedStats.stats,
        topMovies: mockTopMovies.movies,
        topUsers: mockTopUsers.users,
        topGenres: mockTopGenres.genres,
        recentActivity: mockRecentActivity.activity,
        totalVisits: mockApplicationVisits.visits,
      });
    });

    it('should handle data layer errors', async () => {
      (AnalyticsData.getAggregatedStats as jest.Mock).mockResolvedValue({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
      (AnalyticsData.getTopMovies as jest.Mock).mockResolvedValue({
        status: HttpStatus.OK,
      });
      (AnalyticsData.getTopUsers as jest.Mock).mockResolvedValue({
        status: HttpStatus.OK,
      });
      (AnalyticsData.getTopGenres as jest.Mock).mockResolvedValue({
        status: HttpStatus.OK,
      });
      (AnalyticsData.getRecentActivity as jest.Mock).mockResolvedValue({
        status: HttpStatus.OK,
      });
      (AnalyticsData.getAnalyticsApplicationVisits as jest.Mock).mockResolvedValue({
        status: HttpStatus.OK,
      });

      const result = await AnalyticsService.getAdminDashboardStats();

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe('Failed to fetch admin statistics');
    });

    it('should handle exceptions', async () => {
      (AnalyticsData.getAggregatedStats as jest.Mock).mockRejectedValue(
        new Error('Unexpected error')
      );

      const result = await AnalyticsService.getAdminDashboardStats();

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe('Internal server error');
    });
  });

  describe('getTopMovies', () => {
    it('should return top movies successfully', async () => {
      const mockTopMovies = {
        movies: [
          { id: '1', title: 'Movie 1', favoritesCount: 50 },
          { id: '2', title: 'Movie 2', favoritesCount: 30 },
        ],
        status: HttpStatus.OK,
      };

      (AnalyticsData.getTopMovies as jest.Mock).mockResolvedValue(
        mockTopMovies
      );

      const result = await AnalyticsService.getTopMovies(5);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data).toEqual(mockTopMovies.movies);
      expect(AnalyticsData.getTopMovies).toHaveBeenCalledWith(5);
    });

    it('should handle errors', async () => {
      (AnalyticsData.getTopMovies as jest.Mock).mockResolvedValue({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });

      const result = await AnalyticsService.getTopMovies(5);

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe('Failed to fetch getTopMovies');
    });
  });

  describe('getTopUsers', () => {
    it('should return top users successfully', async () => {
      const mockTopUsers = {
        users: [
          {
            id: 'user1',
            name: 'User 1',
            email: 'user1@test.com',
            visits: 100,
          },
        ],
        status: HttpStatus.OK,
      };

      (AnalyticsData.getTopUsers as jest.Mock).mockResolvedValue(mockTopUsers);

      const result = await AnalyticsService.getTopUsers(5);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data).toEqual(mockTopUsers.users);
      expect(AnalyticsData.getTopUsers).toHaveBeenCalledWith(5);
    });

    it('should handle errors', async () => {
      (AnalyticsData.getTopUsers as jest.Mock).mockResolvedValue({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });

      const result = await AnalyticsService.getTopUsers(5);

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe('Failed to fetch getTopUsers');
    });
  });

  describe('getTopGenres', () => {
    it('should return top genres successfully', async () => {
      const mockTopGenres = {
        genres: [
          { id: '1', nameFR: 'Action', count: 100 },
          { id: '2', nameFR: 'Drame', count: 80 },
        ],
        status: HttpStatus.OK,
      };

      (AnalyticsData.getTopGenres as jest.Mock).mockResolvedValue(
        mockTopGenres
      );

      const result = await AnalyticsService.getTopGenres(5);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data).toEqual(mockTopGenres.genres);
      expect(AnalyticsData.getTopGenres).toHaveBeenCalledWith(5);
    });

    it('should handle errors', async () => {
      (AnalyticsData.getTopGenres as jest.Mock).mockResolvedValue({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });

      const result = await AnalyticsService.getTopGenres(5);

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe('Failed to fetch getTopGenres');
    });
  });

  describe('getRecentActivity', () => {
    it('should return recent activity successfully', async () => {
      const mockRecentActivity = {
        activity: {
          newUsers: 5,
          newMovies: 10,
          recentUsers: [{ id: 'user1', name: 'User 1', createdAt: new Date() }],
          recentMovies: [
            { id: 'movie1', title: 'Movie 1', createdAt: new Date() },
          ],
        },
        status: HttpStatus.OK,
      };

      (AnalyticsData.getRecentActivity as jest.Mock).mockResolvedValue(
        mockRecentActivity
      );

      const result = await AnalyticsService.getRecentActivity(7);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data).toEqual(mockRecentActivity.activity);
      expect(AnalyticsData.getRecentActivity).toHaveBeenCalledWith(7);
    });

    it('should handle errors', async () => {
      (AnalyticsData.getRecentActivity as jest.Mock).mockResolvedValue({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });

      const result = await AnalyticsService.getRecentActivity(7);

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe('Failed to fetch getRecentActivity');
    });

    it('should handle exceptions', async () => {
      (AnalyticsData.getRecentActivity as jest.Mock).mockRejectedValue(
        new Error('Unexpected error')
      );

      const result = await AnalyticsService.getRecentActivity(7);

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe('Internal server error');
    });
  });
});
