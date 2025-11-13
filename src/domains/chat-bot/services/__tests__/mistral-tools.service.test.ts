import { mistralTools, mistralFunctions } from '../mistral-tools.service';
import { IMovieService, IMovieDetails } from '../../interfaces/movie.interface';

describe('Mistral Tools Service', () => {
  describe('mistralTools', () => {
    it('should export tools array with get_all_movies function', () => {
      expect(mistralTools).toHaveLength(1);
      expect(mistralTools[0].type).toBe('function');
      expect(mistralTools[0].function.name).toBe('get_all_movies');
      expect(mistralTools[0].function.description).toBe(
        'Get all movies informations'
      );
    });

    it('should have correct parameter schema', () => {
      const tool = mistralTools[0];
      expect(tool.function.parameters).toBeDefined();

      // Validate schema structure by parsing a valid object
      const validData = {
        movies: [
          {
            id: 'movie-123',
            title: 'Test Movie',
            description: 'Test description',
            image: 'test.jpg',
            link: 'http://example.com',
          },
        ],
      };

      const parseResult = tool.function.parameters.safeParse(validData);
      expect(parseResult.success).toBe(true);
    });

    it('should reject invalid parameter data', () => {
      const tool = mistralTools[0];

      // Missing required fields
      const invalidData = {
        movies: [
          {
            id: 'movie-123',
            // Missing title, description, image, link
          },
        ],
      };

      const parseResult = tool.function.parameters.safeParse(invalidData);
      expect(parseResult.success).toBe(false);
    });

    it('should accept empty movies array', () => {
      const tool = mistralTools[0];
      const validData = { movies: [] };

      const parseResult = tool.function.parameters.safeParse(validData);
      expect(parseResult.success).toBe(true);
    });
  });

  describe('mistralFunctions', () => {
    describe('get_all_movies', () => {
      it('should transform movie data correctly', async () => {
        const mockMovies: IMovieDetails[] = [
          {
            id: 'movie-1',
            title: 'The Matrix',
            synopsis:
              'A computer hacker learns about the true nature of reality',
            country: 'USA',
            year: 1999,
            duration: 136,
            director: 'Wachowskis',
            genresIds: [],
            subtitles: [],
          },
          {
            id: 'movie-2',
            title: 'Inception',
            synopsis:
              'A thief who steals corporate secrets through dream-sharing',
            country: 'USA',
            year: 2010,
            duration: 148,
            director: 'Christopher Nolan',
            genresIds: [],
            subtitles: [],
          },
        ];

        const mockMovieService: IMovieService = {
          getAllMovies: jest.fn().mockResolvedValue(mockMovies),
        };

        const result = await mistralFunctions.get_all_movies(mockMovieService);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
          id: 'movie-1',
          title: 'The Matrix',
          synopsis: 'A computer hacker learns about the true nature of reality',
          country: 'USA',
          year: 1999,
          duration: 136,
          director: 'Wachowskis',
        });
        expect(result[1]).toEqual({
          id: 'movie-2',
          title: 'Inception',
          synopsis:
            'A thief who steals corporate secrets through dream-sharing',
          country: 'USA',
          year: 2010,
          duration: 148,
          director: 'Christopher Nolan',
        });
        expect(mockMovieService.getAllMovies).toHaveBeenCalledTimes(1);
      });

      it('should handle empty movie list', async () => {
        const mockMovieService: IMovieService = {
          getAllMovies: jest.fn().mockResolvedValue([]),
        };

        const result = await mistralFunctions.get_all_movies(mockMovieService);

        expect(result).toEqual([]);
        expect(mockMovieService.getAllMovies).toHaveBeenCalledTimes(1);
      });

      it('should only return specified fields', async () => {
        const mockMovies: IMovieDetails[] = [
          {
            id: 'movie-1',
            title: 'Test Movie',
            synopsis: 'Test synopsis',
            country: 'France',
            year: 2024,
            duration: 120,
            director: 'Test Director',
            genresIds: [],
            subtitles: [],
          },
        ];

        const mockMovieService: IMovieService = {
          getAllMovies: jest.fn().mockResolvedValue(mockMovies),
        };

        const result = await mistralFunctions.get_all_movies(mockMovieService);

        // Should not include genresIds, subtitles, googleDriveId, linkAsImage, createdAt, updatedAt
        expect(result[0]).not.toHaveProperty('genresIds');
        expect(result[0]).not.toHaveProperty('subtitles');
        expect(result[0]).not.toHaveProperty('googleDriveId');
        expect(result[0]).not.toHaveProperty('linkAsImage');
        expect(result[0]).not.toHaveProperty('createdAt');
        expect(result[0]).not.toHaveProperty('updatedAt');

        // Should only have these fields
        expect(Object.keys(result[0])).toEqual([
          'id',
          'title',
          'synopsis',
          'country',
          'year',
          'duration',
          'director',
        ]);
      });

      it('should handle movies with null optional fields', async () => {
        const mockMovies: IMovieDetails[] = [
          {
            id: 'movie-1',
            title: 'Test Movie',
            synopsis: null,
            country: null,
            year: null,
            duration: null,
            director: null,
            genresIds: [],
            subtitles: [],
            googleDriveId: null,
            linkAsImage: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any,
        ];

        const mockMovieService: IMovieService = {
          getAllMovies: jest.fn().mockResolvedValue(mockMovies),
        };

        const result = await mistralFunctions.get_all_movies(mockMovieService);

        expect(result[0]).toEqual({
          id: 'movie-1',
          title: 'Test Movie',
          synopsis: null,
          country: null,
          year: null,
          duration: null,
          director: null,
        });
      });
    });
  });
});
