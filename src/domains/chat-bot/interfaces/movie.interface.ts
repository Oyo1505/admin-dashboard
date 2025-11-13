export interface IMovieBasicInfo {
  id: string;
  title: string;
  synopsis: string | null;
}

export interface IMovieDetails extends IMovieBasicInfo {
  country: string | null;
  year: number | null;
  duration: number | null;
  director: string | null;
  genresIds?: string[];
  subtitles?: string[];
}

export interface IMovieService {
  getAllMovies: () => Promise<IMovieDetails[]>;
}
