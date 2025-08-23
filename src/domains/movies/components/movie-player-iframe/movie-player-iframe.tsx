'use client';
import Iframe from 'react-iframe';
import { useSession } from 'next-auth/react';
import { IMovie } from '@/models/movie/movie';
import { updateAnalyticsLastMovieWatched } from '@/domains/auth/actions/action.analytics';

const MoviePlayerIframe = ({ movie }: { movie: IMovie }) => {
  const { data: session } = useSession();

  return (
    <Iframe
      url={`https://drive.google.com/file/d/${movie?.idGoogleDive}/preview`}
      className="w-full md:h-[400px] lg:w-full h-[250px] lg:h-[450px]"
      width="auto"
      title={movie?.title}
      height="450px"
      loading="eager"
      importance="high"
      ariaLabel="video player"
      onLoad={() => {
        if (session?.user?.id)
          updateAnalyticsLastMovieWatched(session.user.id, movie.title);
      }}
    />
  );
};

export default MoviePlayerIframe;
