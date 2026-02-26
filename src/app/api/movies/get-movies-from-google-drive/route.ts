import { getDataFromGoogleDrive } from '@/googleDrive';
import { verifyAdmin, withAuth } from '@/lib/data/dal';
import { MovieData } from '@/lib/data/movies';
import { logError } from '@/lib/errors';
import { IMovie } from '@/models/movie/movie';
import HttpStatus from '@/shared/constants/httpStatus';

export const GET = withAuth(verifyAdmin, async () => {
  try {
    const [driveResponse, dbResult] = await Promise.all([
      getDataFromGoogleDrive(),
      MovieData.getAll(),
    ]);

    if (!driveResponse) {
      return Response.json(
        { filteredMoviesNotAdded: [] },
        { status: HttpStatus.OK }
      );
    }

    if (!dbResult) {
      return Response.json({ movies: [] }, { status: HttpStatus.NOT_FOUND });
    }
    const idsInDatabase = new Set(
      dbResult.movies?.map((movie: IMovie) => movie.idGoogleDive)
    );
    const filteredMoviesNotAdded = driveResponse?.movies?.filter(
      (movieFromDrive) =>
        movieFromDrive?.id && !idsInDatabase.has(movieFromDrive.id)
    );

    return Response.json(
      {
        filteredMoviesNotAdded,
      },
      { status: HttpStatus.OK }
    );
  } catch (error) {
    logError(error, 'get-movies-from-google-drive');
    return Response.json(
      { error: 'Internal server error' },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
});
