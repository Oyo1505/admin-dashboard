import { z } from "zod";
import { IMovieService, IMovieDetails } from "../interfaces/movie.interface";

export const mistralTools = [
  {
    type: 'function' as const,
    function: {
      name: 'get_all_movies',
      description: 'Get all movies informations',
      parameters: z.object({
        movies: z.array(z.object({
          id: z.string().describe('The ID of the movie'),
          title: z.string().describe('The title of the movie'),
          description: z.string().describe('The description of the movie'),
          image: z.string().describe('The image of the movie'),
          link: z.string().describe('The link of the movie')
        }))
      })
    }
  }
];

export const mistralFunctions = {
  'get_all_movies': async (movieService: IMovieService) => {
    const movies = await movieService.getAllMovies();
    return movies.map((movie: IMovieDetails) => ({
      id: movie.id,
      title: movie.title,
      synopsis: movie.synopsis,
      country: movie.country,
      year: movie.year,
      duration: movie.duration,
      director: movie.director,
    }));
  }
}; 