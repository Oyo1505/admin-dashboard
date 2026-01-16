'use client';

import { useEffect, useRef } from 'react';
import { incrementWatchCount } from '../../actions/movie-stats.action';

export function WatchTracker({ movieId }: { movieId: string }) {
  const lastTrackedMovieId = useRef<string | null>(null);

  useEffect(() => {
    if (lastTrackedMovieId.current !== movieId) {
      lastTrackedMovieId.current = movieId;
      incrementWatchCount(movieId);
    }
  }, [movieId]);

  return null;
}
