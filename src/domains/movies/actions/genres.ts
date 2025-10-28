'use server';
import { IGenre } from '@/models/movie/movie';
import { GenreService } from '../services';

export const addGenre = async (
  genre: IGenre
): Promise<{ status: number; genre?: IGenre }> => {
  return await GenreService.addGenre(genre);
};

export const updateGenre = async (
  genre: IGenre
): Promise<{ status: number; genre?: IGenre }> => {
  return await GenreService.updateGenre(genre);
};

export const deleteGenre = async (
  id: string
): Promise<{ status: number; genre?: IGenre | undefined }> => {
  return await GenreService.deleteGenre(id);
};
