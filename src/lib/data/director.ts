import prisma from '@/lib/prisma';
import { IDirector } from '@/models/director/director';
import { IMovie } from '@/models/movie/movie';
import { cache } from 'react';
import 'server-only';
import { handlePrismaError, logError } from '../errors';

export class DirectorData {
  static async create(
    formData: IDirector
  ): Promise<{ director?: IDirector; status: number; success: boolean }> {
    try {
      if (formData.id) {
        const director = await prisma.directorSection.create({
          data: {
            director: formData.director,
            imageBackdrop: formData.imageBackdrop,
          },
        });
        return { director, status: 200, success: true };
      }
      return { director: undefined, status: 404, success: false };
    } catch (error) {
      logError(error, 'update DirectorData');
      const appError = handlePrismaError(error);
      return {
        director: undefined,
        status: appError.statusCode,
        success: false,
      };
    }
  }
  static async delete(
    id: string
  ): Promise<{ status: number; success: boolean }> {
    try {
      await prisma.directorSection.delete({
        where: {
          id,
        },
      });
      return { status: 200, success: true };
    } catch (error) {
      logError(error, 'delete DirectorData');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode, success: false };
    }
  }
  static async update(
    formData: IDirector
  ): Promise<{ director?: IDirector; status: number; success: boolean }> {
    try {
      if (formData.id) {
        const director = await prisma.directorSection.update({
          where: {
            id: formData.id,
          },
          data: {
            director: formData.director,
            imageBackdrop: formData.imageBackdrop,
          },
        });
        return { director, status: 200, success: true };
      }
      return { director: undefined, status: 404, success: false };
    } catch (error) {
      logError(error, 'update DirectorData');
      const appError = handlePrismaError(error);
      return {
        director: undefined,
        status: appError.statusCode,
        success: false,
      };
    }
  }
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
            imageBackdrop: director.imageBackdrop,
            director: director.director,
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
