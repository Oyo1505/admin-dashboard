import { DirectorService } from '../director.service';
import { DirectorData } from '@/lib/data/director';
import { handlePrismaError, logError } from '@/lib/errors';
import { IDirector } from '@/models/director/director';

// Mock dependencies
jest.mock('@/lib/data/director', () => ({
  DirectorData: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
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

describe('DirectorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDirector', () => {
    it('should create a director successfully', async () => {
      const mockDirector: IDirector = {
        director: 'Christopher Nolan',
        imageBackdrop: 'https://example.com/nolan.jpg',
      };

      const mockCreatedDirector = {
        id: '1',
        ...mockDirector,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (DirectorData.create as jest.Mock).mockResolvedValue({
        director: mockCreatedDirector,
        status: 200,
        success: true,
      });

      const result = await DirectorService.createDirector(mockDirector);

      expect(result).toEqual({
        director: mockCreatedDirector,
        status: 200,
        success: true,
      });
      expect(DirectorData.create).toHaveBeenCalledWith(mockDirector);
    });

    it('should handle errors when creating a director', async () => {
      const mockDirector: IDirector = {
        director: 'Christopher Nolan',
        imageBackdrop: 'https://example.com/nolan.jpg',
      };

      const mockError = new Error('Database error');
      (DirectorData.create as jest.Mock).mockRejectedValue(mockError);

      const result = await DirectorService.createDirector(mockDirector);

      expect(result).toEqual({
        status: 500,
        success: false,
      });
      expect(logError).toHaveBeenCalledWith(
        mockError,
        'createDirectorFromSection'
      );
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('updateDirector', () => {
    it('should update a director successfully', async () => {
      const mockDirector: IDirector = {
        id: '1',
        director: 'Christopher Nolan',
        imageBackdrop: 'https://example.com/nolan-updated.jpg',
      };

      const mockUpdatedDirector = {
        ...mockDirector,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (DirectorData.update as jest.Mock).mockResolvedValue({
        director: mockUpdatedDirector,
        status: 200,
        success: true,
      });

      const result = await DirectorService.updateDirector(mockDirector);

      expect(result).toEqual({
        director: mockUpdatedDirector,
        status: 200,
        success: true,
      });
      expect(DirectorData.update).toHaveBeenCalledWith(mockDirector);
    });

    it('should return 400 when director id is missing', async () => {
      const mockDirector: IDirector = {
        director: 'Christopher Nolan',
        imageBackdrop: 'https://example.com/nolan.jpg',
      };

      (DirectorData.update as jest.Mock).mockResolvedValue({
        director: undefined,
        status: 400,
        success: false,
      });

      const result = await DirectorService.updateDirector(mockDirector);

      expect(result).toEqual({
        director: undefined,
        status: 400,
        success: false,
      });
      expect(DirectorData.update).toHaveBeenCalledWith(mockDirector);
    });

    it('should handle errors when updating a director', async () => {
      const mockDirector: IDirector = {
        id: '1',
        director: 'Christopher Nolan',
        imageBackdrop: 'https://example.com/nolan.jpg',
      };

      const mockError = new Error('Database error');
      (DirectorData.update as jest.Mock).mockRejectedValue(mockError);

      const result = await DirectorService.updateDirector(mockDirector);

      expect(result).toEqual({
        status: 500,
        success: false,
      });
      expect(logError).toHaveBeenCalledWith(mockError, 'updateDirector');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('deleteDirector', () => {
    it('should delete a director successfully', async () => {
      const directorId = '1';

      (DirectorData.delete as jest.Mock).mockResolvedValue({
        status: 200,
        success: true,
      });

      const result = await DirectorService.deleteDirector(directorId);

      expect(result).toEqual({
        status: 200,
        success: true,
      });
      expect(DirectorData.delete).toHaveBeenCalledWith(directorId);
    });

    it('should handle errors when deleting a director', async () => {
      const directorId = '1';
      const mockError = new Error('Database error');

      (DirectorData.delete as jest.Mock).mockRejectedValue(mockError);

      const result = await DirectorService.deleteDirector(directorId);

      expect(result).toEqual({
        status: 500,
        success: false,
      });
      expect(logError).toHaveBeenCalledWith(mockError, 'deleteDirector');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });
});
