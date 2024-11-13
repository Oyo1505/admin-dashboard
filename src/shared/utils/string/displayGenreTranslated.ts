import { IGenre } from "@/models/movie/movie";

 const displayGenreTranslated = (genre: IGenre, locale: string) => {
  return locale === 'fr' ? genre.nameFR : locale === 'en' ? genre.nameEN : genre.nameJP;
}

export default displayGenreTranslated;