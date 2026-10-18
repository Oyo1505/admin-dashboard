import {
  MOVIE_PUBLISH_FILTERS,
  MoviePublishFilter,
} from '@/models/movie/movie-filters';
import { MAX_SEARCH_LENGTH } from '@/shared/constants/pagination';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

const FILTER_LABEL_KEYS: Record<MoviePublishFilter, string> = {
  all: 'filterAll',
  published: 'filterPublished',
  unpublished: 'filterUnpublished',
};

const FIELD_CLASS =
  'h-10 rounded-md border border-primary bg-primary px-3 text-sm text-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';

interface IMovieTableToolbar {
  search: string;
  publish: MoviePublishFilter;
  total?: number;
  isFetching: boolean;
  onSearchChange: (search: string) => void;
  onPublishChange: (publish: MoviePublishFilter) => void;
}

const MovieTableToolbar = ({
  search,
  publish,
  total,
  isFetching,
  onSearchChange,
  onPublishChange,
}: IMovieTableToolbar) => {
  const t = useTranslations('Dashboard');

  return (
    <div
      role="search"
      className="flex flex-col gap-3 text-primary sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="movie-search" className="text-sm font-bold">
          {t('searchLabel')}
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-background"
          />
          <input
            id="movie-search"
            type="search"
            value={search}
            maxLength={MAX_SEARCH_LENGTH}
            placeholder={t('searchPlaceholder')}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`${FIELD_CLASS} w-full pl-9 placeholder:text-gray-600`}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="movie-publish-filter" className="text-sm font-bold">
          {t('publishFilterLabel')}
        </label>
        <select
          id="movie-publish-filter"
          value={publish}
          onChange={(e) =>
            onPublishChange(e.target.value as MoviePublishFilter)
          }
          className={FIELD_CLASS}
        >
          {MOVIE_PUBLISH_FILTERS.map((filter) => (
            <option key={filter} value={filter}>
              {t(FILTER_LABEL_KEYS[filter])}
            </option>
          ))}
        </select>
      </div>
      <p
        role="status"
        aria-live="polite"
        className="min-w-28 text-sm sm:pb-2.5"
      >
        {isFetching || total === undefined
          ? t('loading')
          : t('resultsCount', { count: total })}
      </p>
    </div>
  );
};

export default MovieTableToolbar;
