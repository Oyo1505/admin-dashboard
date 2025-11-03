import { IMovieFormData } from '@/models/movie/movie';

/**
 * Helper functions for MovieData operations
 * Extracts common logic to reduce duplication between create() and update()
 */

/**
 * Builds the base movie data object from form data
 * Used by both create() and update() operations
 */
export function buildMovieData(movie: IMovieFormData) {
  return {
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
    country: movie.country,
    synopsis: movie.synopsis,
    trailer: movie.trailer,
  };
}

/**
 * Builds the genres connection structure for Prisma create operation
 * Creates new genre relationships
 */
export function buildGenresConnectionForCreate(genresIds: string[]) {
  return {
    create: genresIds.map((genreId) => ({
      genre: {
        connect: { id: genreId.toString() },
      },
    })),
  };
}

/**
 * Builds the genres connection structure for Prisma update operation
 * Deletes existing relationships and creates new ones
 */
export function buildGenresConnectionForUpdate(genresIds: string[]) {
  return {
    deleteMany: {},
    create: genresIds.map((genreId) => ({
      genre: {
        connect: { id: genreId.toString() },
      },
    })),
  };
}

/**
 * Builds the standard include object for movie queries
 * Ensures consistent genre data structure across queries
 */
export function buildMovieInclude() {
  return {
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
  };
}
