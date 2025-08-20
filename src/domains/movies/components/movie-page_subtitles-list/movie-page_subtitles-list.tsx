import { IMovie } from '@/models/movie/movie';
import { useLocale, useTranslations } from 'next-intl';

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
        <ul>
          <li>
            <a
              href={`https://www.opensubtitles.org/${locale === 'fr' ? 'fr' : 'en'}/search/sublanguageid-all/moviename-${titleCompute(movie?.title)}`}
              target="_blank"
              rel="noreferrer"
            >
              - OpenSubtitles
            </a>
          </li>
          <li>
            <a
              href={`https://subdl.org/search/?srcname=${titleCompute(movie?.titleEnglish)}`}
              target="_blank"
              rel="noreferrer"
            >
              - Subdl.org
            </a>
          </li>
          {movie?.imdbId && (
            <li>
              <a
                href={`https://yifysubtitles.ch/movie-imdb/${movie?.imdbId}`}
                target="_blank"
                rel="noreferrer"
              >
                - Yifi Subtitles
              </a>
            </li>
          )}
          <li>
            <a
              href={`https://www.subtitlecat.com/index.php?search=${movie?.titleEnglish?.replaceAll(' ', '+')?.toLocaleLowerCase()}`}
              target="_blank"
              rel="noreferrer"
            >
              - SubtitleCat
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MoviePageSubtitlesList;
