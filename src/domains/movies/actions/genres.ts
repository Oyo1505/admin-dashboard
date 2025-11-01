'use server';

import { verifyAdmin } from '@/lib/data/dal/core/auth';
import { withAuth } from '@/lib/data/dal/helpers';
import { IGenre } from '@/models/movie/movie';
import { GenreService } from '../services';

export const addGenre = withAuth(
  verifyAdmin,
  async (
    genre: IGenre
  ): Promise<{ status: number; genre?: IGenre; message?: string }> => {
    return await GenreService.addGenre(genre);
  }
);

export const updateGenre = withAuth(
  verifyAdmin,
  async (
    genre: IGenre
  ): Promise<{ status: number; genre?: IGenre; message?: string }> => {
    return await GenreService.updateGenre(genre);
  }
);

export const deleteGenre = withAuth(
  verifyAdmin,
  async (
    id: string
  ): Promise<{
    status: number;
    genre?: IGenre | undefined;
    message?: string;
  }> => {
    return await GenreService.deleteGenre(id);
  }
);
