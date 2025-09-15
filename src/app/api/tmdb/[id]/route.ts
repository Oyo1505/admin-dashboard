'use server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'fr';

    // Le token reste sécurisé côté serveur
    const response = await fetch(
      `https://api.themoviedb.org/3/find/${params.id}?external_source=imdb_id&language=${language}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TOKEN_TMDB}`, // Serveur uniquement
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      return Response.json(
        { error: 'Failed to fetch from TMDB' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}