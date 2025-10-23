/* eslint-disable no-unused-vars */
import { IFavoriteMovieResponse } from '@/models/movie/movie';
import { UserRole } from '@prisma/client';

export interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: boolean;
  image?: string | null;
  role?: UserRole;
  favoriteMovies?: IFavoriteMovieResponse[];
  analytics?: IAnalytics[];
}

export interface IAnalytics {
  id: string;
  lastLogin: Date;
  lastMovieWatched?: string;
  visits?: number;
}
