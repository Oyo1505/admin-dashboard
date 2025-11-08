import { logError } from '@/lib/errors';
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

    const movies = await prisma.movie.findMany({
      skip: pageParam,
      take: 5,
    });

    if (!movies) {
      return Response.json({ mails: [] }, { status: 404 });
    }

    return Response.json(
      {
        movies,
      },
      { status: 200 }
    );
  } catch (error) {
    logError(error, 'get-authorized-emails-pagination');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
