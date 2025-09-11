import { z } from 'zod';

export type GenreSectionSchema = z.infer<typeof genreSchema>;

export const genreSchema = z.object({
  id: z.string().optional(),
  nameFR: z.string().min(1, 'Un genre est requis'),
  nameEN: z.string().min(1, 'Un genre est requis'),
  nameJP: z.string().min(1, 'Un genre est requis'),
});

export const FormDataMovieSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Un titre est requis'),
  originalTitle: z.string().min(1, 'Un titre original est requis'),
  titleEnglish: z.string().optional(),
  titleJapanese: z.string().optional(),
  synopsis: z.string().optional(),
  director: z.string().optional(),
  imdbId: z.string().optional(),
  genresIds: z.array(z.string()).min(1, 'Un genre est requis'),
  country: z.string().optional(),
  duration: z.preprocess((val) => Number(val), z.number()),
  langage: z.string().optional(),
  link: z.string().optional(),
  trailer: z.string().optional(),
  year: z.preprocess(
    (val) => Number(val),
    z.number().min(1890).max(new Date().getFullYear())
  ),
  subtitles: z.array(z.string()).optional().default([]),
  idGoogleDive: z.string().min(1, 'Un id google drive est requis'),
});

export type MovieSchema = z.infer<typeof FormDataMovieSchema>;

export const emailSchema = z.object({
  email: z
    .string()
    .regex(
      new RegExp(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/),
      "L'email est incorrect."
    )
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

export type MovieUploadSchema = z.infer<typeof movieUploadSchema>;
export const movieUploadSchema = z.object({
  file: z
    .object({
      name: z.string(),
      type: z.string(),
      size: z.number(),
    })
    .optional(),
});
