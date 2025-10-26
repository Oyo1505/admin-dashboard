'use client';
import { addGenre } from '@/domains/movies/actions/genres';
import { Button } from '@/domains/ui/components/button/button';
import { Input } from '@/domains/ui/components/input/input';
import LabelForm from '@/domains/ui/components/label-form/label-form';
import Title from '@/domains/ui/components/title/title';
import { logError } from '@/lib/errors';
import { IGenre } from '@/models/movie/movie';
import { genreSchema, GenreSectionSchema } from '@/shared/schema/movieSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';

import { useForm } from 'react-hook-form';

const GenreForm = () => {
  const t = useTranslations('GenrePage');
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      nameFR: '',
      nameJP: '',
      nameEN: '',
    },
    resolver: zodResolver(genreSchema),
  });

  const onSubmit = async (data: GenreSectionSchema) => {
    try {
      await addGenre(data as IGenre);
      reset();
    } catch (error) {
      logError(error, 'GenreForm');
    }
  };

  return (
    <div>
      <Title
        type="h3"
        translationText="addGenre"
        className="mb-3"
        translationTheme="GenrePage"
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="flex flex-col gap-2">
          <div>
            <LabelForm
              titleLabel={t('LabelFrench')}
              className="text-white"
              htmlFor="nameFR"
            />
            <Input className="text-black" type="text" {...register('nameFR')} />
          </div>
          <div>
            <LabelForm
              titleLabel={t('LabelEnglish')}
              className="text-white"
              htmlFor="nameEN"
            />
            <Input className="text-black" type="text" {...register('nameEN')} />
          </div>
          <div>
            <LabelForm
              titleLabel={t('LabelJapanese')}
              className="text-white"
              htmlFor="nameJP"
            />
            <Input className="text-black" type="text" {...register('nameJP')} />
          </div>
        </fieldset>

        <Button type="submit" className="mt-5" variant="outline" size="sm">
          Ajouter
        </Button>
      </form>
    </div>
  );
};

export default GenreForm;
