import { AnalyticsData } from '@/lib/data/analytics';
import { getCurrentUser } from '@/lib/data/dal/core/auth';
import { toDALErrorResponse } from '@/lib/data/dal/core/errors';
import { logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import HttpStatus from '@/shared/constants/httpStatus';

/**
 * GET /api/users/get-user-connected/[email]
 * A user can only read their own data; admins can read anyone's.
 */
export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ email: string }>;
  }
): Promise<Response> {
  try {
    const currentUser = await getCurrentUser();
    const { email } = await params;
    if (!email?.trim()) {
      return Response.json(
        { error: 'Email is required' },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    if (currentUser.email !== email && currentUser.role !== 'ADMIN') {
      return Response.json(
        { error: 'Forbidden' },
        { status: HttpStatus.FORBIDDEN }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    const { analytics } = await AnalyticsData.getAnalyticsUser(user);

    return Response.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          role: user.role,
          analytics: analytics?.map((a) => ({
            id: a.id,
            lastLogin: a.lastLogin,
            lastMovieWatched: a.lastMovieWatched ?? undefined,
          })),
        },
      },
      { status: HttpStatus.OK }
    );
  } catch (error) {
    const dalResponse = toDALErrorResponse(error);
    if (dalResponse) return dalResponse;
    logError(error, 'GET /api/users/get-user-connected/[email]');
    return Response.json(
      { error: 'Internal server error' },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
