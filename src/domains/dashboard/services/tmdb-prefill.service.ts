import {
  ITmdbMovieDetails,
  ITmdbPrefillData,
  ITmdbPrefillSources,
} from '@/models/movie/tmdb';
import countriesList from '@/shared/constants/countries';
import { languagesList } from '@/shared/constants/lang';

export const IMDB_ID_REGEX = /^tt\d{7,10}$/;

/** TMDB uses ISO 639-1 codes; the app stores Japanese as "jp" */
const TMDB_TO_APP_LANGUAGE: Record<string, string> = { ja: 'jp' };

const YOUTUBE_WATCH_URL = 'https://www.youtube.com/watch?v=';

const TMDB_POSTER_URL = 'https://image.tmdb.org/t/p/w500';

const isBlank = (value: unknown): boolean =>
  value === undefined || value === null || value === '' || value === 0;

export class TmdbPrefillService {
  static isValidImdbId(imdbId?: string): boolean {
    return !!imdbId && IMDB_ID_REGEX.test(imdbId.trim());
  }

  /**
   * Maps TMDB details (fr + optional en/ja) to movie form values.
   * Undefined keys are dropped so they never override the form.
   */
  static mapToMovieForm({ fr, en, ja }: ITmdbPrefillSources): ITmdbPrefillData {
    const data: ITmdbPrefillData = {
      title: fr.title,
      originalTitle: fr.original_title,
      titleEnglish: en?.title,
      titleJapanese: ja?.title,
      director: this.getDirector(fr),
      year: this.getYear(fr.release_date),
      duration: fr.runtime ?? undefined,
      synopsis: fr.overview,
      country: this.getCountry(fr),
      langage: this.getLanguage(fr.original_language),
      trailer: this.getTrailer(fr),
      link: this.getPoster(fr, en),
    };

    return Object.fromEntries(
      Object.entries(data).filter(([, value]) => !isBlank(value))
    ) as ITmdbPrefillData;
  }

  /**
   * Keeps only the prefill values whose target field is still empty,
   * so manual input is never overwritten.
   */
  static pickFieldsToFill(
    current: Partial<Record<keyof ITmdbPrefillData, unknown>>,
    prefill: ITmdbPrefillData,
    overridable: (keyof ITmdbPrefillData)[] = []
  ): ITmdbPrefillData {
    return Object.fromEntries(
      Object.entries(prefill).filter(([key]) => {
        const field = key as keyof ITmdbPrefillData;
        return isBlank(current[field]) || overridable.includes(field);
      })
    ) as ITmdbPrefillData;
  }

  private static getDirector(movie: ITmdbMovieDetails): string | undefined {
    const directors = movie.credits?.crew
      ?.filter((member) => member.job === 'Director')
      .map((member) => member.name);
    return directors?.length ? directors.join(', ') : undefined;
  }

  private static getYear(releaseDate?: string): number | undefined {
    const year = Number(releaseDate?.slice(0, 4));
    return Number.isInteger(year) && year > 0 ? year : undefined;
  }

  private static getCountry(movie: ITmdbMovieDetails): string | undefined {
    const code = movie.production_countries?.[0]?.iso_3166_1;
    return countriesList.some((country) => country.value === code)
      ? code
      : undefined;
  }

  private static getLanguage(tmdbLanguage?: string): string | undefined {
    if (!tmdbLanguage) return undefined;
    const code = TMDB_TO_APP_LANGUAGE[tmdbLanguage] ?? tmdbLanguage;
    return languagesList.some((language) => language.value === code)
      ? code
      : undefined;
  }

  /** French poster first, English one as fallback */
  private static getPoster(
    fr: ITmdbMovieDetails,
    en?: ITmdbMovieDetails | null
  ): string | undefined {
    const posterPath = fr.poster_path ?? en?.poster_path;
    return posterPath ? `${TMDB_POSTER_URL}${posterPath}` : undefined;
  }

  private static getTrailer(movie: ITmdbMovieDetails): string | undefined {
    const trailer = movie.videos?.results?.find(
      (video) => video.site === 'YouTube' && video.type === 'Trailer'
    );
    return trailer ? `${YOUTUBE_WATCH_URL}${trailer.key}` : undefined;
  }
}
