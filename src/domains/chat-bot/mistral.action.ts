'use server'
import { mistral } from "@/lib/mistral";
import { z } from "zod";
import { getAllMovies } from "../dashboard/action";
import { IMovie } from "@/models/movie/movie";
import delay from "@/shared/utils/time/delay";


const tools = [
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
]

const namesToFunctions = {
    'get_all_movies': async () => {
        const { movieInDb } = await getAllMovies();
        return movieInDb.map((movie) => ({
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

interface IMovieResponse extends Omit<IMovie, 'genresIds' | 'idGoogleDive' | 'movieId' | 'link' | 'originalTitle' | 'titleJapanese' | 'titleEnglish' | 'tags' | 'favoriteUser' | 'kind' | 'name' | 'mimeType'> {
    id: string;
    title: string;
    synopsis: string | null;
    country: string | null;
    year: number | null;
    duration: number | null;
    director: string | null;
}
const functionCallMovies = async (message: string): Promise<{movies: IMovieResponse[], status: number}> => {
    try {
        const response = await mistral.chat.complete({
            model: "mistral-large-latest",
            temperature: 0.2,
            tools: tools,
            toolChoice: 'any',
            parallelToolCalls: false,
            messages: [
                {role: 'system', content: `Tu es un assistant qui répond uniquement aux questions sur les films. Si la question ne concerne pas les films, réponds "Je ne peux répondre qu'aux questions sur les films." tu filtre les films en fonction du message de l'utilisateur`},
                {role: 'user', content: message}
            ]
        })
        
        const toolCall = response?.choices?.[0]?.message;
        const functionName = toolCall?.toolCalls?.[0]?.function.name;
        const functionResult = functionName ? await namesToFunctions[functionName as keyof typeof namesToFunctions]() : null;
        return { 
            movies: (functionResult || []) as IMovieResponse[], 
            status: functionResult ? 200 : 500 
            };
    } catch (error) {
        console.error(error);
        return { movies: [], status: 500 };
    }
}

const MILLISECONDS_DELAY = 1000;
const threadChatBot = async (message: string, locale: string): Promise<{answer: string, status: number}> => {
    try { 
        const response = await functionCallMovies(message);
        if (response.status === 200) {
        await delay(MILLISECONDS_DELAY); // Mistral requires a 1-second delay between each request for free-tier usage
        const thread = await mistral.chat.parse({
            model: "mistral-large-latest",
            temperature: 0.2,
            messages: [
                {role : 'system', content: `Tu es un assistant qui répond à des questions sur les films a conseiller sur la liste donnée et ne fait que cela, ne conseille pas des films en dehors de la liste.${locale === 'fr' ? `Tu reponds en français` : locale === 'en' ? `Tu reponds en anglais` : locale === 'jp' && `Tu reponds en japonais`} OBLIGATOIREMENT.`},
                {role: 'assistant', content: `Voici la liste des films: ${JSON.stringify(response.movies)}`},
                {role: 'user', content: message},
            ],
            responseFormat: z.object({
                answer: z.string().describe(`donne des informations sur le ou les films demandés, n'affiche pas l'id dans le texte de description, en donneant le lien vers le film si c'est possible qui se compose comme ceci: ${process.env.NEXTAUTH_URL}/movies/id. Respecet le nombre de films demandés. Si plusieurs films sont donnés, fais une liste à puce.`)
            }).describe(`en format html et le ou les liens vers le ou les films sont des liens html de couleur bleue. Si plusieurs films sont donnés, fais une liste à puce. ${locale === 'fr' ? `Tu reponds en français` : locale === 'en' ? `Tu reponds en anglais` : locale === 'jp' && `Tu reponds en japonais`} OBLIGATOIREMENT.
                Ne propose pas de films qui n'ont pas de rapport avec le message de l'utilisateur. Respecet le nombre de films demandés. Si plusieurs films sont demandés, donne les informations pour chaque film.
                `)
        })
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


export {threadChatBot}