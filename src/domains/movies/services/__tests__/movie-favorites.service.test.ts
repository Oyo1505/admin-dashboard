import { MovieFavoriteService } from '../movie-favorites.service';
import { MovieData } from '@/lib/data/movies';
import { handlePrismaError, logError } from '@/lib/errors';
import { revalidatePath } from 'next/cache';

jest.mock('@/lib/data/movies');
jest.mock('@/lib/errors');
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('MovieFavoriteService', () => {
  const userId = 'user-123';
  const movieId = 'movie-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleFavorite', () => {
    it('should return 400 when movieId is undefined', async () => {
      const result = await MovieFavoriteService.handleFavorite(
        userId,
        undefined
      );

      expect(result).toEqual({
        status: 400,
        message: 'Missing movie',
      });
    });

    it('should delete favorite when it already exists', async () => {
      const mockExistingFavorite = {
        id: '1',
        userId,
        movieId,
      };

      (MovieData.findUniqueFavorite as jest.Mock).mockResolvedValue({
        favorite: mockExistingFavorite,
        status: 200,
      });

      (MovieData.deleteFavorite as jest.Mock).mockResolvedValue({
        status: 200,
        message: 'Success: movie deleted',
      });

      const result = await MovieFavoriteService.handleFavorite(userId, movieId);

      expect(result).toEqual({
        status: 200,
        message: 'Success: movie deleted',
      });

      expect(MovieData.findUniqueFavorite).toHaveBeenCalledWith(
        userId,
        movieId
      );
      expect(MovieData.deleteFavorite).toHaveBeenCalledWith(userId, movieId);
      expect(revalidatePath).toHaveBeenCalledWith(`/movies/${movieId}`);
    });

    it('should create favorite when it does not exist', async () => {
      (MovieData.findUniqueFavorite as jest.Mock).mockResolvedValue({
        favorite: undefined,
        status: 404,
      });

      (MovieData.createFavorite as jest.Mock).mockResolvedValue({
        favorite: {
          id: '1',
          userId,
          movieId,
        },
        status: 200,
        message: 'Added to favorite',
      });

      const result = await MovieFavoriteService.handleFavorite(userId, movieId);

      expect(result).toEqual({
        status: 200,
        message: 'Added to favorite',
      });

      expect(MovieData.findUniqueFavorite).toHaveBeenCalledWith(
        userId,
        movieId
      );
      expect(MovieData.createFavorite).toHaveBeenCalledWith(userId, movieId);
      expect(revalidatePath).toHaveBeenCalledWith(`/movies/${movieId}`);
    });

    it('should handle errors when checking if favorite exists', async () => {
      const mockError = new Error('Database connection failed');

      (MovieData.findUniqueFavorite as jest.Mock).mockRejectedValue(mockError);
      (handlePrismaError as jest.Mock).mockReturnValue({
        statusCode: 500,
        message: 'Database error',
      });

      const result = await MovieFavoriteService.handleFavorite(userId, movieId);

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(mockError, 'handleFavorite');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });

    it('should handle errors when creating favorite', async () => {
      const mockError = new Error('Unique constraint violation');

      (MovieData.findUniqueFavorite as jest.Mock).mockResolvedValue({
        favorite: undefined,
        status: 404,
      });

      (MovieData.createFavorite as jest.Mock).mockRejectedValue(mockError);
      (handlePrismaError as jest.Mock).mockReturnValue({
        statusCode: 500,
        message: 'Database error',
      });

      const result = await MovieFavoriteService.handleFavorite(userId, movieId);

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(mockError, 'handleFavorite');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });

    it('should handle errors when deleting favorite', async () => {
      const mockError = new Error('Record not found');
      const mockExistingFavorite = {
        id: '1',
        userId,
        movieId,
      };

      (MovieData.findUniqueFavorite as jest.Mock).mockResolvedValue({
        favorite: mockExistingFavorite,
        status: 200,
      });

      (MovieData.deleteFavorite as jest.Mock).mockRejectedValue(mockError);
      (handlePrismaError as jest.Mock).mockReturnValue({
        statusCode: 500,
        message: 'Database error',
      });

      const result = await MovieFavoriteService.handleFavorite(userId, movieId);

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(mockError, 'handleFavorite');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });

    it('should revalidate path after successful delete', async () => {
      const mockExistingFavorite = {
        id: '1',
        userId,
        movieId,
      };

      (MovieData.findUniqueFavorite as jest.Mock).mockResolvedValue({
        favorite: mockExistingFavorite,
        status: 200,
      });

      (MovieData.deleteFavorite as jest.Mock).mockResolvedValue({
        status: 200,
        message: 'Success: movie deleted',
      });

      await MovieFavoriteService.handleFavorite(userId, movieId);

      expect(revalidatePath).toHaveBeenCalledTimes(1);
      expect(revalidatePath).toHaveBeenCalledWith(`/movies/${movieId}`);
    });

    it('should revalidate path after successful create', async () => {
      (MovieData.findUniqueFavorite as jest.Mock).mockResolvedValue({
        favorite: undefined,
        status: 404,
      });

      (MovieData.createFavorite as jest.Mock).mockResolvedValue({
        favorite: {
          id: '1',
          userId,
          movieId,
        },
        status: 200,
        message: 'Added to favorite',
      });

      await MovieFavoriteService.handleFavorite(userId, movieId);

      expect(revalidatePath).toHaveBeenCalledTimes(1);
      expect(revalidatePath).toHaveBeenCalledWith(`/movies/${movieId}`);
    });
  });
});
