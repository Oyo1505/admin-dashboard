import { IUserAnalytics } from '@/lib/data/users';
import { logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import HttpStatus from '@/shared/constants/httpStatus';

export async function GET(): Promise<Response> {
  try {
    const users = await prisma.user.findMany({
      where: {
        analytics: {
          some: {},
        },
      },
      include: {
        analytics: {
          orderBy: {
            lastLogin: 'desc',
          },
        },
      },
    });

    const transformedUsers: IUserAnalytics[] = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: user.role,
      analytics: user.analytics.map((analytic) => ({
        id: analytic.id,
        lastLogin: analytic.lastLogin,
        lastMovieWatched: analytic.lastMovieWatched ?? undefined,
        visits: analytic.visits,
      })),
    }));

    return Response.json({ transformedUsers }, { status: HttpStatus.OK });
  } catch (error) {
    logError(error, 'get-all-analytics-users-visits error');
    return Response.json({ error: 'Internal server error' }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}
