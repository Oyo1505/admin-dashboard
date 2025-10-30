import { DirectorData } from '@/lib/data/director';
import { handlePrismaError, logError } from '@/lib/errors';
import { IDirector } from '@/models/director/director';
import { URL_DASHBOARD_ROUTE } from '@/shared/route';
import { revalidatePath } from 'next/cache';

export class DirectorService {
  static async createDirector(
    formDirector: IDirector
  ): Promise<{ director?: IDirector; status: number; success: boolean }> {
    try {
      const { director, status, success } =
        await DirectorData.create(formDirector);
      revalidatePath(URL_DASHBOARD_ROUTE.director);
      return { director, status, success };
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
      const { director, status, success } =
        await DirectorData.update(formDirector);
      return { director, status, success };
    } catch (error) {
      logError(error, 'updateDirector');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode, success: false };
    }
  }
  static async deleteDirector(
    id: string
  ): Promise<{ status: number; success: boolean }> {
    try {
      const { status, success } = await DirectorData.delete(id);
      revalidatePath(URL_DASHBOARD_ROUTE.director);
      return { status, success };
    } catch (error) {
      logError(error, 'deleteDirector');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode, success: false };
    }
  }
}
