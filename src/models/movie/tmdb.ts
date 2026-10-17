export interface ITmdbMovieDetails {
  id: number;
  title?: string;
  original_title?: string;
  original_language?: string;
  overview?: string;
  release_date?: string;
  runtime?: number | null;
  poster_path?: string | null;
  production_countries?: { iso_3166_1: string; name: string }[];
  credits?: { crew?: { job: string; name: string }[] };
  videos?: { results?: { site: string; type: string; key: string }[] };
}

export interface ITmdbPrefillSources {
  fr: ITmdbMovieDetails;
  en?: ITmdbMovieDetails | null;
  ja?: ITmdbMovieDetails | null;
}

export interface ITmdbPrefillData {
  title?: string;
  originalTitle?: string;
  titleEnglish?: string;
  titleJapanese?: string;
  director?: string;
  year?: number;
  duration?: number;
  synopsis?: string;
  country?: string;
  langage?: string;
  trailer?: string;
  link?: string;
}
