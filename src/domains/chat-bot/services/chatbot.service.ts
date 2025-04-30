import { IMistralService } from "../interfaces/mistral.interface";
import { IMovieService } from "../interfaces/movie.interface";
import { mistralTools, mistralFunctions } from "./mistral-tools.service";
import { z } from "zod";
import delay from "@/shared/utils/time/delay";

const MILLISECONDS_DELAY = 1000;

export class ChatbotService {
  constructor(
    /* eslint-disable no-unused-vars */
    private mistralService: IMistralService,
    private movieService: IMovieService
    /* eslint-enable no-unused-vars */
  ) {}

  private async functionCallMovies(message: string) {
    try {
      const response = await this.mistralService.chat.complete({
        model: "mistral-large-latest",
        temperature: 0.2,
        tools: mistralTools,
        toolChoice: 'any',
        parallelToolCalls: false,
        messages: [
          {role: 'system', content: `Tu es un assistant qui retourne une liste de films en fonction de la question de l'utilisateur. Tu ne réponds qu'à des questions sur les films. Si la question ne concerne pas les films, réponds "Je ne peux répondre qu'aux questions sur les films."`},
          {role: 'user', content: message}
        ],
      });
      
      const toolCall = response?.choices?.[0]?.message;
      const functionName = toolCall?.toolCalls?.[0]?.function.name;
      const functionResult = functionName ? await mistralFunctions[functionName as keyof typeof mistralFunctions](this.movieService) : null;
      
      return { 
        movies: functionResult || [], 
        status: functionResult ? 200 : 500 
      };
    } catch (error) {
      console.error(error);
      return { movies: [], status: 500 };
    }
  }

  async threadChatBot(message: string, locale: string) {
    try {
      const response = await this.functionCallMovies(message);
      if (response.status === 200) {
        await delay(MILLISECONDS_DELAY);
        
        const thread = await this.mistralService.chat.parse({
          model: "mistral-large-latest",
          temperature: 0.4,
          messages: [
            {role: 'system', content: `Tu es un assistant qui répond à des questions sur les films a conseiller sur la liste donnée et ne fait que cela, ne conseille pas des films en dehors de la liste.${locale === 'fr' ? `Tu reponds en français` : locale === 'en' ? `Tu reponds en anglais` : locale === 'jp' && `Tu reponds en japonais`} OBLIGATOIREMENT.`},
            {role: 'assistant', content: `Voici la liste des films: ${JSON.stringify(response.movies)}`},
            {role: 'user', content: message},
          ],
          responseFormat: z.object({
            answer: z.string().describe(`donne des informations sur le ou les films demandés, n'affiche pas l'id dans le texte de description, en donneant le lien vers le film si c'est possible qui se compose comme ceci: ${process.env.NEXTAUTH_URL}/movies/id. Respecet le nombre de films demandés. Si plusieurs films sont donnés, fais une liste à puce.`)
          }).describe(`en format html et le ou les liens vers le ou les films sont des liens html de couleur bleue. Si plusieurs films sont donnés, fais une liste à puce. ${locale === 'fr' ? `Tu reponds en français` : locale === 'en' ? `Tu reponds en anglais` : locale === 'jp' && `Tu reponds en japonais`} OBLIGATOIREMENT.
              Ne propose pas de films qui n'ont pas de rapport avec le message de l'utilisateur. Respecet le nombre de films demandés. Si plusieurs films sont demandés, donne les informations pour chaque film.`)
        });

        const answer = thread?.choices?.[0]?.message?.content as string;
        const parsedAnswer = JSON.parse(answer);
        return { 
          answer: parsedAnswer.answer, 
          status: answer ? 200 : 500 
        };
      } else {
        return { answer: 'Une erreur est survenue la liste des films n\'a pas été récupérée', status: 500 };
      }
    } catch (error) {
      console.error(error);
      return { answer: 'Une erreur est survenue ici', status: 500 };
    }
  }
} 