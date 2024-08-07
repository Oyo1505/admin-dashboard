import { User } from "next-auth"

export interface IMovie {
  id: string
  title: string
  image: string
  idGoogleDive: string | null
  tags: string[]
  link: string
  releaseDate: string | null
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
