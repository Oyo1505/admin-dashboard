import prisma from '@/lib/prisma';
import { IDirector } from '@/models/director/director';
import { IMovie } from '@/models/movie/movie';
import { cache } from 'react';
import 'server-only';
import { logError } from '../errors';

export class DirectorData {
  static getDirectorFromSection = cache(
    async (): Promise<{
      directorMovies?: IMovie[] | null;
      director?: IDirector | null;
      imageBackdrop?: string | null;
      status: number;
    }> => {
      try {
        const directorSection = await prisma.directorSection.findFirst();

        const directorMovies: IMovie[] | null = null;
        return {
          directorMovies,
          director: directorSection ?? null,
          imageBackdrop: directorSection?.imageBackdrop ?? null,
          status: 200,
        };
      } catch (error) {
        logError(error, 'director');
        return Response.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    }
  );
  static getDirectorMovies = cache(
    async (): Promise<{
      directorMovies?: IMovie[] | null;
      director?: string | null;
      imageBackdrop?: string | null;
      status: number;
    }> => {
      try {
        const { director } = await DirectorData.getDirectorFromSection();
        if (director && director?.director) {
          const directorMovies = await prisma.movie.findMany({
            where: {
              publish: true,
              director: director.director,
            },
          });

          return {
            directorMovies,
            status: 200,
          };
        } else {
          return {
            directorMovies: null,
            director: null,
            imageBackdrop: null,
            status: 200,
          };
        }
      } catch {
        return Response.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    }
  );
}
