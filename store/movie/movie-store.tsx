import { IFilters } from '@/models/movie/movie';
import {create} from 'zustand';

interface FormData {
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
  formData: FormData
  setFormData: (data: Partial<MovieFormState>) => void;
 
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
  setFormData: (data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        ...data,
      },
    })),
}));

interface FiltersMovieState {
  filters: IFilters;
  hasBeenSearched: boolean;
  setFiltersData: (data: Partial<IFilters>) => void; 
  setHasBeenSearched : (val: boolean) => void;
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
  setHasBeenSearched: (boolean) =>
    set({ hasBeenSearched: boolean}),
}));

export { useFiltersMovieStore, useMovieFormStore };
