'use server';
import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { IDirector } from '@/models/director/director';
import { revalidatePath } from 'next/cache';

export const createDirectorFromSection = async (
  formDirector: IDirector
): Promise<{ director?: IDirector; status: number; success: boolean }> => {
  try {
    const director = await prisma.directorSection.create({
      data: {
        director: formDirector.director,
        imageBackdrop: formDirector.imageBackdrop,
      },
    });
    revalidatePath('dashboard/director');
    return { director, status: 200, success: true };
  } catch (error) {
    logError(error, 'createDirectorFromSection');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode, success: false };
  }
};

export const updateDirectorFromSection = async (
  formDirector: IDirector
): Promise<{ director?: IDirector; status: number; success: boolean }> => {
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
      revalidatePath('dashboard/director');
      return { director, status: 200, success: true };
    }
  } catch (error) {
    logError(error, 'deleteMovieById');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode, success: false };
  }
  return {
    director: undefined,
    status: 400,
    success: false,
  };
};

export const deleteDirectorFromSection = async (
  id: string
): Promise<{ status: number; success: boolean }> => {
  try {
    await prisma.directorSection.delete({
      where: {
        id,
      },
    });
    revalidatePath('dashboard/director');
    return { status: 200, success: true };
  } catch (error) {
    logError(error, 'updateDirectorFromSection');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode, success: false };
  }
};
