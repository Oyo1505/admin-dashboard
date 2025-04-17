import { mistral } from "@/lib/mistral";
import { z } from "zod";
import { getAllMovies } from "../dashboard/action";
import { getAllGenres } from "../movies/action";

const threadChatBot = async (message: string) => {
    const movies = await getAllMovies();
    const genres = await getAllGenres();
    const movieDetails = movies.movieInDb.map((movie) => ({
        title: movie.title,
        description: movie.synopsis,
        genres: movie.genresIds?.map((genre) => genres.genres.find((g) => g.id === genre.genreId)?.name),
    }));
    const thread = await mistral.chat.parse({
        model: "mistral-large-latest",
        temperature: 0.2,
        messages: [
          {role : 'system', content: `Tu es un assistant qui répond à des questions sur les films a conseiller.
          Voici la liste des films : ${JSON.stringify(movies)}`},
          {role: 'user', content: message}],
        responseFormat: z.object({
            answer: z.string()
        })
    });
    return thread;
}
