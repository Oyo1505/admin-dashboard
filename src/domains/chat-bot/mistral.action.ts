'use server'
import { mistral } from "@/lib/mistral";
import { z } from "zod";
import { getAllMovies } from "../dashboard/action";


const threadChatBot = async (message: string, locale: string): Promise<{answer: string, status: number}> => {
    try {
        const movies = await getAllMovies();       
        if(movies.movieInDb.length > 0) {
            const thread = await mistral.chat.parse({
                model: "mistral-large-latest",
                temperature: 0.2,
                messages: [
                    {role : 'system', content: `Tu es un assistant qui répond à des questions sur les films a conseiller sur la liste donnée et ne fait que cela, ne conseille pas des films en dehors de la liste. 
                    Voici la liste des films : ${JSON.stringify(movies)}.
                    ${locale === 'fr' ? `Tu reponds en français` : locale === 'en' ? `Tu reponds en anglais` : locale === 'jp' && `Tu reponds en japonais`} OBLIGATOIREMENT.`
                },
                    {role: 'user', content: message}
                ],
                responseFormat: z.object({
                    answer: z.string().describe(`donne des informations sur le ou les films demandés, n'affiche pas l'id dans le texte de description, en donneant le lien vers le film si c'est possible qui se compose comme ceci: ${process.env.NEXTAUTH_URL}/movies/id. Respecet le nombre de films demandés. Si plusieurs films sont donnés, fais une liste à puce.`)
                }).describe(`en format html et le ou les liens vers le ou les films sont des liens html de couleur bleue. Si plusieurs films sont donnés, fais une liste à puce. ${locale === 'fr' ? `Tu reponds en français` : locale === 'en' ? `Tu reponds en anglais` : locale === 'jp' && `Tu reponds en japonais`} OBLIGATOIREMENT.
                    Ne propose pas de films qui n'ont pas de rapport avec le message de l'utilisateur. Respecet le nombre de films demandés. Si plusieurs films sont demandés, donne les informations pour chaque film.
                    `)
            });

            const answer = thread?.choices?.[0]?.message?.content;
  
            if (!answer || typeof answer !== 'string') {
                return { answer: 'Aucune réponse reçue du modèle', status: 500 };
            }

            try {
                const parsedAnswer = JSON.parse(answer);
                return { answer: parsedAnswer.answer, status: 200 };
            } catch (e) {
                return { answer: answer, status: 200 };
            }
        } else {
            return { answer: 'Aucun film trouvé', status: 404 };
        }
    } catch (error) {
        console.error(error);
        return { answer: 'Une erreur est survenue lors de la récupération des films et des genres', status: 500 };
    }
}

export {threadChatBot}