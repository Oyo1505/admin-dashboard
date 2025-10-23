'use server';
import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import {
  IFavoriteMovieResponse,
  IMovieFormData,
  IUpdateMovieData,
} from '@/models/movie/movie';
import { URL_DASHBOARD_ROUTE } from '@/shared/route';
import checkPermissionsRoleFromSession from '@/shared/utils/permissions/checkPermissionsRoleFromSession';
import { revalidatePath } from 'next/cache';

export const addMovieToDb = async (
  movie: IMovieFormData
): Promise<{ status: number; message: string }> => {
  try {
    const authCheck = await checkPermissionsRoleFromSession();
    if (authCheck.status !== 200) {
      return {
        status: authCheck.status,
        message: authCheck.message || "Erreur d'autorisation",
      };
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
        link: movie.link || '',
        image: movie.image || movie.link || '',
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
  movie: IUpdateMovieData
): Promise<{ status: number; message?: string }> => {
  try {
    const authCheck = await checkPermissionsRoleFromSession();
    if (authCheck.status !== 200) {
      return {
        status: authCheck.status,
        message: authCheck.message || "Erreur d'autorisation",
      };
    }

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
        link: movie.link || '',
        image: movie.image || movie.link || '',
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
  id: string
): Promise<{ status: number; message?: string }> => {
  try {
    const authCheck = await checkPermissionsRoleFromSession();
    if (authCheck.status !== 200) {
      return {
        status: authCheck.status,
        message: authCheck.message || "Erreur d'autorisation",
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
    if (!id) {
      return { publish: false, status: 400 };
    }

    const movie = await prisma.movie.findUnique({
      where: { id },
      select: { id: true, publish: true },
    });

    if (!movie) {
      return { publish: false, status: 404 };
    }

    const updatedMovie = await prisma.movie.update({
      where: { id },
      data: { publish: !movie.publish },
      select: { publish: true },
    });

    revalidatePath(URL_DASHBOARD_ROUTE.movie);
    return { publish: updatedMovie.publish, status: 200 };
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
        movie: {
          include: {
            genresIds: {
              select: {
                genre: {
                  select: {
                    id: true,
                    nameFR: true,
                    nameEN: true,
                    nameJP: true,
                  },
                },
              },
            },
          },
        },
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
