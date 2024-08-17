import { IMovie } from "@/models/movie/movie"

export   const titleOnlocale = (movie: IMovie, locale: string) => {
  if (locale === 'fr') {
    return movie?.title
  }else if (locale === 'jp') {
    return movie?.titleJapanese ? movie?.titleJapanese : movie?.titleEnglish ?  movie?.titleEnglish : movie?.originalTitle
  }else if (locale === 'en') {
    return movie?.titleEnglish ?  movie?.titleEnglish : movie?.originalTitle
  }
  return movie?.title ??  movie?.originalTitle
}