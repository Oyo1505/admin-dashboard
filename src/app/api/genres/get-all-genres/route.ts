import { logError } from '@/lib/errors';
import prisma from '@/lib/prisma';

export async function GET(): Promise<Response> {
  try {
    const genres = await prisma.genre.findMany();

    if (!genres) {
      return Response.json({ genres }, { status: 404 });
    }
    return Response.json({ genres }, { status: 200 });
  } catch (error) {
    logError(error, 'get-all-genres');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
