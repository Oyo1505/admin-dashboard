import { z } from 'zod';

export type GenreSectionSchema = z.infer<typeof genreSchema>;

export const genreSchema = z.object({
  id: z.string().optional(),
  nameFR: z.string().min(1, 'Un genre est requis'),
  nameEN: z.string().min(1, 'Un genre est requis'),
  nameJP: z.string().min(1, 'Un genre est requis'),
});

export const FormDataMovieSchema = z.object({
  id : z.string(),
  title: z.string().min(1, 'Un titre est requis'),
  originalTitle: z.string().min(1, 'Un titre original est requis'),
  titleEnglish: z.string(),
  titleJapanese: z.string(),
  synopsis: z.string(),
  director : z.string(),
  imdbId : z.string(),
  genre: z.string(),
  genresIds : z.array(z.string()),
  country: z.string(),
  duration: z.number(),
  langage: z.string(),
  link: z.string(),
  trailer : z.string(),
  year: z.number().min(1890, 'L\'année doit être valide').max(new Date().getFullYear(), 'L\'année ne peut pas être dans le futur'),
  subtitles: z.array(z.string()).optional(),
  idGoogleDive: z.string().min(1, 'Un id google dive est requis'),
});

export type MovieSchema = z.infer<typeof FormDataMovieSchema>;

export const emailSchema = z.object({
  email: z
  .string()
  .regex(new RegExp(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/), "L'email est incorrect.")
  .min(1, "L'email est requis.")
  .max(50, "L'email doit faire moins de 50 characters"),
});

export const FormDeleteAccountSchema = z.object({
  id: z.string(),
});

export type DirectorSectionSchema = z.infer<typeof directorSectionSchema>;
export const directorSectionSchema = z.object({
  id: z.string().optional(),
  director: z.string().min(1, 'Un réalisteur est requis'),
  imageBackdrop: z.string(),
});

