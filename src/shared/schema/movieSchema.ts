import { z } from 'zod';

export const FormDataMovieSchema = z.object({
  title: z.string().min(1, 'Un titre est requis'),
  titleOriginal: z.string().min(1, 'Un titre original est requis'),
  titleEnglish: z.string(),
  titleJapanese: z.string(),
  synopsis: z.string(),
  genre: z.string(),
  country: z.string(),
  duration: z.number(),
  langage: z.string(),
  subtitles: z.string(),
  link: z.string(),
  year: z.number(),
  trailer: z.array(z.string()),
  idGoogleDive: z.string().min(1, 'Un id google dive est requis'),
});


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