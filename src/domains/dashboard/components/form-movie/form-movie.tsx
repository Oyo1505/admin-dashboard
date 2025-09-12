'use client';
import SelectGenreMovieForm from '@/domains/movies/components/select-genre-movie-form/select-genre-movie-form';
import FormCheckBox from '@/domains/shared/components/form-checkbox/form-checkbox';
import FormNumberInput from '@/domains/shared/components/form-number-input/form-number-input';
import FromSelectInput from '@/domains/shared/components/form-select-input/form-select-input';
import FormTextInput from '@/domains/shared/components/form-text-input/form-text-input';
import FormTextAreaInput from '@/domains/shared/components/form-textarea-input/form-textarea-input';
import { Button } from '@/domains/ui/components/button/button';
import LabelForm from '@/domains/ui/components/label-form/label-form';
import LabelGenre from '@/domains/ui/components/label-genre/label-genre';
import Title from '@/domains/ui/components/title/title';
import { IMovie } from '@/models/movie/movie';
import countriesList from '@/shared/constants/countries';
import { languagesList } from '@/shared/constants/lang';
import useUserStore from '@/store/user/user-store';
import { User } from 'next-auth';
import { useLocale, useTranslations } from 'next-intl';
import { useMovieForm } from '../../hooks/useMovieForm';
import { useMovieGenres } from '../../hooks/useMovieGenres';

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
  const { user } = useUserStore();

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
    user: user as User,
  });

  const {
    register,
    formState: { errors },
    watch,
  } = form;

  const { genresMovie, handleGenreChange, handleGenreDelete, availableGenres } =
    useMovieGenres({
      movie,
      setValue: form.setValue,
    });

  const locale = useLocale();

  const watchedValues = watch();
  const formData = {
    langage: watchedValues.langage,
    country: watchedValues.country,
    idGoogleDive: watchedValues.idGoogleDive,
  };

  const langageSorted = languagesList.sort(
    (
      a: { label: { fr: string; jp: string; en: string } },
      b: { label: { fr: string; jp: string; en: string } }
    ) =>
      locale === 'fr'
        ? a.label.fr.localeCompare(b.label.fr)
        : locale === 'jp'
          ? a.label.jp.localeCompare(b.label.jp)
          : a.label.en.localeCompare(b.label.en)
  );
  return (
    <div className="bg-white">
      <div className=" text-background p-3 ">
        <Title
          type="h1"
          textColor="text-background text-lg mb-3"
          translationTheme="AddMovie"
          translationText="title"
        />
        <form onSubmit={handleMovieSubmission}>
          <FormTextInput
            textTranslated={t('titleMovie')}
            htmlFor="title"
            keyValue="title"
            errors={errors}
            {...register('title')}
          />
          <FormTextInput
            textTranslated={t('originalTitle')}
            htmlFor="originalTitle"
            keyValue="originalTitle"
            {...register('originalTitle')}
          />
          <FormTextInput
            textTranslated={t('titleJapanese')}
            htmlFor="titleJapanese"
            keyValue="titleJapanese"
            {...register('titleJapanese')}
          />
          <FormTextInput
            textTranslated={t('titleEnglish')}
            htmlFor="titleEnglish"
            keyValue="titleEnglish"
            {...register('titleEnglish')}
          />
          <FormTextInput
            textTranslated={t('director')}
            htmlFor="director"
            keyValue="director"
            {...register('director')}
          />
          <FormTextInput
            textTranslated={t('link')}
            htmlFor="link"
            keyValue="link"
            {...register('link')}
          />
          <FormTextInput
            textTranslated={t('imdbId')}
            htmlFor="imdbId"
            keyValue="imdbId"
            {...register('imdbId')}
          />
          <div className="grid grid-cols-2 gap-3">
            <FromSelectInput
              optionsList={langageSorted}
              formData={formData}
              formDataKey="langage"
              titleLabel={t('langage')}
              htmlFor="langage"
              locale={locale}
              onChange={handleLangageChange}
            />
            <FromSelectInput
              optionsList={countriesList}
              formData={formData}
              formDataKey="country"
              titleLabel={t('country')}
              htmlFor="country"
              locale={locale}
              onChange={handleCountryChange}
            />
          </div>
          <div className="mb-[15px] flex flex-col items-center gap-5">
            <LabelForm
              className="text-violet11  text-right text-[15px]"
              titleLabel={t('genre')}
              htmlFor="genresIds"
            />
            <div className="inline-flex flex-wrap gap-2">
              {genresMovie.length > 0 &&
                genresMovie?.map((item) => (
                  <LabelGenre
                    key={item.id}
                    nameFR={item.nameFR}
                    nameEN={item.nameEN}
                    nameJP={item.nameJP}
                    onClick={() => handleGenreDelete(item.id)}
                    locale={locale}
                  />
                ))}
            </div>
            {availableGenres && (
              <SelectGenreMovieForm
                optionsList={availableGenres}
                locale={locale}
                onChange={handleGenreChange}
                errors={errors}
              />
            )}
          </div>
          <div className="mb-[15px] flex flex-col items-center gap-5">
            <LabelForm
              className="text-violet11  text-right text-[15px]"
              titleLabel={t('subtitles')}
              htmlFor="subtitles"
            />
            <div className="flex gap-5 justify-center align-items">
              {checkboxSubtitles &&
                checkboxSubtitles?.map((item) => (
                  <FormCheckBox
                    key={`subtitles${item}`}
                    id={`subtitles${item}`}
                    value={item}
                    {...register('subtitles')}
                    checked={subtitles}
                    onChange={() => handleCheckboxChange(item)}
                    titleLabel={item}
                    htmlFor="subtitles"
                  />
                ))}
            </div>
          </div>

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

          {formData?.idGoogleDive && (
            <iframe
              src={`https://drive.google.com/file/d/${formData?.idGoogleDive}/preview`}
              width="100%"
              height="150"
              allow="autoplay"
            />
          )}
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
