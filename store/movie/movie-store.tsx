
import { addFileToGoogleDrive } from '@/googleDrive';
import { IFilters, IGenre, IMovie } from '@/models/movie/movie';
import {create} from 'zustand';

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
  formData: FormDataStore
  setFormData: (data: Partial<MovieFormState>) => void;
  moviesFromStore : IMovie[]
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
  moviesFromStore : [],
  setFormData: (data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        ...data,
      },
    })),
    setMoviesStore: (data) => {
      set((state) => ({
        moviesFromStore: [...data],
      }));
    },
  }));

interface FiltersMovieState {
  filters: IFilters;
  hasBeenSearched: boolean;
  setFiltersData: (data: Partial<IFilters>) => void; 
  setHasBeenSearched : (val: boolean) => void;
}

interface IGenreStore {
  genres: IGenre[];
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
  setHasBeenSearched: (boolean) =>
    set({ hasBeenSearched: boolean}),
}));


const useGenreStore = create<IGenreStore>((set) => ({
  genres: [],
  setGenres: (data) => {
    set((state) => ({
      genres: [
        ...state.genres,
        ...data,
      ],
    }));  
  },
}));

const useMovieGoogleDiveStore = create((set) => ({
  movie: [],
  isLoading: false,
  uploadGoogleDive: async (file:FormData) => {
    set({ isLoading: true });
    try {
     const { data } = await addFileToGoogleDrive(file);
     
     if(data && data.id){
      set({ isLoading: false });
     }
    }
    catch (error) {
      console.log(error);
    }
   
  }
}));

export { useFiltersMovieStore, useMovieFormStore, useGenreStore, useMovieGoogleDiveStore };
