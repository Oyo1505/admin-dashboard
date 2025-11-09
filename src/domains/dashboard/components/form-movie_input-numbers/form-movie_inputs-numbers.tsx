import FormNumberInput from '@/domains/shared/components/form-number-input/form-number-input';
import { IMovieFormData } from '@/models/movie/movie';
import { useTranslations } from 'next-intl';
import { UseFormRegister } from 'react-hook-form';

const FormMovieInputsNumbers = ({
  register,
}: {
  register: UseFormRegister<IMovieFormData>;
}) => {
  const t = useTranslations('AddMovie');
  return (
    <div className="grid grid-cols-3 gap-3">
      <FormNumberInput
        htmlFor="year"
        titleLabel={t('year')}
        step="1"
        {...register('year', {
          required: "L'année est requis",
          min: {
            value: 1890,
            message: "L'année doit être supérieure à 1890",
          },
          max: {
            value: new Date().getFullYear(),
            message: "L'année ne peut pas être dans le futur",
          },
          valueAsNumber: true,
        })}
      />
      <FormNumberInput
        htmlFor="duration"
        titleLabel={t('duration')}
        {...register('duration', {
          valueAsNumber: true,
        })}
      />
    </div>
  );
};

export default FormMovieInputsNumbers;
