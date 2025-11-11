import { AnalyticsData } from '@/lib/data/analytics';
import prisma from '@/lib/prisma';
import HttpStatus from '@/shared/constants/httpStatus';

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ email: string }>;
  }
): Promise<Response> {
  try {
    const { email } = await params;
    if (!email?.trim()) {
      return Response.json({ error: 'Email is required' }, { status: HttpStatus.BAD_REQUEST });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: HttpStatus.NOT_FOUND });
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
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}
