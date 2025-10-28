import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { IDirector } from '@/models/director/director';
import { URL_DASHBOARD_ROUTE } from '@/shared/route';
import { revalidatePath } from 'next/cache';

export class DirectorService {
  static async createDirector(
    formDirector: IDirector
  ): Promise<{ director?: IDirector; status: number; success: boolean }> {
    try {
      const director = await prisma.directorSection.create({
        data: {
          director: formDirector.director,
          imageBackdrop: formDirector.imageBackdrop,
        },
      });
      revalidatePath(URL_DASHBOARD_ROUTE.director);
      return { director, status: 200, success: true };
    } catch (error) {
      logError(error, 'createDirectorFromSection');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode, success: false };
    }
  }
  static async updateDirector(
    formDirector: IDirector
  ): Promise<{ director?: IDirector; status: number; success: boolean }> {
    try {
      if (formDirector.id) {
        const director = await prisma.directorSection.update({
          where: {
            id: formDirector.id,
          },
          data: {
            director: formDirector.director,
            imageBackdrop: formDirector.imageBackdrop,
          },
        });
        revalidatePath(URL_DASHBOARD_ROUTE.director);
        return { director, status: 200, success: true };
      }
    } catch (error) {
      logError(error, 'updateDirector');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode, success: false };
    }
    return {
      director: undefined,
      status: 400,
      success: false,
    };
  }
  static async deleteDirector(
    id: string
  ): Promise<{ status: number; success: boolean }> {
    try {
      await prisma.directorSection.delete({
        where: {
          id,
        },
      });
      revalidatePath(URL_DASHBOARD_ROUTE.director);
      return { status: 200, success: true };
    } catch (error) {
      logError(error, 'deleteDirector');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode, success: false };
    }
  }
}
