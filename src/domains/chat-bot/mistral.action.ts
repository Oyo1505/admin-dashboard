'use server';
import { mistral } from '@/lib/mistral';
import delay from '@/shared/utils/time/delay';
import { getAllMovies } from '../dashboard/actions/movie';
import { ChatMessage } from './interfaces/chat.interface';
import { IMovieDetails } from './interfaces/movie.interface';
import {
  mistralFunctions,
  mistralTools,
} from './services/mistral-tools.service';

const MILLISECONDS_DELAY = 1000;

const mapMovies = async (): Promise<IMovieDetails[]> => {
  try {
    const { movieInDb } = await getAllMovies();

    if (!movieInDb || !Array.isArray(movieInDb)) {
      return [];
    }

    return movieInDb.map((movie) => ({
      id: movie.id,
      title: movie.title,
      synopsis: movie.synopsis,
      country: movie.country,
      year: movie.year,
      duration: movie.duration ?? null,
      director: movie.director ?? null,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des films:', error);
    return [];
  }
};

const threadChatBot = async (
  message: string,
  locale: string,
  conversationHistory?: ChatMessage[]
) => {
  try {
    // Validation des paramètres d'entrée
    if (!message?.trim()) {
      return {
        answer:
          locale === 'fr'
            ? 'Veuillez poser une question.'
            : locale === 'en'
              ? 'Please ask a question.'
              : '質問をしてください。',
        status: 400,
      };
    }

    if (!locale || !['fr', 'en', 'jp'].includes(locale)) {
      return {
        answer: 'Invalid locale parameter.',
        status: 400,
      };
    }

    const conversationContext = conversationHistory
      ? conversationHistory
          .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
          .slice(-4)
          .map((msg) => ({
            role: msg.role,
            content: msg.message,
          }))
      : [];

    let movies: IMovieDetails[] = [];

    try {
      const response = await mistral.chat.complete({
        model: 'mistral-large-latest',
        temperature: 0.3,
        tools: mistralTools,
        toolChoice: 'any',
        parallelToolCalls: false,
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant cinéphile amical. Si l'utilisateur demande des recommandations de films, utilise les outils disponibles pour récupérer la liste des films. Sinon, réponds directement de manière conversationnelle.`,
          },
          ...conversationContext,
          { role: 'user', content: message },
        ],
      });

      const toolCall = response?.choices?.[0]?.message;
      const functionName = toolCall?.toolCalls?.[0]?.function.name;

      if (functionName) {
        movies = await mistralFunctions[
          functionName as keyof typeof mistralFunctions
        ]({
          getAllMovies: mapMovies,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des films:', error);
    }

    await delay(MILLISECONDS_DELAY);

    let finalResponse;

    if (movies.length > 0) {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

      finalResponse = await mistral.chat.complete({
        model: 'mistral-large-latest',
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: `Tu es CineSensei, un assistant cinéphile passionné et amical. Réponds de manière naturelle et conversationnelle. ${locale === 'fr' ? 'Tu réponds en français' : locale === 'en' ? 'Tu réponds en anglais' : 'Tu réponds en japonais'} OBLIGATOIREMENT.

IMPORTANT : Quand tu recommandes des films, tu DOIS inclure des liens HTML vers les pages des films. Utilise ce format pour chaque film :
<a href="${baseUrl}/movies/{ID_DU_FILM}" style="color: #3b82f6; text-decoration: underline;">{TITRE_DU_FILM}</a>

Exemple : <a href="${baseUrl}/movies/123" style="color: #3b82f6; text-decoration: underline;">Le Titre du Film</a>

Voici les films disponibles avec leurs informations : ${JSON.stringify(movies)}

Exemple de réponse avec liens :
"Voici quelques excellents films que je recommande :

• <a href="${baseUrl}/movies/123" style="color: #3b82f6; text-decoration: underline;">Le Titre du Film</a> (2024) - Un film passionnant réalisé par [Réalisateur]

• <a href="${baseUrl}/movies/456" style="color: #3b82f6; text-decoration: underline;">Autre Film</a> (2023) - Une œuvre remarquable qui..."

N'oublie pas d'inclure TOUJOURS les liens HTML pour chaque film recommandé !`,
          },
          ...conversationContext,
          { role: 'user', content: message },
        ],
      });
    } else {
      finalResponse = await mistral.chat.complete({
        model: 'mistral-large-latest',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: `Tu es CineSensei, un assistant cinéphile passionné et amical. Réponds de manière naturelle et conversationnelle aux questions sur le cinéma. ${locale === 'fr' ? 'Tu réponds en français' : locale === 'en' ? 'Tu réponds en anglais' : 'Tu réponds en japonais'} OBLIGATOIREMENT.`,
          },
          ...conversationContext,
          { role: 'user', content: message },
        ],
      });
    }

    const answer = finalResponse?.choices?.[0]?.message?.content;

    if (!answer || typeof answer !== 'string') {
      throw new Error('Aucune réponse générée');
    }

    return {
      answer: answer,
      status: 200,
    };
  } catch (error) {
    console.error('Erreur dans threadChatBot:', error);
    return {
      answer:
        locale === 'fr'
          ? 'Désolé, je rencontre des difficultés techniques. Pouvez-vous reformuler votre question sur les films ?'
          : locale === 'en'
            ? "Sorry, I'm having technical difficulties. Could you rephrase your question about movies?"
            : '申し訳ありませんが、技術的な問題が発生しています。映画についての質問を言い換えていただけますか？',
      status: 500,
    };
  }
};

export { threadChatBot };
