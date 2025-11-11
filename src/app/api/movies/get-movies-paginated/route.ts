import { logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import HttpStatus from '@/shared/constants/httpStatus';

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = parseInt(searchParams.get('pageParam') ?? '0', 10);

    if (isNaN(pageParam) || pageParam < 0) {
      return Response.json(
        { error: 'Invalid pageParam parameter' },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    const movies = await prisma.movie.findMany({
      orderBy: { createdAt: 'desc' },
      skip: pageParam,
      take: 5,
    });

    if (!movies) {
      return Response.json({ movies: [] }, { status: HttpStatus.NOT_FOUND });
    }

    return Response.json(
      {
        movies,
      },
      { status: HttpStatus.OK }
    );
  } catch (error) {
    logError(error, 'get-authorized-emails-pagination');
    return Response.json({ error: 'Internal server error' }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}
