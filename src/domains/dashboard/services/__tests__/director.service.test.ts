import { DirectorService } from '../director.service';
import prisma from '@/lib/prisma';
import { handlePrismaError, logError } from '@/lib/errors';
import { IDirector } from '@/models/director/director';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    directorSection: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

      (prisma.directorSection.create as jest.Mock).mockResolvedValue(
        mockCreatedDirector
      );

      const result = await DirectorService.createDirector(mockDirector);

      expect(result).toEqual({
        director: mockCreatedDirector,
        status: 200,
        success: true,
      });
      expect(prisma.directorSection.create).toHaveBeenCalledWith({
        data: {
          director: mockDirector.director,
          imageBackdrop: mockDirector.imageBackdrop,
        },
      });
    });

    it('should handle errors when creating a director', async () => {
      const mockDirector: IDirector = {
        director: 'Christopher Nolan',
        imageBackdrop: 'https://example.com/nolan.jpg',
      };

      const mockError = new Error('Database error');
      (prisma.directorSection.create as jest.Mock).mockRejectedValue(mockError);

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

      (prisma.directorSection.update as jest.Mock).mockResolvedValue(
        mockUpdatedDirector
      );

      const result = await DirectorService.updateDirector(mockDirector);

      expect(result).toEqual({
        director: mockUpdatedDirector,
        status: 200,
        success: true,
      });
      expect(prisma.directorSection.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          director: mockDirector.director,
          imageBackdrop: mockDirector.imageBackdrop,
        },
      });
    });

    it('should return 400 when director id is missing', async () => {
      const mockDirector: IDirector = {
        director: 'Christopher Nolan',
        imageBackdrop: 'https://example.com/nolan.jpg',
      };

      const result = await DirectorService.updateDirector(mockDirector);

      expect(result).toEqual({
        director: undefined,
        status: 400,
        success: false,
      });
      expect(prisma.directorSection.update).not.toHaveBeenCalled();
    });

    it('should handle errors when updating a director', async () => {
      const mockDirector: IDirector = {
        id: '1',
        director: 'Christopher Nolan',
        imageBackdrop: 'https://example.com/nolan.jpg',
      };

      const mockError = new Error('Database error');
      (prisma.directorSection.update as jest.Mock).mockRejectedValue(mockError);

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

      (prisma.directorSection.delete as jest.Mock).mockResolvedValue({
        id: directorId,
      });

      const result = await DirectorService.deleteDirector(directorId);

      expect(result).toEqual({
        status: 200,
        success: true,
      });
      expect(prisma.directorSection.delete).toHaveBeenCalledWith({
        where: { id: directorId },
      });
    });

    it('should handle errors when deleting a director', async () => {
      const directorId = '1';
      const mockError = new Error('Database error');

      (prisma.directorSection.delete as jest.Mock).mockRejectedValue(mockError);

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
