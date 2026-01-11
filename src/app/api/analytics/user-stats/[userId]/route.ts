import { verifySession, verifyOwnership } from '@/lib/data/dal';
import { DALError } from '@/lib/data/dal/core/errors';
import { AnalyticsService } from '@/domains/dashboard/services';
import { logError } from '@/lib/errors';
import HttpStatus from '@/shared/constants/httpStatus';
import { NextRequest } from 'next/server';

/**
 * GET /api/analytics/user-stats/[userId]
 * Get user statistics (favorites, recent activity)
 * Requires authentication and user ownership or admin role
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<Response> {
  try {
    // Security: Verify session first
    await verifySession();

    // Await params (Next.js 15+ requirement)
    const { userId } = await params;

    // Security: Verify user owns this data or is admin
    await verifyOwnership(userId);

    const result = await AnalyticsService.getUserStats(userId);

    if (result.status !== HttpStatus.OK) {
      return Response.json(
        { error: result.message ?? 'Failed to fetch user statistics' },
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
    logError(error, 'GET /api/analytics/user-stats/[userId]');
    return Response.json(
      { error: 'Internal server error' },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
