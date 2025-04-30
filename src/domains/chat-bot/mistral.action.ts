'use server'
import { mistral } from "@/lib/mistral";
import { getAllMovies } from "../dashboard/action";
import { ChatbotService } from "./services/chatbot.service";
import { IMistralService } from "./interfaces/mistral.interface";
import { IMovieService, IMovieDetails } from "./interfaces/movie.interface";

class MovieServiceImpl implements IMovieService {
  async getAllMovies(): Promise<IMovieDetails[]> {
    const { movieInDb } = await getAllMovies();
    return movieInDb.map((movie) => ({
      id: movie.id,
      title: movie.title,
      synopsis: movie.synopsis,
      country: movie.country,
      year: movie.year,
      duration: movie.duration ?? null,
      director: movie.director ?? null,
    }));
  }
}

const threadChatBot = async (message: string, locale: string) => {
  const chatbotService = new ChatbotService(
    mistral as IMistralService,
    new MovieServiceImpl()
  );
  
  return chatbotService.threadChatBot(message, locale);
};

export { threadChatBot };