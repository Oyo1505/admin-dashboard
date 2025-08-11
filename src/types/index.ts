// Types globaux pour l'application

import { StaticImageData } from "next/image";

export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role: 'USER' | 'ADMIN';
}

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  titleJapanese?: string;
  titleEnglish?: string;
  image: string;
  duration?: number;
  idGoogleDive?: string;
  tags: string[];
  link: string;
  releaseDate?: string;
  language?: string;
  subtitles: string[];
  year?: number;
  country?: string;
  synopsis?: string;
  trailer?: string;
  director?: string;
  imdbId?: string;
  publish: boolean;
  createdAt: Date;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SearchParams {
  query?: string;
  genre?: string;
  year?: number;
  language?: string;
}


export type Ressource = {
  id: number;
  name: string;
  url: string;
  description: string;
  image?: StaticImageData;
}
