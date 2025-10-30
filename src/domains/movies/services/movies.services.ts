import { SearchData } from '@/lib/data/search';
import { IMovie } from '@/models/movie/movie';

/**
 * Service managing movie-related operations
 */
export class MoviesService {
  /**
   * Retrieves a list of movies with pagination and filters
   * @param pageParam - Number of movies to retrieve
   * @param search - Search parameters (URLSearchParams string)
   * Supported parameters:
   * - q: text search (title, director)
   * - subtitles: filter by subtitles
   * - language: filter by country/language
   * - decade: filter by decade (e.g., 1990)
   * - genre: filter by genre (FR/EN/JP)
   * @returns List of movies, HTTP status, and previous offset
   */
  static async fetchMovies({
    pageParam,
    search,
  }: {
    pageParam: number;
    search: string;
  }): Promise<{ status: number; movies?: IMovie[]; prevOffset?: number }> {
    // No search parameters - return all published movies
    if (!search.trim()) {
      return SearchData.findAllPublishedMovies(pageParam);
    }

    // Build search conditions from parameters
    const params = new URLSearchParams(search);
    const whereClause = SearchData.buildSearchConditions(params);

    // Execute search with conditions
    return SearchData.searchMovies(whereClause, pageParam);
  }
}
