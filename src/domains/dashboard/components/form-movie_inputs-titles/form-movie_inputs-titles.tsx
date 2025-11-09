import FormTextInput from '@/domains/shared/components/form-text-input/form-text-input';
import { IMovieFormData } from '@/models/movie/movie';
import { useTranslations } from 'next-intl';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

export interface IFormMovieInputsTitles {
  errors?: FieldErrors<IMovieFormData>;
  register: UseFormRegister<IMovieFormData>;
}

const FormMovieInputsTitles = ({
  errors,
  register,
}: IFormMovieInputsTitles) => {
  const t = useTranslations('AddMovie');
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="sr-only">{t('titleSection')}</legend>
      <FormTextInput<IMovieFormData>
        textTranslated={t('titleMovie')}
        htmlFor="title"
        keyValue="title"
        errors={errors}
        {...register('title')}
      />
      <FormTextInput<IMovieFormData>
        textTranslated={t('originalTitle')}
        htmlFor="originalTitle"
        keyValue="originalTitle"
        errors={errors}
        {...register('originalTitle')}
      />
      <FormTextInput<IMovieFormData>
        textTranslated={t('titleJapanese')}
        htmlFor="titleJapanese"
        keyValue="titleJapanese"
        errors={errors}
        {...register('titleJapanese')}
      />
      <FormTextInput<IMovieFormData>
        textTranslated={t('titleEnglish')}
        htmlFor="titleEnglish"
        keyValue="titleEnglish"
        errors={errors}
        {...register('titleEnglish')}
      />
      <FormTextInput<IMovieFormData>
        textTranslated={t('director')}
        htmlFor="director"
        keyValue="director"
        errors={errors}
        {...register('director')}
      />
      <FormTextInput<IMovieFormData>
        textTranslated={t('link')}
        htmlFor="link"
        keyValue="link"
        errors={errors}
        {...register('link')}
      />
      <FormTextInput<IMovieFormData>
        textTranslated={t('imdbId')}
        htmlFor="imdbId"
        keyValue="imdbId"
        errors={errors}
        {...register('imdbId')}
      />
    </fieldset>
  );
};

export default FormMovieInputsTitles;
