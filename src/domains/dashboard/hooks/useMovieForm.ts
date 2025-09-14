import { logError } from '@/lib/errors';
import { IMovie } from '@/models/movie/movie';
import { URL_DASHBOARD_ROUTE } from '@/shared/route';
import { FormDataMovieSchema, MovieSchema } from '@/shared/schema/movieSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from 'next-auth';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { addMovieToDb, editMovieToDb } from '../actions/movie';
import { useMovieData } from './useMovieData';

interface UseMovieFormProps {
  movie?: IMovie;
  editMovie: boolean;
  idFromGoogleDrive?: string;
  user: User;
}

interface UseMovieFormReturn {
  form: UseFormReturn<MovieSchema>;
  handleMovieSubmission: (e?: React.BaseSyntheticEvent) => Promise<void>; // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  subtitles: string[];
  handleCheckboxChange: (value: string) => void; // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  handleLangageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  handleCountryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
}

export const useMovieForm = ({
  movie,
  editMovie,
  idFromGoogleDrive,
  user,
}: UseMovieFormProps): UseMovieFormReturn => {
  const t = useTranslations('AddMovie');
  const router = useRouter();
  const { getDefaultValues, transformFormData } = useMovieData({ editMovie });

  const form = useForm<MovieSchema>({
    defaultValues: getDefaultValues(movie, idFromGoogleDrive),
    resolver: zodResolver(FormDataMovieSchema),
  });

  const { setValue, watch, handleSubmit } = form;

  const subtitles = watch('subtitles', []);

  const handleMovieSubmission = useCallback(
    async (data: MovieSchema) => {
      try {
        const transformedData = transformFormData(data);

        const { status } = editMovie
          ? await editMovieToDb(transformedData as unknown as IMovie, user)
          : await addMovieToDb(transformedData as unknown as IMovie, user);

        if (status === 200) {
          toast.success(t('toastMovieMessageSuccess'), {
            position: 'top-center',
          });
          router.push(URL_DASHBOARD_ROUTE.movie);
          return;
        }
        return toast.error(t('toastMovieMessageError'), {
          position: 'top-center',
        });
      } catch (err) {
        logError(err, editMovie ? 'editMovie' : 'createMovie');
        toast.error(t('toastMovieMessageError'), {
          position: 'top-center',
        });
      }
    },
    [editMovie, transformFormData, user, t, router]
  );

  const handleCheckboxChange = useCallback(
    (value: string) => {
      const newValue = subtitles.includes(value)
        ? subtitles.filter((item) => item !== value)
        : [...subtitles, value];

      setValue('subtitles', newValue);
    },
    [subtitles, setValue]
  );

  const handleCountryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setValue('country', e.target.value);
    },
    [setValue]
  );

  const handleLangageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setValue('langage', e.target.value);
    },
    [setValue]
  );

  return {
    form,
    handleMovieSubmission: handleSubmit(handleMovieSubmission),
    subtitles,
    handleCheckboxChange,
    handleCountryChange,
    handleLangageChange,
  };
};
