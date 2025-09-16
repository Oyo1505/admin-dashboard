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
  updatedAt?: string;
  isFavorite?: boolean;
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
type FilterKey = 'subtitles' | 'language' | 'decade' | 'genre';
export type SelectFiltersProps = {
  filterKey?: FilterKey;
  titleLabel: string;
  defaultValue?: string;
  displayedOptionValues: React.ReactNode;
  // eslint-disable-next-line no-unused-vars
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  filters?: Partial<IFilters>;
};

export interface IMovieFormData {
  id?: string;
  title: string;
  titleJapanese?: string;
  titleEnglish?: string;
  idGoogleDive: string;
  director?: string;
  imdbId?: string;
  subtitles: string[];
  language?: string;
  originalTitle: string;
  genresIds: string[];
  year: number;
  duration: number;
  country?: string;
  synopsis?: string;
  trailer?: string;
  link?: string;
  image?: string;
  publish?: boolean;
  releaseDate?: Date;
}

export interface IUpdateMovieData extends IMovieFormData {
  id: string; // Required for updates
}
