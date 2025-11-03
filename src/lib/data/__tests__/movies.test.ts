import { MovieData } from '../movies';
import prisma from '@/lib/prisma';
import { handlePrismaError, logError } from '@/lib/errors';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    movie: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    genre: {
      findMany: jest.fn(),
    },
    userFavoriteMovies: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
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

describe('MovieData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockMovieData = {
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

    it('should create a movie successfully and return it with status 200', async () => {
      const mockCreatedMovie = {
        id: '1',
        ...mockMovieData,
        publish: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        genresIds: [
          {
            genre: {
              id: '1',
              nameFR: 'Science-Fiction',
              nameEN: 'Science Fiction',
              nameJP: 'サイエンスフィクション',
            },
          },
          {
            genre: {
              id: '2',
              nameFR: 'Action',
              nameEN: 'Action',
              nameJP: 'アクション',
            },
          },
        ],
      };

      (prisma.movie.create as jest.Mock).mockResolvedValue(mockCreatedMovie);

      const result = await MovieData.create(mockMovieData);

      expect(result).toEqual({
        movie: mockCreatedMovie,
        status: 200,
      });

      expect(prisma.movie.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: mockMovieData.title,
          director: mockMovieData.director,
          year: mockMovieData.year,
        }),
        include: {
          genresIds: {
            select: {
              genre: {
                select: {
                  id: true,
                  nameFR: true,
                  nameEN: true,
                  nameJP: true,
                },
              },
            },
          },
        },
      });
    });

    it('should handle database errors and return status 500', async () => {
      const mockError = new Error('Database connection failed');
      (prisma.movie.create as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieData.create(mockMovieData);

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(mockError, 'MovieData.create');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });

    it('should include genres in the created movie', async () => {
      const mockCreatedMovie = {
        id: '1',
        ...mockMovieData,
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
      };

      (prisma.movie.create as jest.Mock).mockResolvedValue(mockCreatedMovie);

      const result = await MovieData.create(mockMovieData);

      expect(result.movie?.genresIds).toBeDefined();
      expect(result.movie?.genresIds).toHaveLength(1);
      expect(result.movie?.genresIds?.[0].genre.nameFR).toBe('Science-Fiction');
    });

    it('should convert zero duration and year to null', async () => {
      const movieWithZeros: typeof mockMovieData = {
        ...mockMovieData,
        duration: 0,
        year: 0,
      };

      const mockCreatedMovie = {
        id: '1',
        ...movieWithZeros,
        duration: null,
        year: null,
        genresIds: [],
      };

      (prisma.movie.create as jest.Mock).mockResolvedValue(mockCreatedMovie);

      await MovieData.create(movieWithZeros);

      // The create method treats 0 as falsy and converts to null
      expect(prisma.movie.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            duration: null,
            year: null,
          }),
        })
      );
    });
  });

  describe('togglePublish', () => {
    it('should toggle publish status from false to true', async () => {
      const movieId = '1';
      const currentStatus = false;

      (prisma.movie.update as jest.Mock).mockResolvedValue({
        publish: true,
      });

      const result = await MovieData.togglePublish(movieId, currentStatus);

      expect(result).toEqual({
        publish: true,
        status: 200,
      });

      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: movieId },
        data: { publish: true },
        select: { publish: true },
      });
    });

    it('should toggle publish status from true to false', async () => {
      const movieId = '1';
      const currentStatus = true;

      (prisma.movie.update as jest.Mock).mockResolvedValue({
        publish: false,
      });

      const result = await MovieData.togglePublish(movieId, currentStatus);

      expect(result).toEqual({
        publish: false,
        status: 200,
      });

      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: movieId },
        data: { publish: false },
        select: { publish: true },
      });
    });

    it('should handle database errors when toggling publish', async () => {
      const movieId = '1';
      const currentStatus = false;
      const mockError = new Error('Database error');

      (prisma.movie.update as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieData.togglePublish(movieId, currentStatus);

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(
        mockError,
        'MovieData.togglePublish'
      );
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('update', () => {
    const mockUpdateData = {
      id: '1',
      title: 'Inception Updated',
      titleEnglish: 'Inception',
      director: 'Christopher Nolan',
      year: 2010,
      duration: 148,
      genresIds: ['1', '2'],
      country: 'USA',
    };

    it('should update a movie successfully and return it with status 200', async () => {
      const mockUpdatedMovie = {
        ...mockUpdateData,
        publish: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.movie.update as jest.Mock).mockResolvedValue(mockUpdatedMovie);

      const result = await MovieData.update(mockUpdateData);

      expect(result).toEqual({
        movie: mockUpdatedMovie,
        status: 200,
      });

      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: mockUpdateData.id },
        data: expect.objectContaining({
          title: mockUpdateData.title,
          director: mockUpdateData.director,
        }),
      });
    });

    it('should handle database errors when updating', async () => {
      const mockError = new Error('Update failed');
      (prisma.movie.update as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieData.update(mockUpdateData);

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(mockError, 'MovieData.update');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('delete', () => {
    it('should delete a movie successfully and return status 200', async () => {
      (prisma.movie.delete as jest.Mock).mockResolvedValue({});

      const result = await MovieData.delete('movie-123');

      expect(result).toEqual({
        status: 200,
      });

      expect(prisma.movie.delete).toHaveBeenCalledWith({
        where: { id: 'movie-123' },
      });
    });

    it('should handle database errors when deleting', async () => {
      const mockError = new Error('Delete failed');
      (prisma.movie.delete as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieData.delete('movie-123');

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(mockError, 'MovieData.delete');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getLastMovies', () => {
    it('should return latest published movies with status 200', async () => {
      const mockMovies = [
        {
          id: '1',
          title: 'Movie 1',
          publish: true,
          genresIds: [],
          createdAt: new Date(),
        },
        {
          id: '2',
          title: 'Movie 2',
          publish: true,
          genresIds: [],
          createdAt: new Date(),
        },
      ];

      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMovies);

      const result = await MovieData.getLastMovies();

      expect(result).toEqual({
        movies: mockMovies,
        status: 200,
      });

      expect(prisma.movie.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { publish: true },
          orderBy: { createdAt: 'desc' },
          take: expect.any(Number),
        })
      );
    });

    it('should return 404 when no movies found', async () => {
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(null);

      const result = await MovieData.getLastMovies();

      expect(result).toEqual({
        status: 404,
        movies: [],
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      (prisma.movie.findMany as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieData.getLastMovies();

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(mockError, 'getLastMovies');
    });
  });

  describe('Favorite Movies Operations', () => {
    const userId = 'user-123';
    const movieId = 'movie-456';

    describe('findManyFavorite', () => {
      it('should return user favorite movies with status 200', async () => {
        const mockFavorites = [
          {
            id: 1,
            userId,
            movieId: 'movie-1',
            movie: {
              id: 'movie-1',
              title: 'Favorite Movie 1',
              genresIds: [],
            },
          },
          {
            id: 2,
            userId,
            movieId: 'movie-2',
            movie: {
              id: 'movie-2',
              title: 'Favorite Movie 2',
              genresIds: [],
            },
          },
        ];

        (prisma.userFavoriteMovies.findMany as jest.Mock).mockResolvedValue(
          mockFavorites
        );

        const result = await MovieData.findManyFavorite(userId);

        expect(result.status).toBe(200);
        expect(result.movies).toHaveLength(2);
        expect(result.movies?.[0]).toEqual({
          id: '1',
          userId,
          movieId: 'movie-1',
          movie: expect.objectContaining({ title: 'Favorite Movie 1' }),
        });
      });

      it('should return empty array when no favorites found', async () => {
        (prisma.userFavoriteMovies.findMany as jest.Mock).mockResolvedValue([]);

        const result = await MovieData.findManyFavorite(userId);

        expect(result).toEqual({
          movies: [],
          status: 200,
        });
      });

      it('should handle database errors', async () => {
        const mockError = new Error('Database error');
        (prisma.userFavoriteMovies.findMany as jest.Mock).mockRejectedValue(
          mockError
        );

        const result = await MovieData.findManyFavorite(userId);

        expect(result).toEqual({
          status: 500,
        });

        expect(logError).toHaveBeenCalledWith(mockError, 'findManyFavorite');
      });
    });

    describe('findUniqueFavorite', () => {
      it('should find an existing favorite and return it with status 200', async () => {
        const mockFavorite = {
          id: 1,
          userId,
          movieId,
        };

        (prisma.userFavoriteMovies.findUnique as jest.Mock).mockResolvedValue(
          mockFavorite
        );

        const result = await MovieData.findUniqueFavorite(userId, movieId);

        expect(result).toEqual({
          favorite: {
            id: '1',
            userId,
            movieId,
          },
          status: 200,
        });

        expect(prisma.userFavoriteMovies.findUnique).toHaveBeenCalledWith({
          where: {
            userId_movieId: {
              userId,
              movieId,
            },
          },
        });
      });

      it('should return 404 when favorite does not exist', async () => {
        (prisma.userFavoriteMovies.findUnique as jest.Mock).mockResolvedValue(
          null
        );

        const result = await MovieData.findUniqueFavorite(userId, movieId);

        expect(result).toEqual({
          favorite: undefined,
          status: 404,
        });
      });

      it('should handle database errors when finding favorite', async () => {
        const mockError = new Error('Database connection failed');
        (prisma.userFavoriteMovies.findUnique as jest.Mock).mockRejectedValue(
          mockError
        );

        const result = await MovieData.findUniqueFavorite(userId, movieId);

        expect(result).toEqual({
          status: 500,
        });

        expect(logError).toHaveBeenCalledWith(mockError, 'findUniqueFavorite');
        expect(handlePrismaError).toHaveBeenCalledWith(mockError);
      });
    });

    describe('createFavorite', () => {
      it('should create a favorite successfully and return it with status 200', async () => {
        const mockCreatedFavorite = {
          id: 1,
          userId,
          movieId,
        };

        (prisma.userFavoriteMovies.create as jest.Mock).mockResolvedValue(
          mockCreatedFavorite
        );

        const result = await MovieData.createFavorite(userId, movieId);

        expect(result).toEqual({
          favorite: {
            id: '1',
            userId,
            movieId,
          },
          status: 200,
          message: 'Added to favorite',
        });

        expect(prisma.userFavoriteMovies.create).toHaveBeenCalledWith({
          data: {
            userId,
            movieId,
          },
        });
      });

      it('should handle database errors when creating favorite', async () => {
        const mockError = new Error('Unique constraint violation');
        (prisma.userFavoriteMovies.create as jest.Mock).mockRejectedValue(
          mockError
        );

        const result = await MovieData.createFavorite(userId, movieId);

        expect(result).toEqual({
          status: 500,
        });

        expect(logError).toHaveBeenCalledWith(mockError, 'createFavorite');
        expect(handlePrismaError).toHaveBeenCalledWith(mockError);
      });
    });

    describe('deleteFavorite', () => {
      it('should delete a favorite successfully and return status 200', async () => {
        (prisma.userFavoriteMovies.delete as jest.Mock).mockResolvedValue({
          id: 1,
          userId,
          movieId,
        });

        const result = await MovieData.deleteFavorite(userId, movieId);

        expect(result).toEqual({
          status: 200,
          message: 'Success: movie deleted',
        });

        expect(prisma.userFavoriteMovies.delete).toHaveBeenCalledWith({
          where: {
            userId_movieId: {
              userId,
              movieId,
            },
          },
        });
      });

      it('should handle database errors when deleting favorite', async () => {
        const mockError = new Error('Record not found');
        (prisma.userFavoriteMovies.delete as jest.Mock).mockRejectedValue(
          mockError
        );

        const result = await MovieData.deleteFavorite(userId, movieId);

        expect(result).toEqual({
          status: 500,
        });

        expect(logError).toHaveBeenCalledWith(mockError, 'deleteFavorite');
        expect(handlePrismaError).toHaveBeenCalledWith(mockError);
      });
    });
  });

  describe('getMoviesByARandomCountry', () => {
    it('should return movies from a random country with status 200', async () => {
      const mockCountries = [
        { country: 'USA' },
        { country: 'France' },
        { country: 'Japan' },
      ];

      const mockMovies = [
        {
          id: '1',
          title: 'Movie 1',
          country: 'USA',
          publish: true,
          genresIds: [],
        },
        {
          id: '2',
          title: 'Movie 2',
          country: 'USA',
          publish: true,
          genresIds: [],
        },
      ];

      (prisma.movie.findMany as jest.Mock)
        .mockResolvedValueOnce(mockCountries)
        .mockResolvedValueOnce(mockMovies);

      const result = await MovieData.getMoviesByARandomCountry();

      expect(result.status).toBe(200);
      expect(result.movies).toEqual(mockMovies);
      expect(result.country).toBeDefined();
      expect(['USA', 'France', 'Japan']).toContain(result.country);
    });

    it('should return 400 when no countries found', async () => {
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(null);

      const result = await MovieData.getMoviesByARandomCountry();

      expect(result).toEqual({
        status: 400,
      });
    });

    it('should return 400 when random country is null', async () => {
      const mockCountries = [{ country: null }];

      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockCountries);

      const result = await MovieData.getMoviesByARandomCountry();

      expect(result).toEqual({
        status: 400,
        movies: [],
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      (prisma.movie.findMany as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieData.getMoviesByARandomCountry();

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(
        mockError,
        'getMoviesByARandomCountry'
      );
    });
  });

  describe('getMoviesByARandomGenre', () => {
    it('should return movies from a random genre with status 200', async () => {
      const mockGenres = [
        { id: '1', nameFR: 'Action', nameEN: 'Action', nameJP: 'アクション' },
        {
          id: '2',
          nameFR: 'Science-Fiction',
          nameEN: 'Science Fiction',
          nameJP: 'SF',
        },
      ];

      const mockMovies = [
        { id: '1', title: 'Movie 1' },
        { id: '2', title: 'Movie 2' },
      ];

      (prisma.genre.findMany as jest.Mock).mockResolvedValue(mockGenres);
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMovies);

      const result = await MovieData.getMoviesByARandomGenre();

      expect(result.status).toBe(200);
      expect(result.movies).toEqual(mockMovies);
      expect(result.genre).toBeDefined();
      expect(mockGenres).toContainEqual(result.genre);
    });

    it('should return 400 when no genres found', async () => {
      (prisma.genre.findMany as jest.Mock).mockResolvedValue(null);

      const result = await MovieData.getMoviesByARandomGenre();

      expect(result).toEqual({
        status: 400,
      });
    });

    it('should return 400 when random genre is undefined', async () => {
      (prisma.genre.findMany as jest.Mock).mockResolvedValue([]);

      const result = await MovieData.getMoviesByARandomGenre();

      expect(result).toEqual({
        status: 400,
        movies: [],
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      (prisma.genre.findMany as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieData.getMoviesByARandomGenre();

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(
        mockError,
        'getMoviesByARandomGenre'
      );
    });
  });

  describe('getAllMoviesWithGenres', () => {
    it('should return all movies with genres and status 200', async () => {
      const mockMovies = [
        {
          id: '1',
          title: 'Movie 1',
          genresIds: [{ genre: { id: '1', nameFR: 'Action' } }],
        },
        {
          id: '2',
          title: 'Movie 2',
          genresIds: [{ genre: { id: '2', nameFR: 'Drama' } }],
        },
      ];

      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMovies);

      const result = await MovieData.getAllMoviesWithGenres();

      expect(result).toEqual({
        movieInDb: mockMovies,
        status: 200,
      });

      expect(prisma.movie.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            genresIds: expect.any(Object),
          }),
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      (prisma.movie.findMany as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieData.getAllMoviesWithGenres();

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(mockError, 'getAllMovies');
    });
  });

  describe('getMoviesCountries', () => {
    it('should return list of unique countries with status 200', async () => {
      const mockCountries = [
        { country: 'USA' },
        { country: 'France' },
        { country: 'Japan' },
      ];

      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockCountries);

      const result = await MovieData.getMoviesCountries();

      expect(result).toEqual({
        status: 200,
        countries: ['USA', 'France', 'Japan'],
      });

      expect(prisma.movie.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: { country: true },
          distinct: ['country'],
        })
      );
    });

    it('should filter out null countries', async () => {
      const mockCountries = [
        { country: 'USA' },
        { country: null },
        { country: 'France' },
      ];

      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockCountries);

      const result = await MovieData.getMoviesCountries();

      expect(result).toEqual({
        status: 200,
        countries: ['USA', 'France'],
      });
    });

    it('should return 400 when no countries found', async () => {
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(null);

      const result = await MovieData.getMoviesCountries();

      expect(result).toEqual({
        status: 400,
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      (prisma.movie.findMany as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieData.getMoviesCountries();

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(mockError, 'getMoviesCountries');
    });
  });

  describe('findUnique', () => {
    it('should find a movie and return it with status 200', async () => {
      const mockMovie = {
        id: 'movie-123',
        publish: true,
      };

      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(mockMovie);

      const result = await MovieData.findUnique('movie-123');

      expect(result).toEqual({
        movie: mockMovie,
        status: 200,
      });

      expect(prisma.movie.findUnique).toHaveBeenCalledWith({
        where: { id: 'movie-123' },
      });
    });

    it('should return 404 when movie not found', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await MovieData.findUnique('nonexistent-id');

      expect(result).toEqual({
        movie: undefined,
        status: 404,
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      (prisma.movie.findUnique as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieData.findUnique('movie-123');

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(
        mockError,
        'findUniqueMoviePublished'
      );
    });
  });

  describe('findUniqueMoviePublished', () => {
    it('should find a movie with publication status and return it with status 200', async () => {
      const mockMovie = {
        id: 'movie-123',
        publish: true,
      };

      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(mockMovie);

      const result = await MovieData.findUniqueMoviePublished('movie-123');

      expect(result).toEqual({
        movie: mockMovie,
        status: 200,
      });

      expect(prisma.movie.findUnique).toHaveBeenCalledWith({
        where: { id: 'movie-123' },
        select: { id: true, publish: true },
      });
    });

    it('should return 404 when movie not found', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await MovieData.findUniqueMoviePublished('nonexistent-id');

      expect(result).toEqual({
        movie: undefined,
        status: 404,
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      (prisma.movie.findUnique as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieData.findUniqueMoviePublished('movie-123');

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(
        mockError,
        'findUniqueMoviePublished'
      );
    });
  });

  describe('findByGoogleDriveId', () => {
    it('should find a movie by Google Drive ID and return it with status 200', async () => {
      const mockMovie = {
        id: 'movie-123',
        title: 'Test Movie',
        idGoogleDive: 'google-drive-id-123',
      };

      const movieData = {
        idGoogleDive: 'google-drive-id-123',
      };

      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(mockMovie);

      const result = await MovieData.findByGoogleDriveId(movieData);

      expect(result).toEqual({
        existingMovie: mockMovie,
        status: 200,
      });

      expect(prisma.movie.findUnique).toHaveBeenCalledWith({
        where: { idGoogleDive: 'google-drive-id-123' },
      });
    });

    it('should return 400 when movie not found', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await MovieData.findByGoogleDriveId({
        idGoogleDive: 'nonexistent-id',
      });

      expect(result).toEqual({
        existingMovie: undefined,
        status: 400,
      });
    });

    it('should handle empty Google Drive ID', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await MovieData.findByGoogleDriveId({});

      expect(result).toEqual({
        existingMovie: undefined,
        status: 400,
      });

      expect(prisma.movie.findUnique).toHaveBeenCalledWith({
        where: { idGoogleDive: '' },
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      (prisma.movie.findUnique as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieData.findByGoogleDriveId({
        idGoogleDive: 'google-drive-id',
      });

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(mockError, 'findByGoogleDriveId');
    });
  });

  describe('findManyOrderByDesc', () => {
    it('should return movies ordered by update date descending with status 200', async () => {
      const mockMovies = [
        { id: '1', updatedAt: new Date('2024-01-02'), publish: true },
        { id: '2', updatedAt: new Date('2024-01-01'), publish: true },
      ];

      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMovies);

      const result = await MovieData.findManyOrderByDesc();

      expect(result).toEqual({
        movies: mockMovies,
        status: 200,
      });

      expect(prisma.movie.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { publish: true },
          orderBy: { updatedAt: 'desc' },
          select: { id: true, updatedAt: true },
        })
      );
    });

    it('should return 404 when no movies found', async () => {
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(null);

      const result = await MovieData.findManyOrderByDesc();

      expect(result).toEqual({
        movies: [],
        status: 404,
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      (prisma.movie.findMany as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieData.findManyOrderByDesc();

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(
        mockError,
        'findManyOrderByDesc data'
      );
    });
  });

  describe('findUniqueIncludesGenres', () => {
    it('should find a movie with genres and return it with status 200', async () => {
      const mockMovie = {
        id: 'movie-123',
        title: 'Test Movie',
        genresIds: [
          {
            genre: {
              id: '1',
              nameFR: 'Action',
              nameEN: 'Action',
              nameJP: 'アクション',
            },
          },
        ],
      };

      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(mockMovie);

      const result = await MovieData.findUniqueIncludesGenres('movie-123');

      expect(result).toEqual({
        movieInDb: mockMovie,
        status: 200,
      });

      expect(prisma.movie.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'movie-123' },
          include: expect.objectContaining({
            genresIds: expect.any(Object),
          }),
        })
      );
    });

    it('should return 404 when movie not found', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await MovieData.findUniqueIncludesGenres('nonexistent-id');

      expect(result).toEqual({
        movieInDb: undefined,
        status: 404,
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      (prisma.movie.findUnique as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieData.findUniqueIncludesGenres('movie-123');

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(
        mockError,
        'findUniqueIncludesGenres'
      );
    });
  });

  describe('findManyMovieGenres', () => {
    it('should find movies by genre excluding specified movie with status 200', async () => {
      const randomGenre = {
        genre: {
          id: '1',
          nameFR: 'Action',
          nameEN: 'Action',
          nameJP: 'アクション',
        },
      };

      const movieInDb = {
        id: 'movie-123',
        title: 'Current Movie',
      };

      const mockMovies = [
        { id: 'movie-456', title: 'Similar Movie 1' },
        { id: 'movie-789', title: 'Similar Movie 2' },
      ];

      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMovies);

      const result = await MovieData.findManyMovieGenres(
        randomGenre,
        movieInDb
      );

      expect(result).toEqual({
        movies: mockMovies,
        status: 200,
      });

      expect(prisma.movie.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            genresIds: expect.any(Object),
            NOT: { id: 'movie-123' },
          }),
        })
      );
    });

    it('should return 404 when no movies found', async () => {
      const randomGenre = {
        genre: {
          id: '1',
          nameFR: 'Action',
          nameEN: 'Action',
          nameJP: 'アクション',
        },
      };

      const movieInDb = {
        id: 'movie-123',
        title: 'Current Movie',
      };

      (prisma.movie.findMany as jest.Mock).mockResolvedValue(null);

      const result = await MovieData.findManyMovieGenres(
        randomGenre,
        movieInDb
      );

      expect(result).toEqual({
        movies: undefined,
        status: 404,
      });
    });

    it('should handle database errors', async () => {
      const randomGenre = {
        genre: {
          id: '1',
          nameFR: 'Action',
          nameEN: 'Action',
          nameJP: 'アクション',
        },
      };

      const movieInDb = {
        id: 'movie-123',
        title: 'Current Movie',
      };

      const mockError = new Error('Database error');
      (prisma.movie.findMany as jest.Mock).mockRejectedValue(mockError);

      const result = await MovieData.findManyMovieGenres(
        randomGenre,
        movieInDb
      );

      expect(result).toEqual({
        status: 500,
      });

      expect(logError).toHaveBeenCalledWith(mockError, 'findManyMovieGenres');
    });
  });
});
