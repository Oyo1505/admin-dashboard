import { verifyAdmin } from '@/lib/data/dal';
import { AnalyticsService } from '@/domains/dashboard/services';
import { logError } from '@/lib/errors';
import HttpStatus from '@/shared/constants/httpStatus';
import { NextRequest } from 'next/server';

/**
 * GET /api/analytics/recent-activity
 * Get recent activity (new users and movies)
 * Requires ADMIN role
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    // Security: Verify admin role
    await verifyAdmin();

    const searchParams = request.nextUrl.searchParams;
    const days = searchParams.get('days')
      ? parseInt(searchParams.get('days')!)
      : undefined;

    const result = await AnalyticsService.getRecentActivity(days);

    if (result.status !== HttpStatus.OK) {
      return Response.json(
        { error: result.message ?? 'Failed to fetch recent activity' },
        { status: result.status }
      );
    }

    return Response.json(result.data, { status: HttpStatus.OK });
  } catch (error) {
    logError(error, 'GET /api/analytics/recent-activity');
    return Response.json(
      { error: 'Internal server error' },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
