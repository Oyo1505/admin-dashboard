import { GenreData } from '@/lib/data/genres';
import { logError } from '@/lib/errors';
import HttpStatus from '@/shared/constants/httpStatus';

export async function GET(): Promise<Response> {
  try {
    const genres = await GenreData.getAllGenres();

    if (!genres) {
      return Response.json({ genres }, { status: HttpStatus.NOT_FOUND });
    }
    return Response.json({ genres }, { status: HttpStatus.OK });
  } catch (error) {
    logError(error, 'get-all-genres');
    return Response.json({ error: 'Internal server error' }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}
