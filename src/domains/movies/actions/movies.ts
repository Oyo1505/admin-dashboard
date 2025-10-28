'use server';
import { IMovie } from '@/models/movie/movie';
import { cache } from 'react';
import { MoviesService } from '../services';

export const fetchMovies = cache(
  async ({
    pageParam,
    search,
  }: {
    pageParam: number;
    search: string;
  }): Promise<{ movies?: IMovie[]; status: number; prevOffset?: number }> => {
    return await MoviesService.fetchMovies({
      pageParam,
      search,
    });
  }
);
