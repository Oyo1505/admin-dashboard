import { verifyAdmin } from '@/lib/data/dal';
import { DALError } from '@/lib/data/dal/core/errors';
import { AnalyticsService } from '@/domains/dashboard/services';
import { logError } from '@/lib/errors';
import HttpStatus from '@/shared/constants/httpStatus';

/**
 * GET /api/analytics/admin-stats
 * Get comprehensive admin dashboard statistics
 * Requires ADMIN role
 */
export async function GET(): Promise<Response> {
  try {
    // Security: Verify admin role
    await verifyAdmin();

    const result = await AnalyticsService.getAdminDashboardStats();

    if (result.status !== HttpStatus.OK) {
      return Response.json(
        { error: result.message ?? 'Failed to fetch admin statistics' },
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
    logError(error, 'GET /api/analytics/admin-stats');
    return Response.json(
      { error: 'Internal server error' },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
