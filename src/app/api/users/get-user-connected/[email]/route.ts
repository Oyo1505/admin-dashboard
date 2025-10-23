import prisma from '@/lib/prisma';

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
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const analytics = await prisma.analyticsUser.findMany({
      where: {
        userId: user.id,
      },
    });

    return Response.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          role: user.role,
          analytics: analytics.map((a) => ({
            id: a.id,
            lastLogin: a.lastLogin,
            lastMovieWatched: a.lastMovieWatched ?? undefined,
          })),
        },
      },
      { status: 200 }
    );
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
