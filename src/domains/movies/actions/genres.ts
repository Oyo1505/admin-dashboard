'use server';
import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { IGenre, IMovie } from '@/models/movie/movie';
import { URL_DASHBOARD_ROUTE } from '@/shared/route';
import { revalidatePath } from 'next/cache';

export const getAllGenres = async (): Promise<{
  status: number;
  genres?: IGenre[];
}> => {
  try {
    const genres = await prisma.genre.findMany();
    if (!genres) {
      return { status: 404, genres };
    }
    return { status: 200, genres };
  } catch (error) {
    logError(error, 'getAllGenres');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const addGenre = async (
  genre: IGenre
): Promise<{ status: number; genre?: IGenre }> => {
  try {
    const createdGenre = await prisma.genre.create({
      data: genre,
    });
    if (!createdGenre) {
      return { status: 404 };
    }
    revalidatePath(URL_DASHBOARD_ROUTE.genre);
    return { status: 200, genre: createdGenre };
  } catch (error) {
    logError(error, 'addGenre');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const updateGenre = async (
  genre: IGenre
): Promise<{ status: number; genre?: IGenre }> => {
  try {
    const updatedGenre = await prisma.genre.update({
      where: {
        id: genre.id,
      },
      data: genre,
    });
    if (!updatedGenre) {
      return { status: 404 };
    }
    revalidatePath(URL_DASHBOARD_ROUTE.genre);
    return { status: 200, genre: updatedGenre };
  } catch (error) {
    logError(error, 'updateGenre');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const deleteGenre = async (
  id: string
): Promise<{ status: number; genre?: IGenre | undefined }> => {
  try {
    const deletedGenre = await prisma.genre.delete({
      where: {
        id: id,
      },
    });
    if (!deletedGenre) {
      return { status: 404 };
    }
    revalidatePath(URL_DASHBOARD_ROUTE.genre);
    return { status: 200, genre: deletedGenre };
  } catch (error) {
    logError(error, 'deleteGenre');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const getMoviesByARandomGenreById = async (
  genreId: string
): Promise<{ movies?: IMovie[]; status: number }> => {
  try {
    if (!genreId?.trim()) {
      return { status: 400 };
    }

    const moviesInDb = await prisma.movie.findMany({
      where: {
        genresIds: {
          some: {
            genreId: { contains: genreId, mode: 'insensitive' },
          },
        },
      },
    });
    return { movies: moviesInDb, status: 200 };
  } catch (error) {
    logError(error, 'getMoviesByARandomGenreById');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const getMoviesByARandomGenre = async (): Promise<{
  movies?: IMovie[];
  genre?: IGenre;
  status: number;
}> => {
  try {
    const uniqueGenres = await prisma.genre.findMany({
      //@ts-ignore
      cacheStrategy: { ttl: 300 },
    });
    if (!uniqueGenres) {
      return { status: 400 };
    }
    const randomGenre =
      uniqueGenres[Math.floor(Math.random() * uniqueGenres.length)];

    const movies = await prisma.movie.findMany({
      where: {
        genresIds: {
          some: {
            genreId: { contains: randomGenre.id, mode: 'insensitive' },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      //@ts-ignore
      cacheStrategy: { ttl: 300 },
    });
    if (!movies) {
      return { status: 400 };
    }
    return { status: 200, movies, genre: randomGenre };
  } catch (error) {
    logError(error, 'getMoviesByARandomGenre');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};
