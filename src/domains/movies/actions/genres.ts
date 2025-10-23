'use server';
import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { IGenre } from '@/models/movie/movie';
import { URL_DASHBOARD_ROUTE } from '@/shared/route';
import { revalidatePath } from 'next/cache';

export const addGenre = async (
  genre: IGenre
): Promise<{ status: number; genre?: IGenre }> => {
  try {
    const createdGenre = await prisma.genre.create({
      data: genre,
    });
    if (!createdGenre) {
      return { status: 404 };
    }
    revalidatePath(URL_DASHBOARD_ROUTE.genre);
    return { status: 200, genre: createdGenre };
  } catch (error) {
    logError(error, 'addGenre');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const updateGenre = async (
  genre: IGenre
): Promise<{ status: number; genre?: IGenre }> => {
  try {
    const updatedGenre = await prisma.genre.update({
      where: {
        id: genre.id,
      },
      data: genre,
    });
    if (!updatedGenre) {
      return { status: 404 };
    }
    revalidatePath(URL_DASHBOARD_ROUTE.genre);
    return { status: 200, genre: updatedGenre };
  } catch (error) {
    logError(error, 'updateGenre');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const deleteGenre = async (
  id: string
): Promise<{ status: number; genre?: IGenre | undefined }> => {
  try {
    const deletedGenre = await prisma.genre.delete({
      where: {
        id: id,
      },
    });
    if (!deletedGenre) {
      return { status: 404 };
    }
    revalidatePath(URL_DASHBOARD_ROUTE.genre);
    return { status: 200, genre: deletedGenre };
  } catch (error) {
    logError(error, 'deleteGenre');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};
