import { MovieService } from '../movie.service';
import prisma from '@/lib/prisma';
import { handlePrismaError, logError } from '@/lib/errors';
import checkPermissionsRoleFromSession from '@/shared/utils/permissions/checkPermissionsRoleFromSession';
import { IMovieFormData, IUpdateMovieData } from '@/models/movie/movie';
import { MovieData } from '@/lib/data/movies';

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

jest.mock('@/lib/data/movies', () => ({
  MovieData: {
    findByGoogleDriveId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    togglePublish: jest.fn(),
    findManyFavorite: jest.fn(),
    findUniqueMoviePublished: jest.fn(),
    findUnique: jest.fn(),
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
      (MovieData.findByGoogleDriveId as jest.Mock).mockResolvedValue({
        existingMovie: undefined,
        status: 400,
      });
      (MovieData.create as jest.Mock).mockResolvedValue({
        movie: { id: '1' },
        status: 200,
      });

      const result = await MovieService.addMovie(mockMovieData);

      expect(result).toEqual({
        status: 200,
        message: 'Success : Movie added',
      });
      expect(checkPermissionsRoleFromSession).toHaveBeenCalled();
      expect(MovieData.findByGoogleDriveId).toHaveBeenCalledWith(mockMovieData);
      expect(MovieData.create).toHaveBeenCalled();
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
      (MovieData.findByGoogleDriveId as jest.Mock).mockResolvedValue({
        existingMovie: { id: 'existing-id' },
        status: 200,
      });

      const result = await MovieService.addMovie(mockMovieData);

      expect(result).toEqual({
        status: 409,
        message: 'Le film existe déjà',
      });
      expect(MovieData.create).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      (checkPermissionsRoleFromSession as jest.Mock).mockResolvedValue({
        status: 200,
      });
      (MovieData.findByGoogleDriveId as jest.Mock).mockResolvedValue({
        existingMovie: undefined,
        status: 400,
      });

      const mockError = new Error('Database error');
      (MovieData.create as jest.Mock).mockRejectedValue(mockError);

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
      upadateAt: new Date(),
    };

    it('should update a movie successfully', async () => {
      (checkPermissionsRoleFromSession as jest.Mock).mockResolvedValue({
        status: 200,
      });
      (MovieData.findUnique as jest.Mock).mockResolvedValue({
        movie: { id: '1' },
        status: 200,
      });
      (MovieData.update as jest.Mock).mockResolvedValue({
        movie: { id: '1' },
        status: 200,
      });

      const result = await MovieService.updateMovie(mockUpdateData);

      expect(result).toEqual({
        status: 200,
        message: 'Film modifié avec succès',
      });
      expect(MovieData.update).toHaveBeenCalled();
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
      (MovieData.findUnique as jest.Mock).mockResolvedValue({
        movie: undefined,
        status: 404,
      });

      const result = await MovieService.updateMovie(mockUpdateData);

      expect(result).toEqual({
        status: 404,
        message: "Le film n'existe pas",
      });
      expect(MovieData.update).not.toHaveBeenCalled();
    });

    it('should return 400 when genres are missing', async () => {
      (checkPermissionsRoleFromSession as jest.Mock).mockResolvedValue({
        status: 200,
      });
      (MovieData.findUnique as jest.Mock).mockResolvedValue({
        movie: { id: '1' },
        status: 200,
      });

      const invalidUpdate = { ...mockUpdateData, genresIds: [] };
      const result = await MovieService.updateMovie(invalidUpdate);

      expect(result).toEqual({
        status: 400,
        message: 'Au moins un genre est requis',
      });
      expect(MovieData.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteMovie', () => {
    it('should delete a movie successfully', async () => {
      (checkPermissionsRoleFromSession as jest.Mock).mockResolvedValue({
        status: 200,
      });
      (MovieData.delete as jest.Mock).mockResolvedValue({ status: 200 });

      const result = await MovieService.deleteMovie('1');

      expect(result).toEqual({ status: 200 });
      expect(MovieData.delete).toHaveBeenCalledWith('1');
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
      (MovieData.findUniqueMoviePublished as jest.Mock).mockResolvedValue({
        movie: {
          id: '1',
          publish: false,
        },
        status: 200,
      });
      (MovieData.togglePublish as jest.Mock).mockResolvedValue({
        publish: true,
        status: 200,
      });

      const result = await MovieService.handlePublishMovie('1');

      expect(result).toEqual({
        publish: true,
        status: 200,
      });
      expect(MovieData.togglePublish).toHaveBeenCalledWith('1', false);
    });

    it('should toggle movie publish status to false', async () => {
      (MovieData.findUniqueMoviePublished as jest.Mock).mockResolvedValue({
        movie: {
          id: '1',
          publish: true,
        },
        status: 200,
      });
      (MovieData.togglePublish as jest.Mock).mockResolvedValue({
        publish: false,
        status: 200,
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
      expect(MovieData.findUniqueMoviePublished).not.toHaveBeenCalled();
    });

    it('should return 404 when movie does not exist', async () => {
      (MovieData.findUniqueMoviePublished as jest.Mock).mockResolvedValue({
        movie: undefined,
        status: 404,
      });

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

      (MovieData.findManyFavorite as jest.Mock).mockResolvedValue({
        movies: mockFavorites.map((m) => ({ ...m, id: m.id.toString() })),
        status: 200,
      });

      const result = await MovieService.favoriteMovies('user-1');

      expect(result).toEqual({
        movies: mockFavorites.map((m) => ({ ...m, id: m.id.toString() })),
        status: 200,
      });
      expect(MovieData.findManyFavorite).toHaveBeenCalledWith('user-1');
    });

    it('should handle errors when retrieving favorites', async () => {
      const mockError = new Error('Database error');
      (MovieData.findManyFavorite as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieService.favoriteMovies('user-1');

      expect(result).toEqual({
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(mockError, 'favoriteMovies');
    });
  });
});
