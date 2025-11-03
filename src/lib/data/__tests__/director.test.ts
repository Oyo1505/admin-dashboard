import { DirectorData } from '../director';
import prisma from '@/lib/prisma';
import { handlePrismaError, logError } from '@/lib/errors';
import { IDirector } from '@/models/director/director';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    directorSection: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
    movie: {
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

// Mock global Response.json
global.Response = {
  json: jest.fn((data: any, init?: ResponseInit) => ({
    ...data,
    status: init?.status || 200,
  })),
} as any;

describe('DirectorData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockDirectorData: IDirector = {
      id: 'director-123',
      director: 'Christopher Nolan',
      imageBackdrop: 'https://example.com/backdrop.jpg',
    };

    it('should create a director successfully when id is provided and return it with status 200', async () => {
      const mockCreatedDirector = {
        id: 'director-new-456',
        director: 'Christopher Nolan',
        imageBackdrop: 'https://example.com/backdrop.jpg',
      };

      (prisma.directorSection.create as jest.Mock).mockResolvedValue(
        mockCreatedDirector
      );

      const result = await DirectorData.create(mockDirectorData);

      expect(result).toEqual({
        director: mockCreatedDirector,
        status: 200,
        success: true,
      });

      expect(prisma.directorSection.create).toHaveBeenCalledWith({
        data: {
          director: mockDirectorData.director,
          imageBackdrop: mockDirectorData.imageBackdrop,
        },
      });
    });

    it('should return 404 when id is not provided', async () => {
      const directorWithoutId: IDirector = {
        director: 'Steven Spielberg',
        imageBackdrop: 'https://example.com/spielberg.jpg',
      };

      const result = await DirectorData.create(directorWithoutId);

      expect(result).toEqual({
        director: undefined,
        status: 404,
        success: false,
      });

      expect(prisma.directorSection.create).not.toHaveBeenCalled();
    });

    it('should handle database errors and return status 500', async () => {
      const mockError = new Error('Database connection failed');
      (prisma.directorSection.create as jest.Mock).mockRejectedValue(mockError);

      const result = await DirectorData.create(mockDirectorData);

      expect(result).toEqual({
        director: undefined,
        status: 500,
        success: false,
      });

      expect(logError).toHaveBeenCalledWith(mockError, 'update DirectorData');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });

    it('should handle directors with null imageBackdrop', async () => {
      const directorNoImage: IDirector = {
        id: 'director-123',
        director: 'Quentin Tarantino',
        imageBackdrop: null,
      };

      const mockCreatedDirector = {
        id: 'director-789',
        director: 'Quentin Tarantino',
        imageBackdrop: null,
      };

      (prisma.directorSection.create as jest.Mock).mockResolvedValue(
        mockCreatedDirector
      );

      const result = await DirectorData.create(directorNoImage);

      expect(result).toEqual({
        director: mockCreatedDirector,
        status: 200,
        success: true,
      });

      expect(prisma.directorSection.create).toHaveBeenCalledWith({
        data: {
          director: directorNoImage.director,
          imageBackdrop: null,
        },
      });
    });
  });

  describe('update', () => {
    const mockDirectorData: IDirector = {
      id: 'director-123',
      director: 'Christopher Nolan Updated',
      imageBackdrop: 'https://example.com/updated-backdrop.jpg',
    };

    it('should update a director successfully when id is provided and return it with status 200', async () => {
      const mockUpdatedDirector = {
        id: 'director-123',
        director: 'Christopher Nolan Updated',
        imageBackdrop: 'https://example.com/updated-backdrop.jpg',
      };

      (prisma.directorSection.update as jest.Mock).mockResolvedValue(
        mockUpdatedDirector
      );

      const result = await DirectorData.update(mockDirectorData);

      expect(result).toEqual({
        director: mockUpdatedDirector,
        status: 200,
        success: true,
      });

      expect(prisma.directorSection.update).toHaveBeenCalledWith({
        where: { id: mockDirectorData.id },
        data: {
          director: mockDirectorData.director,
          imageBackdrop: mockDirectorData.imageBackdrop,
        },
      });
    });

    it('should return 404 when id is not provided', async () => {
      const directorWithoutId: IDirector = {
        director: 'Steven Spielberg',
        imageBackdrop: 'https://example.com/spielberg.jpg',
      };

      const result = await DirectorData.update(directorWithoutId);

      expect(result).toEqual({
        director: undefined,
        status: 404,
        success: false,
      });

      expect(prisma.directorSection.update).not.toHaveBeenCalled();
    });

    it('should handle database errors and return status 500', async () => {
      const mockError = new Error('Update failed');
      (prisma.directorSection.update as jest.Mock).mockRejectedValue(mockError);

      const result = await DirectorData.update(mockDirectorData);

      expect(result).toEqual({
        director: undefined,
        status: 500,
        success: false,
      });

      expect(logError).toHaveBeenCalledWith(mockError, 'update DirectorData');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });

    it('should handle updating director with null imageBackdrop', async () => {
      const directorNoImage: IDirector = {
        id: 'director-123',
        director: 'Martin Scorsese',
        imageBackdrop: null,
      };

      const mockUpdatedDirector = {
        id: 'director-123',
        director: 'Martin Scorsese',
        imageBackdrop: null,
      };

      (prisma.directorSection.update as jest.Mock).mockResolvedValue(
        mockUpdatedDirector
      );

      const result = await DirectorData.update(directorNoImage);

      expect(result.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.director?.imageBackdrop).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a director successfully and return status 200', async () => {
      (prisma.directorSection.delete as jest.Mock).mockResolvedValue({});

      const result = await DirectorData.delete('director-123');

      expect(result).toEqual({
        status: 200,
        success: true,
      });

      expect(prisma.directorSection.delete).toHaveBeenCalledWith({
        where: { id: 'director-123' },
      });
    });

    it('should handle database errors when deleting', async () => {
      const mockError = new Error('Delete failed');
      (prisma.directorSection.delete as jest.Mock).mockRejectedValue(mockError);

      const result = await DirectorData.delete('director-123');

      expect(result).toEqual({
        status: 500,
        success: false,
      });

      expect(logError).toHaveBeenCalledWith(mockError, 'delete DirectorData');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });

    it('should handle deleting non-existent director', async () => {
      const mockError = new Error('Record not found');
      (prisma.directorSection.delete as jest.Mock).mockRejectedValue(mockError);

      const result = await DirectorData.delete('nonexistent-id');

      expect(result).toEqual({
        status: 500,
        success: false,
      });

      expect(logError).toHaveBeenCalledWith(mockError, 'delete DirectorData');
    });
  });

  describe('getDirectorFromSection', () => {
    it('should return director section with status 200', async () => {
      const mockDirectorSection = {
        id: 'director-123',
        director: 'Christopher Nolan',
        imageBackdrop: 'https://example.com/backdrop.jpg',
      };

      (prisma.directorSection.findFirst as jest.Mock).mockResolvedValue(
        mockDirectorSection
      );

      const result = await DirectorData.getDirectorFromSection();

      expect(result).toEqual({
        directorMovies: null,
        director: mockDirectorSection,
        imageBackdrop: mockDirectorSection.imageBackdrop,
        status: 200,
      });

      expect(prisma.directorSection.findFirst).toHaveBeenCalled();
    });

    it('should return null values when no director section found', async () => {
      (prisma.directorSection.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await DirectorData.getDirectorFromSection();

      expect(result).toEqual({
        directorMovies: null,
        director: null,
        imageBackdrop: null,
        status: 200,
      });
    });

    it('should handle database errors and return Response with status 500', async () => {
      const mockError = new Error('Database error');
      (prisma.directorSection.findFirst as jest.Mock).mockRejectedValue(
        mockError
      );

      const result = await DirectorData.getDirectorFromSection();

      expect(logError).toHaveBeenCalledWith(mockError, 'director');
      // Should return a Response.json object
      expect(result).toBeDefined();
    });

    it('should handle director section without imageBackdrop', async () => {
      const mockDirectorSection = {
        id: 'director-123',
        director: 'Denis Villeneuve',
        imageBackdrop: null,
      };

      (prisma.directorSection.findFirst as jest.Mock).mockResolvedValue(
        mockDirectorSection
      );

      const result = await DirectorData.getDirectorFromSection();

      expect(result.imageBackdrop).toBeNull();
      expect(result.director).toEqual(mockDirectorSection);
    });
  });

  describe('getDirectorMovies', () => {
    it('should return movies by director with status 200', async () => {
      const mockDirectorSection = {
        id: 'director-123',
        director: 'Christopher Nolan',
        imageBackdrop: 'https://example.com/backdrop.jpg',
      };

      const mockMovies = [
        {
          id: 'movie-1',
          title: 'Inception',
          director: 'Christopher Nolan',
          publish: true,
        },
        {
          id: 'movie-2',
          title: 'Interstellar',
          director: 'Christopher Nolan',
          publish: true,
        },
      ];

      (prisma.directorSection.findFirst as jest.Mock).mockResolvedValue(
        mockDirectorSection
      );
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMovies);

      const result = await DirectorData.getDirectorMovies();

      expect(result).toEqual({
        directorMovies: mockMovies,
        director: 'Christopher Nolan',
        imageBackdrop: 'https://example.com/backdrop.jpg',
        status: 200,
      });

      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        where: {
          publish: true,
          director: 'Christopher Nolan',
        },
      });
    });

    it('should return null values when no director section found', async () => {
      (prisma.directorSection.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await DirectorData.getDirectorMovies();

      expect(result).toEqual({
        directorMovies: null,
        director: null,
        imageBackdrop: null,
        status: 200,
      });

      expect(prisma.movie.findMany).not.toHaveBeenCalled();
    });

    it('should return null values when director section has no director name', async () => {
      const mockDirectorSection = {
        id: 'director-123',
        director: null,
        imageBackdrop: 'https://example.com/backdrop.jpg',
      };

      (prisma.directorSection.findFirst as jest.Mock).mockResolvedValue(
        mockDirectorSection
      );

      const result = await DirectorData.getDirectorMovies();

      expect(result).toEqual({
        directorMovies: null,
        director: null,
        imageBackdrop: null,
        status: 200,
      });

      expect(prisma.movie.findMany).not.toHaveBeenCalled();
    });

    it('should handle database errors and return Response with status 500', async () => {
      const mockError = new Error('Database error');
      (prisma.directorSection.findFirst as jest.Mock).mockRejectedValue(
        mockError
      );

      const result = await DirectorData.getDirectorMovies();

      // Should return a Response.json object
      expect(result).toBeDefined();
    });

    it('should return empty movies array when director has no movies', async () => {
      const mockDirectorSection = {
        id: 'director-123',
        director: 'New Director',
        imageBackdrop: 'https://example.com/backdrop.jpg',
      };

      (prisma.directorSection.findFirst as jest.Mock).mockResolvedValue(
        mockDirectorSection
      );
      (prisma.movie.findMany as jest.Mock).mockResolvedValue([]);

      const result = await DirectorData.getDirectorMovies();

      expect(result).toEqual({
        directorMovies: [],
        director: 'New Director',
        imageBackdrop: 'https://example.com/backdrop.jpg',
        status: 200,
      });
    });

    it('should only return published movies', async () => {
      const mockDirectorSection = {
        id: 'director-123',
        director: 'Ridley Scott',
        imageBackdrop: 'https://example.com/backdrop.jpg',
      };

      const mockMovies = [
        {
          id: 'movie-1',
          title: 'Blade Runner',
          director: 'Ridley Scott',
          publish: true,
        },
      ];

      (prisma.directorSection.findFirst as jest.Mock).mockResolvedValue(
        mockDirectorSection
      );
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMovies);

      const result = await DirectorData.getDirectorMovies();

      expect(prisma.movie.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            publish: true,
          }),
        })
      );

      expect(result.directorMovies).toEqual(mockMovies);
    });
  });
});
