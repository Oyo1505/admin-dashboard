import { useTranslations } from 'next-intl';

const BUTTON_CLASS =
  'border-2 border-primary text-primary p-2 rounded-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';

interface IMovieTablePagination {
  page: number;
  totalPages: number;
  isPlaceholderData: boolean;
  onPageChange: (page: number) => void; // eslint-disable-line no-unused-vars
}

const MovieTablePagination = ({
  page,
  totalPages,
  isPlaceholderData,
  onPageChange,
}: IMovieTablePagination) => {
  const t = useTranslations('Dashboard');
  const isLastPage = page >= totalPages - 1;

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={t('paginationLabel')}
      className="flex items-center justify-center gap-4 text-primary"
    >
      <button
        type="button"
        onClick={() => onPageChange(Math.max(page - 1, 0))}
        disabled={page === 0}
        className={BUTTON_CLASS}
      >
        {t('previousPage')}
      </button>
      <p className="text-sm">
        {t('pageIndicator', { page: page + 1, totalPages })}
      </p>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={isPlaceholderData || isLastPage}
        className={BUTTON_CLASS}
      >
        {t('nextPage')}
      </button>
    </nav>
  );
};

export default MovieTablePagination;
