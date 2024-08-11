import { User } from "next-auth"

export interface IMovie {
  id: string
  title: string
  originalTitle: string | null
  movieId?: string | null
  image: string
  idGoogleDive: string | null
  tags: string[]
  duration?: number | null
  link: string
  releaseDate: string | null
  language?: string | null
  subtitles?: string[]
  year: number | null
  genre: string[]
  country: string | null
  synopsis: string | null
  trailer: string | null
  favoriteUser?: string[]
  kind?: string,
  name?: string,
  mimeType?: string
}
