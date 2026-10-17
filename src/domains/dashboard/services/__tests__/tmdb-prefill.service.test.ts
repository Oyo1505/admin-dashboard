import { ITmdbMovieDetails } from '@/models/movie/tmdb';
import { TmdbPrefillService } from '../tmdb-prefill.service';

const frDetails: ITmdbMovieDetails = {
  id: 128,
  title: 'Princesse Mononoké',
  original_title: 'もののけ姫',
  original_language: 'ja',
  overview: 'Synopsis FR',
  release_date: '1997-07-12',
  runtime: 134,
  poster_path: '/poster-fr.jpg',
  production_countries: [{ iso_3166_1: 'JP', name: 'Japan' }],
  credits: {
    crew: [
      { job: 'Producer', name: 'Toshio Suzuki' },
      { job: 'Director', name: 'Hayao Miyazaki' },
    ],
  },
  videos: {
    results: [
      { site: 'Vimeo', type: 'Trailer', key: 'vimeo-key' },
      { site: 'YouTube', type: 'Teaser', key: 'teaser-key' },
      { site: 'YouTube', type: 'Trailer', key: 'abc123' },
    ],
  },
};

describe('TmdbPrefillService', () => {
  describe('isValidImdbId', () => {
    it.each(['tt0094625', 'tt12345678', ' tt0094625 '])(
      'should accept %s',
      (id) => {
        expect(TmdbPrefillService.isValidImdbId(id)).toBe(true);
      }
    );

    it.each([undefined, '', 'tt123', '0094625', 'nm0000123', 'tt0094625x'])(
      'should reject %s',
      (id) => {
        expect(TmdbPrefillService.isValidImdbId(id)).toBe(false);
      }
    );
  });

  describe('mapToMovieForm', () => {
    it('should map all available fields', () => {
      const result = TmdbPrefillService.mapToMovieForm({
        fr: frDetails,
        en: { id: 128, title: 'Princess Mononoke' },
        ja: { id: 128, title: 'もののけ姫' },
      });

      expect(result).toEqual({
        title: 'Princesse Mononoké',
        originalTitle: 'もののけ姫',
        titleEnglish: 'Princess Mononoke',
        titleJapanese: 'もののけ姫',
        director: 'Hayao Miyazaki',
        year: 1997,
        duration: 134,
        synopsis: 'Synopsis FR',
        country: 'JP',
        langage: 'jp',
        trailer: 'https://www.youtube.com/watch?v=abc123',
        link: 'https://image.tmdb.org/t/p/w500/poster-fr.jpg',
      });
    });

    it('should fall back to the English poster', () => {
      const result = TmdbPrefillService.mapToMovieForm({
        fr: { id: 1, poster_path: null },
        en: { id: 1, poster_path: '/poster-en.jpg' },
      });

      expect(result.link).toBe('https://image.tmdb.org/t/p/w500/poster-en.jpg');
    });

    it('should join multiple directors', () => {
      const result = TmdbPrefillService.mapToMovieForm({
        fr: {
          id: 1,
          credits: {
            crew: [
              { job: 'Director', name: 'Joel Coen' },
              { job: 'Director', name: 'Ethan Coen' },
            ],
          },
        },
      });

      expect(result.director).toBe('Joel Coen, Ethan Coen');
    });

    it('should drop missing or empty values', () => {
      const result = TmdbPrefillService.mapToMovieForm({
        fr: { id: 1, title: 'Titre', overview: '', runtime: null },
        en: null,
        ja: null,
      });

      expect(result).toEqual({ title: 'Titre' });
    });

    it('should ignore languages and countries unknown to the app', () => {
      const result = TmdbPrefillService.mapToMovieForm({
        fr: {
          id: 1,
          original_language: 'xx',
          production_countries: [{ iso_3166_1: 'ZZ', name: 'Nowhere' }],
        },
      });

      expect(result.langage).toBeUndefined();
      expect(result.country).toBeUndefined();
    });

    it('should keep ISO language codes that already match the app', () => {
      const result = TmdbPrefillService.mapToMovieForm({
        fr: { id: 1, original_language: 'fr' },
      });

      expect(result.langage).toBe('fr');
    });

    it('should not set a trailer when no YouTube trailer exists', () => {
      const result = TmdbPrefillService.mapToMovieForm({
        fr: {
          id: 1,
          videos: { results: [{ site: 'YouTube', type: 'Clip', key: 'k' }] },
        },
      });

      expect(result.trailer).toBeUndefined();
    });

    it('should ignore an invalid release date', () => {
      const result = TmdbPrefillService.mapToMovieForm({
        fr: { id: 1, release_date: '' },
      });

      expect(result.year).toBeUndefined();
    });
  });

  describe('pickFieldsToFill', () => {
    const prefill = { title: 'Titre TMDB', director: 'Réal', year: 1997 };

    it('should only keep fields that are empty in the form', () => {
      const result = TmdbPrefillService.pickFieldsToFill(
        { title: 'Saisie manuelle', director: '', year: 2001 },
        prefill
      );

      expect(result).toEqual({ director: 'Réal' });
    });

    it('should keep overridable fields even when filled', () => {
      const result = TmdbPrefillService.pickFieldsToFill(
        { title: 'Saisie manuelle', director: 'X', year: 2026 },
        prefill,
        ['year']
      );

      expect(result).toEqual({ year: 1997 });
    });

    it('should treat 0 and undefined as empty', () => {
      const result = TmdbPrefillService.pickFieldsToFill(
        { duration: 0 },
        { duration: 120, synopsis: 'S' }
      );

      expect(result).toEqual({ duration: 120, synopsis: 'S' });
    });
  });
});
