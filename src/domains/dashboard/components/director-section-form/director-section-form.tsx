'use client';
import { Button } from '@/domains/ui/components/button/button';
import { Input } from '@/domains/ui/components/input/input';
import { useToastErrorHandler } from '@/hooks/use-error-handler';
import { IDirector } from '@/models/director/director';
import {
  DirectorSectionSchema,
  directorSectionSchema,
} from '@/shared/schema/movieSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  createDirectorFromSection,
  deleteDirectorFromSection,
  updateDirectorFromSection,
} from '../../actions/director';

const DirectorSectionForm = ({ director }: { director?: IDirector | null }) => {
  const t = useTranslations('DirectorSectionForm');
  const errorHandler = useToastErrorHandler();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      id: director?.id,
      director: director?.director ?? '',
      imageBackdrop: director?.imageBackdrop ?? '',
    },
    resolver: zodResolver(directorSectionSchema),
  });
  const handleError = (success: boolean) => {
    if (success) toast.success('Success');
    if (!success) toast.error('Error');
  };
  const createDirectorSection = async (data: DirectorSectionSchema) => {
    const { success } = await createDirectorFromSection(data);
    success && handleError(success);
  };

  const uploadDirectorSection = async (data: DirectorSectionSchema) => {
    const { success } = await updateDirectorFromSection(data);
    success && handleError(success);
  };

  const deleteDirectorSection = async () => {
    if (!director?.id) return;

    const result = await deleteDirectorFromSection(director.id);

    if (result.success) {
      reset();
      handleError(result.success);
    }
  };

  return (
    <div>
      <h1>{t('title')}</h1>
      {errorHandler.isError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorHandler.error}
        </div>
      )}
      <form
        onSubmit={handleSubmit(
          director?.id ? uploadDirectorSection : createDirectorSection
        )}
      >
        <div className="mb-[15px] flex flex-col items-center gap-2">
          <label
            className="text-violet11  text-right  text-[15px]"
            htmlFor="director"
          >
            {t('director')}
          </label>
          <Input
            type="text"
            id="director"
            className="text-black inline-flex bg-primary h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-hidden focus:shadow-[0_0_0_2px]"
            {...register('director')}
          />
          {errors.director && (
            <p className="text-red-600 text-xs">{errors?.director?.message}</p>
          )}
        </div>
        <div className="mb-[15px]  flex flex-col items-center gap-2">
          <label
            className="text-violet11  text-right  text-[15px]"
            htmlFor="imageBackdrop"
          >
            {t('image')}
          </label>
          <Input
            type="text"
            id="imageBackdrop"
            className="text-black bg-primary inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-hidden focus:shadow-[0_0_0_2px]"
            {...register('imageBackdrop')}
          />
        </div>
        <div className="mt-[25px] gap-2 flex justify-end">
          {director?.id && (
            <Button
              size="sm"
              variant="secondary"
              type="button"
              onClick={deleteDirectorSection}
              className="bg-red-500 hover:bg-red-600 hover:cursor-pointer  text-white inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-hidden"
            >
              {t('delete')}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            type="submit"
            className="inline-flex h-[35px] hover:cursor-pointer items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-hidden"
          >
            {director?.id ? 'Modifier' : t('save')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DirectorSectionForm;
