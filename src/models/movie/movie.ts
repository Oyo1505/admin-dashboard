export interface IMovie {
  id?:string
  title:string
  sources: string[]
}

export interface IMovieFileGoogleDrive {
  kind: string,
  id: string,
  name: string,
  mimeType: string
}