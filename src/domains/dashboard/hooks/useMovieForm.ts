import { logError } from '@/lib/errors';
import { IMovie, IMovieFormData, IUpdateMovieData } from '@/models/movie/movie';
import { URL_DASHBOARD_ROUTE } from '@/shared/route';
import { FormDataMovieSchema, MovieSchema } from '@/shared/schema/movieSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { UseFormReturn, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { addMovieToDb, editMovieToDb } from '../actions/movie';
import { useMovieData } from './useMovieData';

interface UseMovieFormProps {
  movie?: IMovie;
  editMovie: boolean;
  idFromGoogleDrive?: string;
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

  const handleMovieSubmission = async (data: MovieSchema) => {
    try {
      const transformedData = transformFormData(data);

      const { status } = editMovie
        ? await editMovieToDb(transformedData as IUpdateMovieData)
        : await addMovieToDb(transformedData as IMovieFormData);

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
  };

  const handleCheckboxChange = (value: string) => {
    const newValue = subtitles.includes(value)
      ? subtitles.filter((item) => item !== value)
      : [...subtitles, value];

    setValue('subtitles', newValue);
  };
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('country', e.target.value);
  };

  const handleLangageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('langage', e.target.value);
  };

  return {
    form,
    handleMovieSubmission: handleSubmit(handleMovieSubmission),
    subtitles,
    handleCheckboxChange,
    handleCountryChange,
    handleLangageChange,
  };
};
