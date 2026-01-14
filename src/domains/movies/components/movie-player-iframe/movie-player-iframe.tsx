'use client';
import { updateAnalyticsLastMovieWatched } from '@/domains/auth/actions/action.analytics';
import { useSession } from '@/lib/auth-client';
import { isValidIframeUrl, sanitizeGoogleDriveUrl } from '@/lib/security';
import { IMovie } from '@/models/movie/movie';
import { useState } from 'react';

import Iframe from 'react-iframe';

const MoviePlayerIframe = ({ movie }: { movie: IMovie }) => {
  const { data: session } = useSession();
  const iframeUrl = sanitizeGoogleDriveUrl(movie?.idGoogleDive || '');
  const [hasTracked, setHasTracked] = useState(false);
  if (!isValidIframeUrl(iframeUrl)) {
    return (
      <div className="w-full md:h-[400px] lg:w-full h-[250px] lg:h-[450px] flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-600">Vidéo non disponible</p>
      </div>
    );
  }

  return (
    <Iframe
      url={iframeUrl}
      className="w-full md:h-100 lg:w-full h-62.5 lg:h-112.5 "
      width="auto"
      title={movie?.title}
      height="450px"
      loading="eager"
      importance="high"
      ariaLabel="video player"
      onLoad={() => {
        if (session?.user?.id && !hasTracked) {
          setHasTracked(true);
          updateAnalyticsLastMovieWatched(session.user.id, movie.title);
        }
      }}
    />
  );
};

export default MoviePlayerIframe;
