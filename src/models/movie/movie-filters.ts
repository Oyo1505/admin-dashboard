import { IMovie } from './movie';

export const MOVIE_PUBLISH_FILTERS = [
  'all',
  'published',
  'unpublished',
] as const;

export type MoviePublishFilter = (typeof MOVIE_PUBLISH_FILTERS)[number];

export interface IAdminMoviesQuery {
  search?: string;
  publish?: MoviePublishFilter;
  page: number;
}

export interface IAdminMoviesResponse {
  movies: IMovie[];
  total: number;
}
