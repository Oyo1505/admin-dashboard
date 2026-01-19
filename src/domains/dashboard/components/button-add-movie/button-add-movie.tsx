'use client';

import { Button } from '@/domains/ui/components/button/button';
import { Input } from '@/domains/ui/components/input/input';
import { logError } from '@/lib/errors';
import { movieUploadSchema } from '@/shared/schema/movieSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { useUploadToGoogleDrive } from '../../hooks/useUploadToGoogleDrive';
import { useUploadStore } from '@/store/upload/upload-store';

interface FormValues {
  file: File;
}

/**
 * Button Add Movie Component
 *
 * File upload form for adding movies to Google Drive.
 * Uses non-blocking upload with progress tracking.
 *
 * Key improvements:
 * - Form remains visible during upload (no blocking spinner)
 * - Upload progress shown in global indicator
 * - Form resets immediately after submission
 * - User can continue browsing while upload completes
 */
const ButtonAddMovie = () => {
  const t = useTranslations('Upload');
  const { upload, isUploading } = useUploadToGoogleDrive();
  const hasActiveUploads = useUploadStore((state) => state.hasActiveUploads());

  const { handleSubmit, control, reset } = useForm<FormValues>({
    resolver: zodResolver(movieUploadSchema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Start upload in background (non-blocking)
      upload(data.file);

      // Reset form immediately - upload continues in background
      reset();
    } catch (error) {
      logError(error, 'ButtonAddMovie');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="file"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Input
            type="file"
            accept=".mp4"
            onChange={(e) => {
              const files = e.target.files;
              if (files?.length) {
                onChange(files[0]);
              }
            }}
            aria-label={t('selectFile')}
            disabled={isUploading}
          />
        )}
      />
      <Button
        type="submit"
        variant="outline"
        disabled={isUploading}
        aria-busy={isUploading}
      >
        {hasActiveUploads ? t('uploadInProgress') : t('submitButton')}
      </Button>
    </form>
  );
};

export default ButtonAddMovie;
