/* eslint-disable no-unused-vars */
import { IFavoriteMovieResponse, IMovie } from "@/models/movie/movie";

export interface  User  {
  id?: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  role?: UserRole;
  favoriteMovies?: IFavoriteMovieResponse[];
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}