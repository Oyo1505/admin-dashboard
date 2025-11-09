import SelectGenreMovieForm from '@/domains/movies/components/select-genre-movie-form/select-genre-movie-form';
import FormCheckBox from '@/domains/shared/components/form-checkbox/form-checkbox';
import LabelForm from '@/domains/ui/components/label-form/label-form';
import LabelGenre from '@/domains/ui/components/label-genre/label-genre';
import { IGenre } from '@/models/movie/movie';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

interface IFormMovieSelectGenre {
  genresMovie: IGenre[];
  handleGenreDelete: (id: string) => void;
  availableGenres: IGenre[] | undefined;
  handleGenreChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  checkboxSubtitles: string[];
  handleCheckboxChange: (item: string) => void;
  locale: string;
  errors?: FieldErrors<any>;
  register: UseFormRegister<any>;
  subtitles: string[];
  genreLabel: string;
  subtitlesLabel: string;
}

const FormMovieSelectGenre = ({
  genresMovie,
  handleGenreDelete,
  availableGenres,
  handleGenreChange,
  checkboxSubtitles,
  handleCheckboxChange,
  locale,
  errors,
  register,
  subtitles,
  genreLabel,
  subtitlesLabel,
}: IFormMovieSelectGenre) => {
  return (
    <>
      <fieldset className="border-0 p-0 m-0 mb-[15px]">
        <legend className="sr-only">{genreLabel}</legend>
        <div className="flex flex-col items-center gap-5">
          <LabelForm
            className="text-violet11  text-right text-[15px]"
            titleLabel={genreLabel}
            htmlFor="genresIds"
            aria-hidden="true"
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
      </fieldset>
      <fieldset className="border-0 p-0 m-0 mb-[15px]">
        <legend className="sr-only">{subtitlesLabel}</legend>
        <div className="flex flex-col items-center gap-5">
          <LabelForm
            className="text-violet11  text-right text-[15px]"
            titleLabel={subtitlesLabel}
            htmlFor="subtitles"
            aria-hidden="true"
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
                />
              ))}
          </div>
        </div>
      </fieldset>
    </>
  );
};

export default FormMovieSelectGenre;
