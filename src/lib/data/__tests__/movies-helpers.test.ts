import {
  buildMovieData,
  buildGenresConnectionForCreate,
  buildGenresConnectionForUpdate,
  buildMovieInclude,
} from '../movies-helpers';
import { IMovieFormData } from '@/models/movie/movie';

describe('movies-helpers', () => {
  describe('buildMovieData', () => {
    it('should build complete movie data with all fields', () => {
      const mockMovieForm: IMovieFormData = {
        title: 'Inception',
        titleEnglish: 'Inception',
        titleJapanese: 'インセプション',
        link: 'https://example.com/inception',
        image: 'https://example.com/inception.jpg',
        director: 'Christopher Nolan',
        imdbId: 'tt1375666',
        originalTitle: 'Inception',
        duration: 148,
        idGoogleDive: 'google-drive-id-123',
        language: 'English',
        subtitles: ['FR', 'EN', 'JP'],
        year: 2010,
        country: 'USA',
        synopsis: 'A thief who steals corporate secrets...',
        trailer: 'https://youtube.com/watch?v=...',
        genresIds: ['1', '2'],
      };

      const result = buildMovieData(mockMovieForm);

      expect(result).toEqual({
        title: 'Inception',
        titleEnglish: 'Inception',
        titleJapanese: 'インセプション',
        link: 'https://example.com/inception',
        image: 'https://example.com/inception.jpg',
        director: 'Christopher Nolan',
        imdbId: 'tt1375666',
        originalTitle: 'Inception',
        duration: 148,
        idGoogleDive: 'google-drive-id-123',
        language: 'English',
        subtitles: ['FR', 'EN', 'JP'],
        year: 2010,
        country: 'USA',
        synopsis: 'A thief who steals corporate secrets...',
        trailer: 'https://youtube.com/watch?v=...',
      });
    });

    it('should handle missing optional fields', () => {
      const mockMovieForm: IMovieFormData = {
        title: 'Simple Movie',
        idGoogleDive: '',
        subtitles: [],
        originalTitle: 'Simple Movie',
        year: 2024,
        duration: 120,
        director: 'Unknown',
        genresIds: ['1'],
      };

      const result = buildMovieData(mockMovieForm);

      expect(result).toEqual({
        title: 'Simple Movie',
        titleEnglish: undefined,
        titleJapanese: undefined,
        link: '',
        image: '',
        director: 'Unknown',
        imdbId: undefined,
        originalTitle: undefined,
        duration: null,
        idGoogleDive: undefined,
        language: undefined,
        subtitles: [],
        year: null,
        country: undefined,
        synopsis: undefined,
        trailer: undefined,
      });
    });

    it('should use link as fallback for image when image is missing', () => {
      const mockMovieForm: IMovieFormData = {
        title: 'Movie with Link',
        idGoogleDive: '',
        subtitles: [],
        originalTitle: 'Movie with Link',
        year: 2024,
        duration: 120,
        link: 'https://example.com/movie',
        director: 'Director',
        genresIds: ['1'],
      };

      const result = buildMovieData(mockMovieForm);

      expect(result.image).toBe('https://example.com/movie');
      expect(result.link).toBe('https://example.com/movie');
    });

    it('should prefer image over link when both are provided', () => {
      const mockMovieForm: IMovieFormData = {
        title: 'Movie',
        idGoogleDive: '',
        subtitles: [],
        originalTitle: 'Movie',
        year: 2024,
        duration: 120,
        link: 'https://example.com/movie',
        image: 'https://example.com/custom-image.jpg',
        director: 'Director',
        genresIds: ['1'],
      };

      const result = buildMovieData(mockMovieForm);

      expect(result.image).toBe('https://example.com/custom-image.jpg');
    });

    it('should convert string duration to number', () => {
      const mockMovieForm: IMovieFormData = {
        title: 'Movie',
        idGoogleDive: '',
        subtitles: [],
        originalTitle: 'Movie',
        year: 2024,
        director: 'Director',
        duration: '120' as any,
        genresIds: ['1'],
      };

      const result = buildMovieData(mockMovieForm);

      expect(result.duration).toBe(120);
      expect(typeof result.duration).toBe('number');
    });

    it('should convert string year to number', () => {
      const mockMovieForm: IMovieFormData = {
        title: 'Movie',
        idGoogleDive: '',
        subtitles: [],
        originalTitle: 'Movie',
        duration: 120,
        director: 'Director',
        year: '2024' as any,
        genresIds: ['1'],
      };

      const result = buildMovieData(mockMovieForm);

      expect(result.year).toBe(2024);
      expect(typeof result.year).toBe('number');
    });

    it('should return null for invalid duration', () => {
      const mockMovieForm: IMovieFormData = {
        title: 'Movie',
        idGoogleDive: '',
        subtitles: [],
        originalTitle: 'Movie',
        year: 2024,
        director: 'Director',
        duration: NaN as any,
        genresIds: ['1'],
      };

      const result = buildMovieData(mockMovieForm);

      expect(result.duration).toBeNull();
    });

    it('should return null for invalid year', () => {
      const mockMovieForm: IMovieFormData = {
        title: 'Movie',
        idGoogleDive: '',
        subtitles: [],
        originalTitle: 'Movie',
        duration: 120,
        director: 'Director',
        year: NaN as any,
        genresIds: ['1'],
      };

      const result = buildMovieData(mockMovieForm);

      expect(result.year).toBeNull();
    });
  });

  describe('buildGenresConnectionForCreate', () => {
    it('should build genres connection for single genre', () => {
      const genresIds = ['genre-123'];

      const result = buildGenresConnectionForCreate(genresIds);

      expect(result).toEqual({
        create: [
          {
            genre: {
              connect: { id: 'genre-123' },
            },
          },
        ],
      });
    });

    it('should build genres connection for multiple genres', () => {
      const genresIds = ['genre-1', 'genre-2', 'genre-3'];

      const result = buildGenresConnectionForCreate(genresIds);

      expect(result).toEqual({
        create: [
          {
            genre: {
              connect: { id: 'genre-1' },
            },
          },
          {
            genre: {
              connect: { id: 'genre-2' },
            },
          },
          {
            genre: {
              connect: { id: 'genre-3' },
            },
          },
        ],
      });
      expect(result.create).toHaveLength(3);
    });

    it('should handle empty genres array', () => {
      const genresIds: string[] = [];

      const result = buildGenresConnectionForCreate(genresIds);

      expect(result).toEqual({
        create: [],
      });
    });

    it('should convert numeric genre IDs to strings', () => {
      const genresIds = ['1', '2', '3'];

      const result = buildGenresConnectionForCreate(genresIds);

      result.create.forEach((item) => {
        expect(typeof item.genre.connect.id).toBe('string');
      });
    });
  });

  describe('buildGenresConnectionForUpdate', () => {
    it('should build genres connection for update with single genre', () => {
      const genresIds = ['genre-123'];

      const result = buildGenresConnectionForUpdate(genresIds);

      expect(result).toEqual({
        deleteMany: {},
        create: [
          {
            genre: {
              connect: { id: 'genre-123' },
            },
          },
        ],
      });
    });

    it('should build genres connection for update with multiple genres', () => {
      const genresIds = ['genre-1', 'genre-2', 'genre-3'];

      const result = buildGenresConnectionForUpdate(genresIds);

      expect(result).toEqual({
        deleteMany: {},
        create: [
          {
            genre: {
              connect: { id: 'genre-1' },
            },
          },
          {
            genre: {
              connect: { id: 'genre-2' },
            },
          },
          {
            genre: {
              connect: { id: 'genre-3' },
            },
          },
        ],
      });
      expect(result.create).toHaveLength(3);
    });

    it('should include deleteMany for clearing existing genres', () => {
      const genresIds = ['genre-1'];

      const result = buildGenresConnectionForUpdate(genresIds);

      expect(result.deleteMany).toEqual({});
    });

    it('should handle empty genres array', () => {
      const genresIds: string[] = [];

      const result = buildGenresConnectionForUpdate(genresIds);

      expect(result).toEqual({
        deleteMany: {},
        create: [],
      });
    });
  });

  describe('buildMovieInclude', () => {
    it('should return correct include structure for genre relations', () => {
      const result = buildMovieInclude();

      expect(result).toEqual({
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
      });
    });

    it('should include all genre name fields', () => {
      const result = buildMovieInclude();

      expect(result.genresIds.select.genre.select).toHaveProperty('id');
      expect(result.genresIds.select.genre.select).toHaveProperty('nameFR');
      expect(result.genresIds.select.genre.select).toHaveProperty('nameEN');
      expect(result.genresIds.select.genre.select).toHaveProperty('nameJP');
    });

    it('should return same structure on multiple calls', () => {
      const result1 = buildMovieInclude();
      const result2 = buildMovieInclude();

      expect(result1).toEqual(result2);
    });
  });
});
