import { IGenre } from "@/models/movie/movie";

 const displayGenreTranslated = (genre: IGenre | undefined, locale: string) => {
  return locale === 'fr' && genre ? genre.nameFR : locale === 'en' && genre ? genre.nameEN : genre?.nameJP;
}

export default displayGenreTranslated;