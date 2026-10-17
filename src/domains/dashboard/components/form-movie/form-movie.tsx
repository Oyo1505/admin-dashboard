'use client';
import { Button } from '@/domains/ui/components/button/button';
import Title from '@/domains/ui/components/title/title';
import { IMovie } from '@/models/movie/movie';
import { useLocale, useTranslations } from 'next-intl';
import { Activity } from 'react';
import { useWatch } from 'react-hook-form';
import { useMovieForm } from '../../hooks/useMovieForm';
import { useMovieGenres } from '../../hooks/useMovieGenres';
import { useTmdbPrefill } from '../../hooks/useTmdbPrefill';
import { TmdbPrefillService } from '../../services/tmdb-prefill.service';
import FormMovieImdbPrefill from '../form-movie_imdb-prefill/form-movie_imdb-prefill';
import FormMovieInputsNumbers from '../form-movie_input-numbers/form-movie_inputs-numbers';
import FormMovieInputsDescription from '../form-movie_inputs-description/form-movie_inputs-description';
import FormMovieInputsTitles from '../form-movie_inputs-titles/form-movie_inputs-titles';
import FormMovieSelectGenre from '../form-movie_select-genre/form-movie_select-genre';
import FormMovieSelects from '../form-movie_selects/form-movie_selects';

const checkboxSubtitles = ['FR', 'JP', 'EN'];

const FormMovie = ({
  movie,
  editMovie = false,
  idFromGoogleDrive,
}: {
  movie?: IMovie;
  editMovie?: boolean;
  idFromGoogleDrive?: string;
}) => {
  const t = useTranslations('AddMovie');

  const {
    form,
    handleMovieSubmission,
    subtitles,
    handleCheckboxChange,
    handleCountryChange,
    handleLangageChange,
  } = useMovieForm({
    movie,
    editMovie,
    idFromGoogleDrive,
  });

  const {
    register,
    formState: { errors },
    control,
  } = form;

  const { genresMovie, handleGenreChange, handleGenreDelete, availableGenres } =
    useMovieGenres({
      movie,
      setValue: form.setValue,
    });

  const { prefill, status: prefillStatus } = useTmdbPrefill(form);

  // Enter in the IMDb id input prefills instead of submitting the form
  const handleImdbIdEnter = (e: React.KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLInputElement;
    if (e.key !== 'Enter' || target.name !== 'imdbId') return;
    e.preventDefault();
    if (TmdbPrefillService.isValidImdbId(target.value)) prefill(target.value);
  };

  const locale = useLocale();

  // useWatch subscribes to changes; watch() is memoized away by the React Compiler
  const watchedValues = useWatch({ control });
  const formData = {
    langage: watchedValues.langage,
    country: watchedValues.country,
    idGoogleDive: watchedValues.idGoogleDive,
  };

  return (
    <div className="bg-white">
      <div className=" text-background p-3 ">
        <Title
          type="h1"
          textColor="text-background text-lg mb-3"
          translationTheme="AddMovie"
          translationText="title"
        />
        <form onSubmit={handleMovieSubmission} onKeyDown={handleImdbIdEnter}>
          <FormMovieInputsTitles
            register={register}
            errors={errors as any}
            imdbPrefill={
              <FormMovieImdbPrefill
                imdbId={watchedValues.imdbId}
                status={prefillStatus}
                onPrefill={prefill}
              />
            }
          />
          <FormMovieSelects
            locale={locale}
            formData={formData}
            handleCountryChange={handleCountryChange}
            handleLangageChange={handleLangageChange}
          />
          <FormMovieSelectGenre
            genresMovie={genresMovie}
            handleGenreDelete={handleGenreDelete}
            availableGenres={availableGenres}
            handleGenreChange={handleGenreChange}
            checkboxSubtitles={checkboxSubtitles}
            handleCheckboxChange={handleCheckboxChange}
            locale={locale}
            errors={errors}
            register={register}
            subtitles={subtitles}
            genreLabel={t('genre')}
            subtitlesLabel={t('subtitles')}
          />

          <FormMovieInputsNumbers register={register} />
          <FormMovieInputsDescription register={register} />
          <Activity mode={formData?.idGoogleDive ? 'visible' : 'hidden'}>
            <iframe
              src={`https://drive.google.com/file/d/${formData?.idGoogleDive}/preview`}
              width="100%"
              height="150"
              allow="autoplay"
            />
          </Activity>

          <div className="mt-[25px] flex justify-end">
            <Button
              size="sm"
              variant="outline"
              type="submit"
              className="bg-green4 text-green11 hover:bg-green5 focus:shadow-green7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-hidden"
            >
              {t('save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default FormMovie;
