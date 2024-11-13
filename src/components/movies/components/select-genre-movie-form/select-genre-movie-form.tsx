import { IGenre } from '@/models/movie/movie';
import React, { FC } from 'react'

interface SelectGenreMovieForm {
  optionsList: IGenre[];
  locale: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}
const SelectGenreMovieForm: FC<SelectGenreMovieForm> = ({
  optionsList,
  locale,
  onChange,
  className = 'text-background',
}) => {
  return (
    <select 
      onChange={onChange} 
      className={className}
    >
      <option value=""> </option>
      {optionsList.map((option, index) => (
        <option 
          key={`${option?.id}-${index}`} 
          value={option?.id}
        >
          {locale === 'fr' ? option?.nameFR : locale === 'jp' ? option?.nameJP : option?.nameEN}
        </option>
      ))}
    </select>
  );
};

export default SelectGenreMovieForm