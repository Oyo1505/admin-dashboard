'use client';

import { Button } from '@/domains/ui/components/button/button';
import { cn } from '@/lib/utils';
import { logError } from '@/lib/errors';
import { movieUploadSchema } from '@/shared/schema/movieSchema';
import { useUploadStore } from '@/store/upload/upload-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Film, Upload, CloudUpload, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useUploadToGoogleDrive } from '../../hooks/useUploadToGoogleDrive';

interface FormValues {
  file: File;
}

/**
 * Format file size for display
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

/**
 * Static icons hoisted outside component to prevent re-creation
 * @see rendering-hoist-jsx
 */
const DROPZONE_ICONS = {
  dragOver: (
    <CloudUpload
      className="h-8 w-8 text-blue-500 animate-bounce"
      aria-hidden="true"
    />
  ),
  selected: (
    <Film
      className="h-8 w-8 text-green-600 dark:text-green-400"
      aria-hidden="true"
    />
  ),
  default: (
    <Upload
      className="h-8 w-8 text-gray-500 dark:text-gray-400"
      aria-hidden="true"
    />
  ),
} as const;

/**
 * Button Add Movie Component
 *
 * Beautiful file upload component with drag-and-drop support.
 * Uses non-blocking upload with progress tracking.
 *
 * Features:
 * - Drag and drop support
 * - Visual feedback for all states
 * - File preview with size info
 * - Animated upload button
 * - Full accessibility support (WCAG 2.2 AA)
 */
const ButtonAddMovie = () => {
  const t = useTranslations('Upload');
  const { upload, isUploading } = useUploadToGoogleDrive();
  // Derived state selector to prevent re-renders from function calls
  // @see rerender-derived-state
  const hasActiveUploads = useUploadStore((state) =>
    Object.values(state.uploads).some(
      (u) => u.status === 'pending' || u.status === 'uploading'
    )
  );

  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { handleSubmit, control, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(movieUploadSchema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      upload(data.file);
      reset();
      setSelectedFile(null);
    } catch (error) {
      logError(error, 'ButtonAddMovie');
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files?.length && files[0].type === 'video/mp4') {
        setSelectedFile(files[0]);
        setValue('file', files[0], { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleFileChange = useCallback(
    (file: File | null) => {
      setSelectedFile(file);
      if (file) {
        setValue('file', file, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [reset]);

  const handleZoneClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const isDisabled = isUploading || hasActiveUploads;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">
      {/* Dropzone */}
      <div
        onClick={!isDisabled ? handleZoneClick : undefined}
        onDragOver={!isDisabled ? handleDragOver : undefined}
        onDragLeave={!isDisabled ? handleDragLeave : undefined}
        onDrop={!isDisabled ? handleDrop : undefined}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleZoneClick();
          }
        }}
        aria-label={t('selectFile')}
        aria-disabled={isDisabled}
        className={cn(
          'relative mt-4 rounded-xl border-2 border-dashed p-6 transition-all duration-300',
          'flex flex-col items-center justify-center gap-3',
          'cursor-pointer select-none',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.02]'
            : selectedFile
              ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50',
          isDisabled && 'cursor-not-allowed opacity-60'
        )}
      >
        {/* Hidden file input */}
        <Controller
          name="file"
          control={control}
          render={({ field: { onChange } }) => (
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp4,video/mp4"
              onChange={(e) => {
                const files = e.target.files;
                if (files?.length) {
                  handleFileChange(files[0]);
                  onChange(files[0]);
                }
              }}
              className="sr-only"
              aria-label={t('selectFile')}
              disabled={isDisabled}
            />
          )}
        />

        {/* Icon - using hoisted static JSX */}
        <div
          className={cn(
            'rounded-full p-4 transition-all duration-300',
            isDragOver
              ? 'bg-blue-100 dark:bg-blue-900/50'
              : selectedFile
                ? 'bg-green-100 dark:bg-green-900/50'
                : 'bg-gray-100 dark:bg-gray-800'
          )}
        >
          {isDragOver
            ? DROPZONE_ICONS.dragOver
            : selectedFile
              ? DROPZONE_ICONS.selected
              : DROPZONE_ICONS.default}
        </div>

        {/* Text content */}
        {selectedFile ? (
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-62.5">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p
              className={cn(
                'text-sm font-medium',
                isDragOver
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300'
              )}
            >
              {isDragOver ? t('dragActive') : t('dropzone')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('dropzoneHint')}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {t('supportedFormats')}
            </p>
          </div>
        )}

        {/* Clear button */}
        {selectedFile && !isDisabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClearFile();
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label={t('changeFile')}
          >
            <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>
        )}
      </div>

      {/* Upload button */}
      <Button
        type="submit"
        disabled={!selectedFile || isDisabled}
        className={cn(
          'w-full mt-4 h-12 text-base font-semibold',
          'bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
          'disabled:from-gray-400 disabled:to-gray-500',
          'transition-all duration-300',
          'shadow-lg hover:shadow-xl',
          isUploading && 'animate-pulse'
        )}
        aria-busy={isUploading}
      >
        {isDisabled ? (
          <span className="flex items-center gap-2">
            <Upload className="h-5 w-5 animate-spin" />
            {t('uploadingButton')}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CloudUpload className="h-5 w-5" />
            {t('uploadButton')}
          </span>
        )}
      </Button>
    </form>
  );
};

export default ButtonAddMovie;
