import { IMovie } from '@/models/movie/movie';
import { useLocale, useTranslations } from 'next-intl';
import MovieHeaderSubtitleLink from '../movie-header_subtitle-link/movie-header_subtitle-link';

const MoviePageSubtitlesList = ({ movie }: { movie: IMovie }) => {
  const locale = useLocale();
  const t = useTranslations('MoviePage');
  const titleCompute = (title: string | undefined | null) => {
    return title?.replaceAll(' ', '+')?.toLocaleLowerCase();
  };
  return (
    <div className="font-normal flex flex-col gap-3">
      <div className="flex flex-col gap-2 mt-4">
        <h4 className="font-bold">{t('subtitles')}</h4>
        <ul className="list-none flex gap-4 flex-wrap flex-col md:flex-row md:gap-2">
          <MovieHeaderSubtitleLink
            link={`https://www.opensubtitles.org/${locale === 'fr' ? 'fr' : 'en'}/search/sublanguageid-all/moviename-${titleCompute(movie?.title)}`}
            subtitleWebSite={'OpenSubtitles'}
          />
          <MovieHeaderSubtitleLink
            link={`https://subdl.org/search/?srcname=${titleCompute(movie?.titleEnglish)}`}
            subtitleWebSite={'Subdl.org'}
          />
          {movie?.imdbId && (
            <MovieHeaderSubtitleLink
              link={`https://yifysubtitles.ch/movie-imdb/${movie?.imdbId}`}
              subtitleWebSite={'Yifi Subtitles'}
            />
          )}
          <MovieHeaderSubtitleLink
            link={`https://www.subtitlecat.com/index.php?search=${movie?.titleEnglish?.replaceAll(' ', '+')?.toLocaleLowerCase()}`}
            subtitleWebSite={'SubtitleCat'}
          />
        </ul>
      </div>
    </div>
  );
};

export default MoviePageSubtitlesList;
