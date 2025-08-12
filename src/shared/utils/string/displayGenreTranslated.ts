import { IGenre } from '@/models/movie/movie';

const displayGenreTranslated = (genre: IGenre | undefined, locale: string) => {
  if (!genre) return '';

  switch (locale) {
    case 'fr':
      return genre.nameFR;
    case 'en':
      return genre.nameEN;
    default:
      return genre.nameJP;
  }
};

export default displayGenreTranslated;
