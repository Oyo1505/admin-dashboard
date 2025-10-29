import { validateId } from '@/lib/api-wrapper';
import { MovieData } from '@/lib/data/movies';
import { handlePrismaError, logError } from '@/lib/errors';
import { IMovie } from '@/models/movie/movie';

export class MovieDetailService {
  static async movieDetail(id: string): Promise<{
    movie?: IMovie;
    suggestedMovies?: IMovie[] | undefined;
    status: number;
  }> {
    try {
      validateId(id);

      const { movieInDb } = await MovieData.findUniqueIncludesGenres(id);

      if (!movieInDb) {
        return { status: 404 };
      }

      const randomGenre =
        movieInDb.genresIds && movieInDb.genresIds.length > 0
          ? movieInDb.genresIds[
              Math.floor(Math.random() * movieInDb.genresIds.length)
            ]
          : null;

      const { movies: suggestedMovies } = randomGenre
        ? await MovieData.findManyMovieGenres(randomGenre, movieInDb)
        : { movies: [] };

      return {
        movie: movieInDb,
        suggestedMovies,
        status: 200,
      };
    } catch (error) {
      logError(error, 'movieDetail services');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
}
