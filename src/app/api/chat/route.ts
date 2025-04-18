import { NextResponse } from 'next/server';
import { mistral } from '@/lib/mistral';
import { z } from 'zod';
import { getAllMovies } from '@/domains/movies/action';
import { getAllGenres } from '@/domains/movies/action';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const movies = await getAllMovies();
    const genres = await getAllGenres();
    const thread = await mistral.chat.parse({
      model: "mistral-large-latest",
      temperature: 0.2,
      messages: [
        { role: 'system', content: `Tu es un assistant qui répond à des questions sur les films de la liste donnée et ne fait que cela. Voici la liste des films et des genres: ${JSON.stringify(movies)} ${JSON.stringify(genres)}` },
        { role: 'user', content: message }
      ],
      responseFormat: z.object({
        answer: z.string()
      })
    });
    return NextResponse.json({ answer: thread.choices[0].message.content, status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { answer: 'Une erreur est survenue', status: 500 },
      { status: 500 }
    );
  }
} 