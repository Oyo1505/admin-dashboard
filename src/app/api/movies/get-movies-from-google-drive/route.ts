import { getDataFromGoogleDrive } from '@/googleDrive';
import { verifyAdmin, withAuth } from '@/lib/data/dal';
import { MovieData } from '@/lib/data/movies';
import { logError } from '@/lib/errors';
import { IMovie } from '@/models/movie/movie';

export const GET = withAuth(verifyAdmin, async () => {
  try {
    const response = await getDataFromGoogleDrive();
    if (!response) {
      return Response.json({ movies: [] }, { status: 404 });
    }
    const { movies } = await MovieData.getAll();

    if (!movies) {
      return Response.json({ movies: [] }, { status: 404 });
    }
    const idsMoviesFromDatabase = movies.map(
      (movie: IMovie) => movie.idGoogleDive
    );

    const filteredMoviesNotAdded = response?.movies?.filter(
      (movieFromDrive) =>
        movieFromDrive?.id &&
        !idsMoviesFromDatabase?.includes(movieFromDrive.id)
    );

    return Response.json(
      {
        filteredMoviesNotAdded,
      },
      { status: 200 }
    );
  } catch (error) {
    logError(error, 'get-movies-from-google-drive');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});
