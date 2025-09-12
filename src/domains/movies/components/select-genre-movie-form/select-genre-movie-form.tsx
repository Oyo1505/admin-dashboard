import { IGenre } from '@/models/movie/movie';
import { MovieSchema } from '@/shared/schema/movieSchema';
import React, { memo } from 'react';
import { FieldErrors } from 'react-hook-form';

interface SelectGenreMovieForm {
  optionsList: IGenre[];
  locale: string;
  errors?: FieldErrors<MovieSchema>;
  // eslint-disable-next-line no-unused-vars
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}
const SelectGenreMovieForm = memo(
  ({
    optionsList,
    locale,
    errors,
    onChange,
    className = 'text-background',
  }: SelectGenreMovieForm) => {
    return (
      <>
        <select onChange={onChange} className={className}>
          <option value=""> </option>
          {optionsList.map((option, index) => (
            <option key={`${option?.id}-${index}`} value={option?.id}>
              {locale === 'fr'
                ? option?.nameFR
                : locale === 'jp'
                  ? option?.nameJP
                  : option?.nameEN}
            </option>
          ))}
        </select>
        {errors?.genresIds && (
          <p className="text-red-600 text-xs">{errors.genresIds?.message}</p>
        )}
      </>
    );
  }
);
SelectGenreMovieForm.displayName = 'SelectGenreMovieForm';
export default SelectGenreMovieForm;
