'use server';

import { verifyAdmin } from '@/lib/data/dal/core/auth';
import { withAuth } from '@/lib/data/dal/helpers';
import { IDirector } from '@/models/director/director';
import { DirectorService } from '../services';

export const createDirectorFromSection = withAuth(
  verifyAdmin,
  async (
    formDirector: IDirector
  ): Promise<{
    director?: IDirector;
    status: number;
    success?: boolean;
    message?: string;
  }> => {
    return await DirectorService.createDirector(formDirector);
  }
);

export const updateDirectorFromSection = withAuth(
  verifyAdmin,
  async (
    formDirector: IDirector
  ): Promise<{
    director?: IDirector;
    status: number;
    success?: boolean;
    message?: string;
  }> => {
    return await DirectorService.updateDirector(formDirector);
  }
);

export const deleteDirectorFromSection = withAuth(
  verifyAdmin,
  async (
    id: string
  ): Promise<{
    status: number;
    success?: boolean;
    message?: string;
  }> => {
    return await DirectorService.deleteDirector(id);
  }
);
