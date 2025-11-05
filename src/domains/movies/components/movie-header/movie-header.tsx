'use client';
import { Locale } from '@/config';
import { DownloadLogo } from '@/domains/ui/components/icons/icons';
import { IGenre, IMovie } from '@/models/movie/movie';
import countriesList from '@/shared/constants/countries';
import { languagesList } from '@/shared/constants/lang';
import { minutesToHours } from '@/shared/utils/number/minutesToHours';
import displayGenreTranslated from '@/shared/utils/string/displayGenreTranslated';
import { titleOnlocale } from '@/shared/utils/string/titleOnlocale';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import useGetDetailsMovie from '../../hooks/use-get-details-movie';

const MoviePageSubtitlesList = dynamic(
  () => import('../movie-page_subtitles-list/movie-page_subtitles-list'),
  { ssr: false }
);

const MovieHeader = ({ movie }: { movie: IMovie }) => {
  const t = useTranslations('MoviePage');
  const locale = useLocale() as Locale;
  const { data: movieDetails } = useGetDetailsMovie({
    id: movie?.imdbId ?? '',
    language: locale,
  });
  const genresMovie =
    movie && movie?.genresIds && movie?.genresIds?.length > 0
      ? movie?.genresIds.map((item) => item.genre).flat()
      : ([] as IGenre[]);

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
            {t('duration')}: {minutesToHours(movie?.duration)}
          </span>
        )}
        {movie?.language && (
          <span>
            {t('langage')}: {language?.[0]?.label?.[locale]}
          </span>
        )}
      </div>

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
      {movie && (
        <>
          {' '}
          <a
            href={`https://drive.usercontent.google.com/download?id=${movie?.idGoogleDive}&export=download`}
            className="inline-flex gap-2 rounded-md p-3 h-10 min-w-16 px-4 py-2 bg-primary text-background  font-bold hover:bg-primary hover:text-green-700"
            target="_blank"
            download
          >
            {<DownloadLogo />}
            {t('download')}
          </a>
          <MoviePageSubtitlesList movie={movie} />
        </>
      )}
    </div>
  );
};

export default MovieHeader;
