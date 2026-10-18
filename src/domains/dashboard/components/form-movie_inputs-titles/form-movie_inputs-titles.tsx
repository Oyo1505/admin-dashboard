import FormTextInput from '@/domains/shared/components/form-text-input/form-text-input';
import { MovieSchema } from '@/shared/schema/movieSchema';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

export interface IFormMovieInputsTitles {
  errors?: FieldErrors<MovieSchema>;
  register: UseFormRegister<MovieSchema>;
  /** Rendered right after the IMDb id input */
  imdbPrefill?: ReactNode;
}

const FormMovieInputsTitles = ({
  errors,
  register,
  imdbPrefill,
}: IFormMovieInputsTitles) => {
  const t = useTranslations('AddMovie');
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="sr-only">{t('titleSection')}</legend>
      <FormTextInput<MovieSchema>
        textTranslated={t('titleMovie')}
        htmlFor="title"
        keyValue="title"
        errors={errors}
        {...register('title')}
      />
      <FormTextInput<MovieSchema>
        textTranslated={t('originalTitle')}
        htmlFor="originalTitle"
        keyValue="originalTitle"
        errors={errors}
        {...register('originalTitle')}
      />
      <FormTextInput<MovieSchema>
        textTranslated={t('titleJapanese')}
        htmlFor="titleJapanese"
        keyValue="titleJapanese"
        errors={errors}
        {...register('titleJapanese')}
      />
      <FormTextInput<MovieSchema>
        textTranslated={t('titleEnglish')}
        htmlFor="titleEnglish"
        keyValue="titleEnglish"
        errors={errors}
        {...register('titleEnglish')}
      />
      <FormTextInput<MovieSchema>
        textTranslated={t('director')}
        htmlFor="director"
        keyValue="director"
        errors={errors}
        {...register('director')}
      />
      <FormTextInput<MovieSchema>
        textTranslated={t('link')}
        htmlFor="link"
        keyValue="link"
        errors={errors}
        {...register('link')}
      />
      <FormTextInput<MovieSchema>
        textTranslated={t('imdbId')}
        htmlFor="imdbId"
        keyValue="imdbId"
        errors={errors}
        {...register('imdbId')}
      />
      {imdbPrefill}
      <FormTextInput<MovieSchema>
        textTranslated={t('idGoogleDive')}
        htmlFor="idGoogleDive"
        keyValue="idGoogleDive"
        errors={errors}
        {...register('idGoogleDive')}
      />
    </fieldset>
  );
};

export default FormMovieInputsTitles;
