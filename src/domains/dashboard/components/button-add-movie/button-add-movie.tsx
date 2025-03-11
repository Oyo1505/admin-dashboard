'use client';
import LoadingSpinner from '@/domains/shared/loading-spinner/loading-spinner';
import { Button } from '@/domains/ui/components/button/button';
import { Input } from '@/domains/ui/components/input/input'
import { addFileToGoogleDriveAction } from '@/googleDrive';
import { movieUploadSchema } from '@/shared/schema/movieSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react'
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query'

interface FormValues {
  file: File;
}

const ButtonAddMovie = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) => addFileToGoogleDriveAction(data.file),
  });

  const { handleSubmit, control } = useForm<FormValues>({
    resolver: zodResolver(movieUploadSchema)
  });

  const onSubmit = async (data: FormValues) => {
    try {
      mutate(data);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
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