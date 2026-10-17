import { TmdbPrefillService } from '@/domains/dashboard/services/tmdb-prefill.service';
import { verifyAdmin } from '@/lib/data/dal/core/auth';
import { DALError } from '@/lib/data/dal/core/errors';
import { TmdbData } from '@/lib/data/tmdb';
import { logError } from '@/lib/errors';
import HttpStatus from '@/shared/constants/httpStatus';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tmdb/prefill/[imdbId]
 * Returns movie form values (admin only) built from TMDB data
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ imdbId: string }> }
): Promise<Response> {
  try {
    await verifyAdmin();

    const { imdbId } = await params;
    if (!TmdbPrefillService.isValidImdbId(imdbId)) {
      return Response.json(
        { error: 'Invalid IMDb id' },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    const tmdbId = await TmdbData.findMovieIdByImdbId(imdbId.trim());
    if (!tmdbId) {
      return Response.json(
        { error: 'Movie not found' },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    const [fr, en, ja] = await Promise.all([
      TmdbData.getMovieDetails(tmdbId, 'fr-FR', true),
      TmdbData.getMovieDetails(tmdbId, 'en-US'),
      TmdbData.getMovieDetails(tmdbId, 'ja-JP'),
    ]);

    if (!fr) {
      return Response.json(
        { error: 'Failed to fetch from TMDB' },
        { status: HttpStatus.BAD_GATEWAY }
      );
    }

    return Response.json(TmdbPrefillService.mapToMovieForm({ fr, en, ja }));
  } catch (error) {
    if (error instanceof DALError) {
      return Response.json(
        { error: error.message },
        { status: error.toHTTPStatus() }
      );
    }
    logError(error, 'GET /api/tmdb/prefill/[imdbId]');
    return Response.json(
      { error: 'Internal server error' },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
