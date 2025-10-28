'use server';
import { IDirector } from '@/models/director/director';
import { DirectorService } from '../services';

export const createDirectorFromSection = async (
  formDirector: IDirector
): Promise<{ director?: IDirector; status: number; success: boolean }> => {
  return await DirectorService.createDirector(formDirector);
};

export const updateDirectorFromSection = async (
  formDirector: IDirector
): Promise<{ director?: IDirector; status: number; success: boolean }> => {
  return await DirectorService.updateDirector(formDirector);
};

export const deleteDirectorFromSection = async (
  id: string
): Promise<{ status: number; success: boolean }> => {
  return await DirectorService.deleteDirector(id);
};
