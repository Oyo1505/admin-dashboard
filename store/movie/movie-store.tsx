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
export default useMovieFormStore;
