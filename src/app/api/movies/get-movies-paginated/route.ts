import { verifyAdmin } from '@/lib/data/dal/core/auth';
import { DALError } from '@/lib/data/dal/core/errors';
import { MovieData } from '@/lib/data/movies';
import { logError } from '@/lib/errors';
import {
  MOVIE_PUBLISH_FILTERS,
  MoviePublishFilter,
} from '@/models/movie/movie-filters';
import HttpStatus from '@/shared/constants/httpStatus';
import { MAX_SEARCH_LENGTH } from '@/shared/constants/pagination';

export const dynamic = 'force-dynamic';

const isPublishFilter = (value: string): value is MoviePublishFilter =>
  (MOVIE_PUBLISH_FILTERS as readonly string[]).includes(value);

/**
 * GET /api/movies/get-movies-paginated?page=0&search=&publish=all
 * Admin movie table: paginated movies with total count
 */
export async function GET(request: Request): Promise<Response> {
  try {
    await verifyAdmin();

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') ?? '0');
    const search = (searchParams.get('search') ?? '').trim();
    const publish = searchParams.get('publish') ?? 'all';

    if (
      !Number.isInteger(page) ||
      page < 0 ||
      search.length > MAX_SEARCH_LENGTH ||
      !isPublishFilter(publish)
    ) {
      return Response.json(
        { error: 'Invalid query parameters' },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    const { movies, total, status } = await MovieData.findPaginatedForAdmin({
      page,
      search,
      publish,
    });

    if (status !== HttpStatus.OK) {
      return Response.json({ error: 'Failed to fetch movies' }, { status });
    }

    return Response.json({ movies, total });
  } catch (error) {
    if (error instanceof DALError) {
      return Response.json(
        { error: error.message },
        { status: error.toHTTPStatus() }
      );
    }
    logError(error, 'GET /api/movies/get-movies-paginated');
    return Response.json(
      { error: 'Internal server error' },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
