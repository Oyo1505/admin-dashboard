import { verifyAdmin } from '@/lib/data/dal';
import { AnalyticsService } from '@/domains/dashboard/services';
import { logError } from '@/lib/errors';
import HttpStatus from '@/shared/constants/httpStatus';
import { NextRequest } from 'next/server';

/**
 * GET /api/analytics/top-genres
 * Get top genres by favorites count
 * Requires ADMIN role
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    // Security: Verify admin role
    await verifyAdmin();

    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : undefined;

    const result = await AnalyticsService.getTopGenres(limit);

    if (result.status !== HttpStatus.OK) {
      return Response.json(
        { error: result.message ?? 'Failed to fetch top genres' },
        { status: result.status }
      );
    }

    return Response.json(result.data, { status: HttpStatus.OK });
  } catch (error) {
    logError(error, 'GET /api/analytics/top-genres');
    return Response.json(
      { error: 'Internal server error' },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
