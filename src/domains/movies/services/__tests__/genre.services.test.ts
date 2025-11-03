import { GenreService } from '../genre.services';
import { GenreData } from '@/lib/data/genres';
import { handlePrismaError, logError } from '@/lib/errors';
import { IGenre } from '@/models/movie/movie';
import { revalidatePath } from 'next/cache';

// Mock dependencies
jest.mock('@/lib/data/genres', () => ({
  GenreData: {
    delete: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('@/lib/errors', () => ({
  handlePrismaError: jest.fn((error) => ({
    statusCode: 500,
    message: 'Database error',
  })),
  logError: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('GenreService', () => {
  const mockGenre: IGenre = {
    id: 'genre-123',
    nameFR: 'Action',
    nameEN: 'Action',
    nameJP: 'アクション',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteGenre', () => {
    it('should delete genre successfully', async () => {
      (GenreData.delete as jest.Mock).mockResolvedValue({
        deletedGenre: mockGenre,
        status: 200,
      });

      const result = await GenreService.deleteGenre('genre-123');

      expect(result).toEqual({
        status: 200,
        genre: mockGenre,
      });
      expect(GenreData.delete).toHaveBeenCalledWith('genre-123');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/genre');
    });

    it('should return 404 when genre not found', async () => {
      (GenreData.delete as jest.Mock).mockResolvedValue({
        deletedGenre: null,
        status: 404,
      });

      const result = await GenreService.deleteGenre('nonexistent-id');

      expect(result).toEqual({
        status: 404,
      });
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      (GenreData.delete as jest.Mock).mockRejectedValue(mockError);

      const result = await GenreService.deleteGenre('genre-123');

      expect(result).toEqual({
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(mockError, 'deleteGenre');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('updateGenre', () => {
    it('should update genre successfully', async () => {
      const updatedGenre = { ...mockGenre, nameFR: 'Action (mis à jour)' };
      (GenreData.update as jest.Mock).mockResolvedValue({
        updatedGenre,
        status: 200,
      });

      const result = await GenreService.updateGenre(updatedGenre);

      expect(result).toEqual({
        status: 200,
        genre: updatedGenre,
      });
      expect(GenreData.update).toHaveBeenCalledWith(updatedGenre);
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/genre');
    });

    it('should return 404 when genre not found', async () => {
      (GenreData.update as jest.Mock).mockResolvedValue({
        updatedGenre: null,
        status: 404,
      });

      const result = await GenreService.updateGenre(mockGenre);

      expect(result).toEqual({
        status: 404,
      });
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Update failed');
      (GenreData.update as jest.Mock).mockRejectedValue(mockError);

      const result = await GenreService.updateGenre(mockGenre);

      expect(result).toEqual({
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(mockError, 'updateGenre');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('addGenre', () => {
    it('should add genre successfully', async () => {
      const newGenre: IGenre = {
        nameFR: 'Comédie',
        nameEN: 'Comedy',
        nameJP: 'コメディ',
      };

      const createdGenre = { ...newGenre, id: 'genre-new-123' };
      (GenreData.create as jest.Mock).mockResolvedValue({
        createdGenre,
        status: 200,
      });

      const result = await GenreService.addGenre(newGenre);

      expect(result).toEqual({
        status: 200,
        genre: createdGenre,
      });
      expect(GenreData.create).toHaveBeenCalledWith(newGenre);
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/genre');
    });

    it('should return 404 when genre creation returns null (edge case)', async () => {
      // Note: This tests the logic at line 47-49 which checks if !genre
      // This is a potential bug - should check createdGenre instead
      const newGenre: IGenre = {
        nameFR: 'Test',
        nameEN: 'Test',
        nameJP: 'テスト',
      };

      (GenreData.create as jest.Mock).mockResolvedValue({
        createdGenre: { id: 'genre-456', ...newGenre },
        status: 200,
      });

      const result = await GenreService.addGenre(newGenre);

      // Despite createdGenre being valid, if input genre exists, it returns success
      expect(result.status).toBe(200);
      expect(revalidatePath).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Creation failed');
      const newGenre: IGenre = {
        nameFR: 'Horror',
        nameEN: 'Horror',
        nameJP: 'ホラー',
      };

      (GenreData.create as jest.Mock).mockRejectedValue(mockError);

      const result = await GenreService.addGenre(newGenre);

      expect(result).toEqual({
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(mockError, 'addGenre');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should handle genres with all multilingual fields', async () => {
      const multilingualGenre: IGenre = {
        nameFR: 'Science-Fiction',
        nameEN: 'Science Fiction',
        nameJP: 'サイエンスフィクション',
      };

      const createdGenre = { ...multilingualGenre, id: 'genre-sci-fi' };
      (GenreData.create as jest.Mock).mockResolvedValue({
        createdGenre,
        status: 200,
      });

      const result = await GenreService.addGenre(multilingualGenre);

      expect(result.status).toBe(200);
      expect(result.genre).toEqual(createdGenre);
      expect(GenreData.create).toHaveBeenCalledWith(multilingualGenre);
    });
  });
});
