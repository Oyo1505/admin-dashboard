import { GenreData } from '@/lib/data/genres';
import { handlePrismaError, logError } from '@/lib/errors';
import { IGenre } from '@/models/movie/movie';
import HttpStatus from '@/shared/constants/httpStatus';
import { URL_DASHBOARD_ROUTE } from '@/shared/route';
import { revalidatePath } from 'next/cache';

export class GenreService {
  static async deleteGenre(
    id: string
  ): Promise<{ status: number; genre?: IGenre | undefined }> {
    try {
      const { deletedGenre } = await GenreData.delete(id);
      if (!deletedGenre) {
        return { status: HttpStatus.NOT_FOUND };
      }
      revalidatePath(URL_DASHBOARD_ROUTE.genre);
      return { status: HttpStatus.OK, genre: deletedGenre };
    } catch (error) {
      logError(error, 'deleteGenre');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }

  static async updateGenre(
    genre: IGenre
  ): Promise<{ status: number; genre?: IGenre }> {
    try {
      const { updatedGenre } = await GenreData.update(genre);
      if (!updatedGenre) {
        return { status: HttpStatus.NOT_FOUND };
      }
      revalidatePath(URL_DASHBOARD_ROUTE.genre);
      return { status: HttpStatus.OK, genre: updatedGenre };
    } catch (error) {
      logError(error, 'updateGenre');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }

  static async addGenre(
    genre: IGenre
  ): Promise<{ status: number; genre?: IGenre }> {
    try {
      const { createdGenre } = await GenreData.create(genre);
      if (!genre) {
        return { status: HttpStatus.NOT_FOUND };
      }
      revalidatePath(URL_DASHBOARD_ROUTE.genre);
      return { status: HttpStatus.OK, genre: createdGenre };
    } catch (error) {
      logError(error, 'addGenre');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
}
