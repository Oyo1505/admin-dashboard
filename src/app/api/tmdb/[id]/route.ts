import { verifySession } from '@/lib/data/dal/core/auth';
import { toDALErrorResponse } from '@/lib/data/dal/core/errors';
import HttpStatus from '@/shared/constants/httpStatus';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifySession();

    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'fr';
    const { id } = await params;

    const response = await fetch(
      `https://api.themoviedb.org/3/find/${id}?external_source=imdb_id&language=${language}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TOKEN_TMDB}`,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      return Response.json(
        { error: 'Failed to fetch from TMDB' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    const dalResponse = toDALErrorResponse(error);
    if (dalResponse) return dalResponse;
    return Response.json(
      { error: 'Internal server error' },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
