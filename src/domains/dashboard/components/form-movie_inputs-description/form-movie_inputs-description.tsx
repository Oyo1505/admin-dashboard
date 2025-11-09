import FormTextInput from '@/domains/shared/components/form-text-input/form-text-input';
import FormTextAreaInput from '@/domains/shared/components/form-textarea-input/form-textarea-input';
import { IMovieFormData } from '@/models/movie/movie';
import { useTranslations } from 'next-intl';
import { UseFormRegister } from 'react-hook-form';

const FormMovieInputsDescription = ({
  register,
}: {
  register: UseFormRegister<IMovieFormData>;
}) => {
  const t = useTranslations('AddMovie');
  return (
    <>
      <FormTextInput
        textTranslated={t('trailer')}
        htmlFor="trailer"
        keyValue="trailer"
        {...register('trailer')}
      />
      <FormTextAreaInput
        htmlFor={'synopsis'}
        titleLabel={'synopsis'}
        {...register('synopsis')}
      />
      <FormTextInput
        textTranslated={t('idGoogleDive')}
        htmlFor="idGoogleDive"
        keyValue="idGoogleDive"
        {...register('idGoogleDive')}
      />
    </>
  );
};

export default FormMovieInputsDescription;
