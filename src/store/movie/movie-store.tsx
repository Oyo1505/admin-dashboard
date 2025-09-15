import { IFilters, IGenre, IMovie } from '@/models/movie/movie';
import { create } from 'zustand';

interface FormDataStore {
  title: string;
  link: string;
  year: number;
  genre: string;
  trailer: string;
  synopsis: string;
  country: string;
  idGoogleDive: string;
}

interface MovieFormState {
  formData: FormDataStore;
  // eslint-disable-next-line no-unused-vars
  setFormData: (data: Partial<FormDataStore>) => void;
  moviesFromStore: IMovie[];
  // eslint-disable-next-line no-unused-vars
  setMoviesStore: (data: IMovie[]) => void;
}

const useMovieFormStore = create<MovieFormState>((set) => ({
  formData: {
    title: '',
    link: '',
    year: new Date().getFullYear(),
    genre: '',
    trailer: '',
    synopsis: '',
    country: '',
    idGoogleDive: '',
  },
  moviesFromStore: [],
  setFormData: (data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        ...data,
      },
    })),
  setMoviesStore: (data) => {
    set(() => ({
      moviesFromStore: [...data],
    }));
  },
}));

interface FiltersMovieState {
  filters: IFilters;
  hasBeenSearched: boolean;
  // eslint-disable-next-line no-unused-vars
  setFiltersData: (data: Partial<IFilters>) => void;
  // eslint-disable-next-line no-unused-vars
  setHasBeenSearched: (val: boolean) => void;
}

interface IGenreStore {
  genres: IGenre[];
  // eslint-disable-next-line no-unused-vars
  setGenres: (data: IGenre[]) => void;
}

const useFiltersMovieStore = create<FiltersMovieState>((set) => ({
  filters: {
    subtitles: undefined,
    language: undefined,
    genre: undefined,
    q: undefined,
  },
  hasBeenSearched: false,
  setFiltersData: (data) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...data,
      },
    })),
  setHasBeenSearched: (boolean) => set({ hasBeenSearched: boolean }),
}));

const useGenreStore = create<IGenreStore>((set) => ({
  genres: [],
  setGenres: (data) => {
    set((state) => ({
      genres: [...state.genres, ...data],
    }));
  },
}));

export { useFiltersMovieStore, useGenreStore, useMovieFormStore };
