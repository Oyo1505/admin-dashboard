'use server';
import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { IFavoriteMovieResponse, IMovie } from '@/models/movie/movie';
import { User } from '@/models/user/user';
import { URL_DASHBOARD_ROUTE } from '@/shared/route';
import { revalidatePath } from 'next/cache';

export const getAllMoviesWithGenres = async (): Promise<{
  movieInDb?: IMovie[];
  status?: number;
}> => {
  try {
    const movieInDb = await prisma.movie.findMany({
      include: {
        genresIds: {
          select: {
            genre: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { movieInDb, status: 200 };
  } catch (error) {
    logError(error, 'getAllMovies');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const addMovieToDb = async (
  movie: IMovie,
  user: User
): Promise<{ status: number; message: string }> => {
  try {
    if (!user || user.role !== 'ADMIN') {
      return { status: 403, message: 'Unauthorized' };
    }

    if (!movie?.title?.trim()) {
      return { status: 400, message: 'Le titre du film est requis' };
    }

    if (
      !movie.genresIds ||
      !Array.isArray(movie.genresIds) ||
      movie.genresIds.length === 0
    ) {
      return { status: 400, message: 'Au moins un genre est requis' };
    }

    const existingMovie = await prisma.movie.findUnique({
      where: { idGoogleDive: movie.idGoogleDive || '' },
    });

    if (existingMovie) {
      return { status: 409, message: 'Le film existe déjà' };
    }

    await prisma.movie.create({
      data: {
        title: movie.title,
        titleEnglish: movie.titleEnglish,
        titleJapanese: movie.titleJapanese,
        link: movie.link,
        image: movie.link,
        director: movie.director,
        imdbId: movie.imdbId,
        originalTitle: movie.originalTitle,
        duration: movie.duration ? Number(movie.duration) : null,
        idGoogleDive: movie.idGoogleDive,
        language: movie.language,
        subtitles: movie.subtitles || [],
        year: movie.year ? Number(movie.year) : null,
        genresIds: {
          create: movie.genresIds.map((genreId) => ({
            genre: {
              connect: { id: genreId.toString() },
            },
          })),
        },
        country: movie.country,
        synopsis: movie.synopsis,
        trailer: movie.trailer,
      },
    });

    revalidatePath(URL_DASHBOARD_ROUTE.movie);
    return { status: 200, message: 'Film ajouté avec succès' };
  } catch (error) {
    logError(error, 'addMovieToDb');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode, message: appError.message };
  }
};

export const editMovieToDb = async (
  movie: IMovie,
  user: User
): Promise<{ status: number; message?: string }> => {
  try {
    if (user.role !== 'ADMIN')
      return {
        status: 403,
        message: 'Unautorized',
      };
    const movieInDb = await prisma.movie.findUnique({
      where: {
        id: movie.id,
      },
    });

    if (!movieInDb) {
      return { status: 404, message: "Le film n'existe pas" };
    }

    if (
      !movie.genresIds ||
      !Array.isArray(movie.genresIds) ||
      movie.genresIds.length === 0
    ) {
      return { status: 400, message: 'Au moins un genre est requis' };
    }

    await prisma.movie.update({
      where: {
        id: movie.id,
      },
      data: {
        title: movie.title,
        titleEnglish: movie.titleEnglish,
        titleJapanese: movie.titleJapanese,
        link: movie.link,
        image: movie.link,
        director: movie.director,
        imdbId: movie.imdbId,
        originalTitle: movie.originalTitle,
        duration: Number(movie.duration),
        idGoogleDive: movie.idGoogleDive,
        language: movie.language,
        subtitles: movie.subtitles || [],
        year: Number(movie.year),
        genresIds: {
          deleteMany: {},
          create: movie.genresIds.map((genreId) => ({
            genre: {
              connect: { id: genreId.toString() },
            },
          })),
        },
        country: movie.country,
        synopsis: movie.synopsis,
        trailer: movie.trailer,
      },
    });

    revalidatePath(URL_DASHBOARD_ROUTE.movie);
    return { status: 200, message: 'Film modifié avec succès' };
  } catch (error) {
    logError(error, 'editMovieToDb');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const deleteMovieById = async (
  id: string,
  user: User
): Promise<{ status: number; message?: string }> => {
  try {
    if (user.role !== 'ADMIN') {
      return {
        status: 403,
        message: "Accès refusé : vous n'êtes pas administrateur",
      };
    }
    if (id) {
      await prisma.movie.delete({
        where: {
          id,
        },
      });
      revalidatePath('/dashboard/add-movie');
      return { status: 200 };
    }
  } catch (error) {
    logError(error, 'deleteMovieById');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
  return {
    status: 400,
    message: 'ID du film est requis',
  };
};

export const publishedMovieById = async (
  id: string
): Promise<{ publish?: boolean; status: number }> => {
  try {
    if (id) {
      const findedMovie = await prisma.movie.findUnique({
        where: {
          id,
        },
      });
      if (findedMovie) {
        const movie = await prisma.movie.update({
          where: {
            id,
          },
          data: {
            publish: !findedMovie?.publish,
          },
        });
        return { publish: movie.publish, status: 200 };
      }
    }
    return { publish: false, status: 404 };
  } catch (error) {
    logError(error, 'publishedMovieById');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const getFavoriteMovies = async (
  id: string
): Promise<{ movies?: IFavoriteMovieResponse[]; status: number }> => {
  try {
    const movies = await prisma.userFavoriteMovies.findMany({
      relationLoadStrategy: 'join',
      where: {
        userId: id,
      },
      include: {
        movie: true,
      },
    });
    return {
      movies: movies.map((movie) => ({
        ...movie,
        id: movie.id.toString(),
      })),
      status: 200,
    };
  } catch (error) {
    logError(error, 'getFavoriteMovies');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};
