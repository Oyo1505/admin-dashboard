import { verifyAdmin } from '@/lib/data/dal';
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
    logError(error, 'GET /api/analytics/admin-stats');
    return Response.json(
      { error: 'Internal server error' },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
