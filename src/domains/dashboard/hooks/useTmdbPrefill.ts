import { ITmdbPrefillData } from '@/models/movie/tmdb';
import HttpStatus from '@/shared/constants/httpStatus';
import { MovieSchema } from '@/shared/schema/movieSchema';
import { useMutation } from '@tanstack/react-query';
import { UseFormReturn } from 'react-hook-form';
import { TmdbPrefillService } from '../services/tmdb-prefill.service';

export type TmdbPrefillStatus =
  'idle' | 'loading' | 'success' | 'notFound' | 'error';

class TmdbNotFoundError extends Error {}

const fetchPrefill = async (imdbId: string): Promise<ITmdbPrefillData> => {
  const response = await fetch(
    `/api/tmdb/prefill/${encodeURIComponent(imdbId.trim())}`
  );
  if (response.status === HttpStatus.NOT_FOUND) throw new TmdbNotFoundError();
  if (!response.ok) throw new Error('Failed to prefill movie');
  return response.json();
};

/**
 * Prefills empty movie form fields from TMDB using the IMDb id.
 * "year" defaults to the current year, so it stays overridable until edited.
 */
export const useTmdbPrefill = (form: UseFormReturn<MovieSchema>) => {
  const { getValues, getFieldState, setValue } = form;

  const mutation = useMutation({
    mutationFn: fetchPrefill,
    onSuccess: (prefill) => {
      const overridable = getFieldState('year').isDirty
        ? []
        : ['year' as const];
      const fieldsToFill = TmdbPrefillService.pickFieldsToFill(
        getValues(),
        prefill,
        overridable
      );
      Object.entries(fieldsToFill).forEach(([key, value]) => {
        setValue(key as keyof ITmdbPrefillData, value, {
          shouldDirty: true,
          shouldValidate: true,
        });
      });
    },
  });

  const getStatus = (): TmdbPrefillStatus => {
    if (mutation.isPending) return 'loading';
    if (mutation.isSuccess) return 'success';
    if (mutation.error instanceof TmdbNotFoundError) return 'notFound';
    if (mutation.isError) return 'error';
    return 'idle';
  };

  return {
    prefill: (imdbId: string) => mutation.mutate(imdbId),
    status: getStatus(),
  };
};
