import { Button } from '@/domains/ui/components/button/button';
import { useTranslations } from 'next-intl';
import { TmdbPrefillStatus } from '../../hooks/useTmdbPrefill';
import { TmdbPrefillService } from '../../services/tmdb-prefill.service';

const STATUS_MESSAGE_KEYS: Record<TmdbPrefillStatus, string | null> = {
  idle: null,
  loading: 'prefillLoading',
  success: 'prefillSuccess',
  notFound: 'prefillNotFound',
  error: 'prefillError',
};

interface IFormMovieImdbPrefill {
  imdbId?: string;
  status: TmdbPrefillStatus;
  onPrefill: (imdbId: string) => void;
}

const FormMovieImdbPrefill = ({
  imdbId,
  status,
  onPrefill,
}: IFormMovieImdbPrefill) => {
  const t = useTranslations('AddMovie');
  const isLoading = status === 'loading';
  const isDisabled = isLoading || !TmdbPrefillService.isValidImdbId(imdbId);
  const messageKey = STATUS_MESSAGE_KEYS[status];
  const isFailure = status === 'error' || status === 'notFound';

  return (
    <div className="mb-[15px] flex flex-col gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="self-start border-gray-800 bg-white text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-900"
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-describedby="imdb-prefill-hint"
        onClick={() => imdbId && onPrefill(imdbId)}
      >
        {t('prefillButton')}
      </Button>
      <p id="imdb-prefill-hint" className="text-xs text-gray-700">
        {t('prefillHint')}
      </p>
      <p
        role="status"
        aria-live="polite"
        className={
          isFailure ? 'text-xs text-red-700' : 'text-xs text-green-800'
        }
      >
        {messageKey ? t(messageKey) : ''}
      </p>
    </div>
  );
};

export default FormMovieImdbPrefill;
