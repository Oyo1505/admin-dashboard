import prisma from '@/lib/prisma';

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = parseInt(searchParams.get('pageParam') ?? '0', 10);

    if (isNaN(pageParam) || pageParam < 0) {
      return Response.json(
        { error: 'Invalid pageParam parameter' },
        { status: 400 }
      );
    }

    const userauthorizedEmails = await prisma.authorizedEmail.findMany({
      orderBy: {
        email: 'asc',
      },
      skip: pageParam,
      take: 5,
    });

    if (!userauthorizedEmails) {
      return Response.json({ mails: [] }, { status: 404 });
    }

    return Response.json(
      {
        mails: userauthorizedEmails,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
