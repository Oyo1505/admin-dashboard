'use server';

import { verifySession, withAuth } from '@/lib/data/dal';
import { MovieService } from '../services/movie.service';

/**
 * Server Action to increment the download count for a movie
 * @param movieId - The ID of the movie
 */
export const incrementDownloadCount = withAuth(
  verifySession,
  async (movieId: string): Promise<void> => {
    await MovieService.incrementDownloadCount(movieId);
  }
);

/**
 * Server Action to increment the watch count for a movie
 * @param movieId - The ID of the movie
 */
export const incrementWatchCount = withAuth(
  verifySession,
  async (movieId: string): Promise<void> => {
    await MovieService.incrementWatchCount(movieId);
  }
);
