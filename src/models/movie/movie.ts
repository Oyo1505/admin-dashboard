import { User } from "next-auth"

export interface IMovie {
  id?:string
  title?:string
  sources?: string[]
  idGoogleDive?:string
  releaseDate?: Date
  link?: string
  year?: number
  genre?: string
  country?: string
  synopsis? : string
  trailer?:  string
  favoritedBy?: User[]
}

export interface IMovieFileGoogleDrive {
  kind: string,
  id: string,
  name: string,
  mimeType: string
}