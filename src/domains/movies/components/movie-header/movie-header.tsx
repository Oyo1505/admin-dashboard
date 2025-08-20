'use client';
import { Locale } from '@/config';
import { IGenre, IMovie } from '@/models/movie/movie';
import countriesList from '@/shared/constants/countries';
import { languagesList } from '@/shared/constants/lang';
import displayGenreTranslated from '@/shared/utils/string/displayGenreTranslated';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { heuresEnMinutes } from 'utilities/number/minutesToHours';
import { titleOnlocale } from 'utilities/string/titleOnlocale';
import useGetDetailsMovie from '../../hooks/useGetDetailsMovie';
import MoviePageSubtitlesList from '../movie-page_subtitles-list/movie-page_subtitles-list';

interface MovieHeaderProps {
  movie?: IMovie | null;
  isFavorite: boolean;
}

const MovieHeader = ({ movie }: MovieHeaderProps) => {
  const t = useTranslations('MoviePage');
  const locale = useLocale() as Locale;
  const { data: movieDetails } = useGetDetailsMovie({
    id: movie?.imdbId ?? '',
    language: locale,
  });
  const [genresMovie] = useState<IGenre[]>(
    movie && movie?.genresIds && movie?.genresIds?.length > 0
      ? movie?.genresIds.map((item) => item.genre).flat()
      : ([] as IGenre[])
  );

  const synopsis = movieDetails?.movie_results?.[0]?.overview;

  const displaySubtitles = (value: string) => {
    switch (value) {
      case 'FR':
        return t('subtitlesFR');
      case 'JP':
        return t('subtitlesJP');
      case 'EN':
        return t('subtitlesEN');
      default:
        return null;
    }
  };
  const findCountry = countriesList?.filter(
    (item) => item?.value === movie?.country
  );
  const language = languagesList?.filter(
    (item) => item?.value === movie?.language
  );

  return (
    <div className="w-full lg:w-1/2 mt-4 md:mt-0">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">
          {movie && titleOnlocale(movie, locale)}
        </h1>
        {movie?.originalTitle && (
          <div className="mt-2 mb-2 font-normal italic">
            {' '}
            {t('originalTitle')}: {movie?.originalTitle}
          </div>
        )}
        {movie?.director && (
          <div className="mt-2 mb-2  font-bold">
            {' '}
            {t('director')}: {movie?.director}
          </div>
        )}
      </div>
      <div className="mb-4 flex flex-col gap-2">
        {movie?.year && (
          <div className="inline">
            {t('release')}: {movie?.year}
          </div>
        )}
        {genresMovie && genresMovie.length > 0 && (
          <div className="inline">
            {t('genre')}:{' '}
            {genresMovie?.map((item) => (
              <span className="mr-1" key={item.id}>
                {displayGenreTranslated(item, locale)}
              </span>
            ))}
          </div>
        )}
        {movie?.country && (
          <div className="inline">
            {t('country')}: {findCountry?.[0]?.label?.[locale]}
          </div>
        )}
        {movie?.duration && movie?.duration > 0 && (
          <span>
            {t('duration')}: {heuresEnMinutes(movie?.duration)}
          </span>
        )}
        {movie?.language && (
          <span>
            {t('langage')}: {language?.[0]?.label?.[locale]}
          </span>
        )}
      </div>

      {movie?.tags && (
        <div>
          {movie?.tags?.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
      {movie?.subtitles && movie?.subtitles?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {t('subtitles')}:{' '}
          {movie?.subtitles?.map((item) => (
            <span key={item}>{displaySubtitles(item)}</span>
          ))}
        </div>
      )}
      {synopsis ? (
        <div className="mt-6 font-normal">
          {' '}
          {t('synopsis')} : {synopsis}
        </div>
      ) : (
        movie?.synopsis && (
          <div className="mt-6 font-normal">
            {' '}
            {t('synopsis')} : {movie?.synopsis}
          </div>
        )
      )}
      {movie && <MoviePageSubtitlesList movie={movie} />}
    </div>
  );
};

export default MovieHeader;
