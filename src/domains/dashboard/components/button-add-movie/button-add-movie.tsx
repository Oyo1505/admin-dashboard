'use client';
import LoadingSpinner from '@/domains/shared/components/loading-spinner/loading-spinner';
import { Button } from '@/domains/ui/components/button/button';
import { Input } from '@/domains/ui/components/input/input';
import { logError } from '@/lib/errors';
import { movieUploadSchema } from '@/shared/schema/movieSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import useGoogleQueries, { FormValues } from '../../hooks/useGoogleQueries';

const ButtonAddMovie = () => {
  const { addFileToGoogleDrive } = useGoogleQueries();
  const { mutate, isPending } = addFileToGoogleDrive;
  const { handleSubmit, control } = useForm<FormValues>({
    resolver: zodResolver(movieUploadSchema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      mutate(data);
    } catch (error) {
      logError(error, 'ButtonAddMovie');
    }
  };

  if (isPending) {
    return <LoadingSpinner />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="file"
        control={control}
        render={({ field: { onChange } }) => (
          <Input
            type="file"
            accept=".mp4"
            onChange={(e) => {
              const files = e.target.files;
              if (files?.length) {
                onChange(files[0]);
              }
            }}
          />
        )}
      />
      <Button type="submit" variant="outline">
        Soumettre
      </Button>
    </form>
  );
};

export default ButtonAddMovie;
