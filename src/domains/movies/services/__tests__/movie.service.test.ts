import { MovieService } from '../movie.service';
import prisma from '@/lib/prisma';
import { handlePrismaError, logError } from '@/lib/errors';
import checkPermissionsRoleFromSession from '@/shared/utils/permissions/checkPermissionsRoleFromSession';
import { IMovieFormData, IUpdateMovieData } from '@/models/movie/movie';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    movie: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    userFavoriteMovies: {
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

jest.mock('@/shared/utils/permissions/checkPermissionsRoleFromSession', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('MovieService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addMovie', () => {
    const mockMovieData: IMovieFormData = {
      title: 'Inception',
      titleEnglish: 'Inception',
      titleJapanese: 'インセプション',
      director: 'Christopher Nolan',
      year: 2010,
      duration: 148,
      genresIds: ['1', '2'],
      country: 'USA',
      language: 'English',
      subtitles: ['FR', 'EN'],
      synopsis: 'A thief who steals corporate secrets...',
      trailer: 'https://youtube.com/watch?v=...',
      link: 'https://example.com/inception',
      image: 'https://example.com/inception.jpg',
      idGoogleDive: 'google-drive-id-123',
      imdbId: 'tt1375666',
      originalTitle: 'Inception',
    };

    it('should add a movie successfully with ADMIN permissions', async () => {
      (checkPermissionsRoleFromSession as jest.Mock).mockResolvedValue({
        status: 200,
      });
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.movie.create as jest.Mock).mockResolvedValue({ id: '1' });

      const result = await MovieService.addMovie(mockMovieData);

      expect(result).toEqual({
        status: 200,
        message: 'Success : Movie added',
      });
      expect(checkPermissionsRoleFromSession).toHaveBeenCalled();
      expect(prisma.movie.findUnique).toHaveBeenCalledWith({
        where: { idGoogleDive: mockMovieData.idGoogleDive },
      });
      expect(prisma.movie.create).toHaveBeenCalled();
    });

    it('should return 403 when user lacks ADMIN permissions', async () => {
      (checkPermissionsRoleFromSession as jest.Mock).mockResolvedValue({
        status: 403,
        message: 'Unauthorized',
      });

      const result = await MovieService.addMovie(mockMovieData);

      expect(result).toEqual({
        status: 403,
        message: 'Unauthorized',
      });
      expect(prisma.movie.create).not.toHaveBeenCalled();
    });

    it('should return 400 when title is missing', async () => {
      (checkPermissionsRoleFromSession as jest.Mock).mockResolvedValue({
        status: 200,
      });

      const invalidMovie = { ...mockMovieData, title: '' };
      const result = await MovieService.addMovie(invalidMovie);

      expect(result).toEqual({
        status: 400,
        message: 'Le titre du film est requis',
      });
      expect(prisma.movie.create).not.toHaveBeenCalled();
    });

    it('should return 400 when genres are missing', async () => {
      (checkPermissionsRoleFromSession as jest.Mock).mockResolvedValue({
        status: 200,
      });

      const invalidMovie = { ...mockMovieData, genresIds: [] };
      const result = await MovieService.addMovie(invalidMovie);

      expect(result).toEqual({
        status: 400,
        message: 'Au moins un genre est requis',
      });
      expect(prisma.movie.create).not.toHaveBeenCalled();
    });

    it('should return 409 when movie already exists', async () => {
      (checkPermissionsRoleFromSession as jest.Mock).mockResolvedValue({
        status: 200,
      });
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-id',
      });

      const result = await MovieService.addMovie(mockMovieData);

      expect(result).toEqual({
        status: 409,
        message: 'Le film existe déjà',
      });
      expect(prisma.movie.create).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      (checkPermissionsRoleFromSession as jest.Mock).mockResolvedValue({
        status: 200,
      });
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(null);

      const mockError = new Error('Database error');
      (prisma.movie.create as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieService.addMovie(mockMovieData);

      expect(result).toEqual({
        status: 500,
        message: 'Database error',
      });
      expect(logError).toHaveBeenCalledWith(mockError, 'addMovieToDb');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('updateMovie', () => {
    const mockUpdateData: IUpdateMovieData = {
      id: '1',
      title: 'Inception Updated',
      titleEnglish: 'Inception',
      titleJapanese: 'インセプション',
      director: 'Christopher Nolan',
      year: 2010,
      duration: 148,
      genresIds: ['1', '2'],
      country: 'USA',
      language: 'English',
      subtitles: ['FR', 'EN'],
      synopsis: 'Updated synopsis...',
      trailer: 'https://youtube.com/watch?v=...',
      link: 'https://example.com/inception',
      image: 'https://example.com/inception.jpg',
      idGoogleDive: 'google-drive-id-123',
      imdbId: 'tt1375666',
      originalTitle: 'Inception',
    };

    it('should update a movie successfully', async () => {
      (checkPermissionsRoleFromSession as jest.Mock).mockResolvedValue({
        status: 200,
      });
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
      (prisma.movie.update as jest.Mock).mockResolvedValue({ id: '1' });

      const result = await MovieService.updateMovie(mockUpdateData);

      expect(result).toEqual({
        status: 200,
        message: 'Film modifié avec succès',
      });
      expect(prisma.movie.update).toHaveBeenCalled();
    });

    it('should return 403 when user lacks ADMIN permissions', async () => {
      (checkPermissionsRoleFromSession as jest.Mock).mockResolvedValue({
        status: 403,
        message: 'Unauthorized',
      });

      const result = await MovieService.updateMovie(mockUpdateData);

      expect(result).toEqual({
        status: 403,
        message: 'Unauthorized',
      });
      expect(prisma.movie.update).not.toHaveBeenCalled();
    });

    it('should return 404 when movie does not exist', async () => {
      (checkPermissionsRoleFromSession as jest.Mock).mockResolvedValue({
        status: 200,
      });
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await MovieService.updateMovie(mockUpdateData);

      expect(result).toEqual({
        status: 404,
        message: "Le film n'existe pas",
      });
      expect(prisma.movie.update).not.toHaveBeenCalled();
    });

    it('should return 400 when genres are missing', async () => {
      (checkPermissionsRoleFromSession as jest.Mock).mockResolvedValue({
        status: 200,
      });
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue({ id: '1' });

      const invalidUpdate = { ...mockUpdateData, genresIds: [] };
      const result = await MovieService.updateMovie(invalidUpdate);

      expect(result).toEqual({
        status: 400,
        message: 'Au moins un genre est requis',
      });
      expect(prisma.movie.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteMovie', () => {
    it('should delete a movie successfully', async () => {
      (checkPermissionsRoleFromSession as jest.Mock).mockResolvedValue({
        status: 200,
      });
      (prisma.movie.delete as jest.Mock).mockResolvedValue({ id: '1' });

      const result = await MovieService.deleteMovie('1');

      expect(result).toEqual({ status: 200 });
      expect(prisma.movie.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return 400 when id is missing', async () => {
      (checkPermissionsRoleFromSession as jest.Mock).mockResolvedValue({
        status: 200,
      });

      const result = await MovieService.deleteMovie('');

      expect(result).toEqual({
        status: 400,
        message: 'ID du film est requis',
      });
      expect(prisma.movie.delete).not.toHaveBeenCalled();
    });

    it('should return 403 when user lacks ADMIN permissions', async () => {
      (checkPermissionsRoleFromSession as jest.Mock).mockResolvedValue({
        status: 403,
        message: 'Unauthorized',
      });

      const result = await MovieService.deleteMovie('1');

      expect(result).toEqual({
        status: 403,
        message: 'Unauthorized',
      });
      expect(prisma.movie.delete).not.toHaveBeenCalled();
    });
  });

  describe('handlePublishMovie', () => {
    it('should toggle movie publish status to true', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        publish: false,
      });
      (prisma.movie.update as jest.Mock).mockResolvedValue({
        publish: true,
      });

      const result = await MovieService.handlePublishMovie('1');

      expect(result).toEqual({
        publish: true,
        status: 200,
      });
      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { publish: true },
        select: { publish: true },
      });
    });

    it('should toggle movie publish status to false', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        publish: true,
      });
      (prisma.movie.update as jest.Mock).mockResolvedValue({
        publish: false,
      });

      const result = await MovieService.handlePublishMovie('1');

      expect(result).toEqual({
        publish: false,
        status: 200,
      });
    });

    it('should return 400 when id is missing', async () => {
      const result = await MovieService.handlePublishMovie('');

      expect(result).toEqual({
        publish: false,
        status: 400,
      });
      expect(prisma.movie.findUnique).not.toHaveBeenCalled();
    });

    it('should return 404 when movie does not exist', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await MovieService.handlePublishMovie('1');

      expect(result).toEqual({
        publish: false,
        status: 404,
      });
    });
  });

  describe('favoriteMovies', () => {
    it('should retrieve user favorite movies successfully', async () => {
      const mockFavorites = [
        {
          id: '1',
          userId: 'user-1',
          movieId: 'movie-1',
          movie: {
            id: 'movie-1',
            title: 'Inception',
            genresIds: [
              {
                genre: {
                  id: '1',
                  nameFR: 'Science-Fiction',
                  nameEN: 'Science Fiction',
                  nameJP: 'サイエンスフィクション',
                },
              },
            ],
          },
        },
      ];

      (prisma.userFavoriteMovies.findMany as jest.Mock).mockResolvedValue(
        mockFavorites
      );

      const result = await MovieService.favoriteMovies('user-1');

      expect(result).toEqual({
        movies: mockFavorites.map((m) => ({ ...m, id: m.id.toString() })),
        status: 200,
      });
      expect(prisma.userFavoriteMovies.findMany).toHaveBeenCalledWith({
        relationLoadStrategy: 'join',
        where: { userId: 'user-1' },
        include: expect.any(Object),
      });
    });

    it('should handle errors when retrieving favorites', async () => {
      const mockError = new Error('Database error');
      (prisma.userFavoriteMovies.findMany as jest.Mock).mockRejectedValue(
        mockError
      );

      const result = await MovieService.favoriteMovies('user-1');

      expect(result).toEqual({
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(mockError, 'getFavoriteMovies');
    });
  });
});
