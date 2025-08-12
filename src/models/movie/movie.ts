export interface IFavoriteMovieResponse {
  id: string;
  movieId: string;
  userId: string;
  movie: IMovie;
}

export interface IMovie {
  id: string;
  title: string;
  originalTitle: string | null;
  titleJapanese: string | null;
  titleEnglish: string | null;
  movieId?: string | null;
  image: string;
  director?: string | null;
  publish: boolean;
  imdbId?: string | null;
  idGoogleDive: string | null;
  tags: string[];
  duration?: number | null;
  link: string;
  releaseDate: string | null;
  language?: string | null;
  subtitles?: string[];
  year: number | null;
  genre?: string[];
  genresIds?: IGenreResponse[];
  country: string | null;
  synopsis: string | null;
  trailer: string | null;
  favoriteUser?: string[];
  kind?: string;
  name?: string;
  mimeType?: string;
}

export interface IFilters {
  subtitles?: string;
  language?: string;
  decade?: number | null;
  genre?: string;
  q?: string;
}

export interface IGenreResponse {
  genre: IGenre;
}

export interface IGenre {
  id: string;
  nameFR: string;
  nameJP: string;
  nameEN: string;
}
