import { logError } from '@/lib/errors';
import { ITmdbMovieDetails } from '@/models/movie/tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const tmdbFetch = async <T>(path: string): Promise<T | null> => {
  const response = await fetch(`${TMDB_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.TOKEN_TMDB}`,
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    logError(new Error(`TMDB ${response.status}`), `TmdbData ${path}`);
    return null;
  }
  return (await response.json()) as T;
};

export class TmdbData {
  /**
   * Resolves an IMDb id (e.g. tt0094625) to a TMDB movie id
   */
  static async findMovieIdByImdbId(imdbId: string): Promise<number | null> {
    const data = await tmdbFetch<{ movie_results?: { id: number }[] }>(
      `/find/${encodeURIComponent(imdbId)}?external_source=imdb_id`
    );
    return data?.movie_results?.[0]?.id ?? null;
  }

  /**
   * Fetches movie details with credits and videos in a single request
   */
  static async getMovieDetails(
    tmdbId: number,
    language: string,
    withExtras = false
  ): Promise<ITmdbMovieDetails | null> {
    const extras = withExtras
      ? '&append_to_response=credits,videos&include_video_language=fr,en,ja,null'
      : '';
    return tmdbFetch<ITmdbMovieDetails>(
      `/movie/${tmdbId}?language=${language}${extras}`
    );
  }
}
