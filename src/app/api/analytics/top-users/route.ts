import { verifyAdmin } from '@/lib/data/dal';
import { DALError } from '@/lib/data/dal/core/errors';
import { AnalyticsService } from '@/domains/dashboard/services';
import { logError } from '@/lib/errors';
import HttpStatus from '@/shared/constants/httpStatus';
import { NextRequest } from 'next/server';

/**
 * GET /api/analytics/top-users
 * Get top users by visits count
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

    const result = await AnalyticsService.getTopUsers(limit);

    if (result.status !== HttpStatus.OK) {
      return Response.json(
        { error: result.message ?? 'Failed to fetch top users' },
        { status: result.status }
      );
    }

    return Response.json(result.data, { status: HttpStatus.OK });
  } catch (error) {
    // Handle DAL errors with proper HTTP status codes
    if (error instanceof DALError) {
      return Response.json(
        { error: error.message },
        { status: error.toHTTPStatus() }
      );
    }

    // Handle other errors as 500
    logError(error, 'GET /api/analytics/top-users');
    return Response.json(
      { error: 'Internal server error' },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
