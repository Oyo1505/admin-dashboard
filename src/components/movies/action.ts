//@ts-nocheck
"use server"
import prisma from "@/lib/prisma";
import { URL_GENRE_SECTION } from "@/shared/route";
import { revalidatePath } from "next/cache";


function extractUniqueGenres(data: any[]) {
  const allGenres = data.flatMap(item => item.genre);
  
  const uniqueGenres = [...new Set(allGenres)];
  return uniqueGenres;
}


export const getMovieDetail =  async (id:string)=> {
  try {
  const movieInDb = await prisma.movie.findUnique({
      where:{
        id
      },
      cacheStrategy: { ttl: 120 },
    });
  
  const randomGenre = movieInDb.genre[Math.floor(Math.random() * movieInDb.genre.length)];
  const suggestedMovies = await prisma.movie.findMany({
    where: {
      genre: {
        has: randomGenre
      },
      NOT: {
        id: movieInDb.id
      }
    },
    cacheStrategy: { ttl: 600 },
   }) 
   
  if (!movieInDb && !suggestedMovies) {
    return { status: 404, message: 'Le film n\'existe pas' };
  }
  return { movie : movieInDb,suggestedMovies, status: 200 };
} catch (error) {
  console.log(error)
    return {
      status : 500
    }
  }
} 

export const getLastMovies =  async ()=> {
  try {
    const moviesInDb = await prisma.movie.findMany({
      where: {
        publish: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      cacheStrategy: { ttl: 300},
     }) 
  if (!moviesInDb) {
    return { status: 404, message: 'Pas de films' };
  }
  return {movies : moviesInDb, status: 200 };
} catch (error) {
  console.log(error)
    return {
      status : 500
    }
  }
} 

export const getMoviesByARandomCountry = async () => {
  try {
  const uniqueCountries = await prisma.movie.findMany({
    select: {
      country: true,
    },
    distinct: ['country'],
    cacheStrategy: { ttl: 300 },
    
  });
  if (!uniqueCountries) {
    return { status: 400, message: 'Pas de pays' };
  }
  const getARadomCountry = uniqueCountries[Math.floor(Math.random() * uniqueCountries.length)];
  
  const movies = await prisma.movie.findMany({
    where: {
      country:  getARadomCountry.country
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 3
   });
  
   if (!movies) {
    return { status: 400, message: 'Pas de films' };
  }
  return { status: 200, movies, country: getARadomCountry.country};
  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
}

export const getMoviesByARandomGenre = async () => {
try {
  const uniqueGenres = await prisma.movie.findMany({
    select: {
      genre: true,
    },
    distinct: ['genre'],
    cacheStrategy: { ttl: 300 },
  });

  if (!uniqueGenres) {
    return { status: 400, message: 'Pas de genre' };
  }

  const result = extractUniqueGenres(uniqueGenres);
  const randomGenre = result[Math.floor(Math.random() * result.length)];
  const movies = await prisma.movie.findMany({
    where: {
      genre: {
        has: randomGenre,
      },
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5,
    cacheStrategy: { ttl: 300 },
   });
  
   if (!movies) {
    return { status: 400, message: 'Pas de films' };
  }
  return { status: 200, movies, genre: randomGenre};
    } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
}



export const addOrRemoveToFavorite = async (idUser:string, idMovie:string | undefined) => {
  if (!idMovie) {
    return { status: 400, message: 'Le film n\'est pas défini' };
  }

  try {
    // Vérifiez si l'association existe déjà
    const existingFavorite = await prisma.userFavoriteMovies.findUnique({
      where: {
        userId_movieId: {
          userId: idUser,
          movieId: idMovie
        }
      }
    });

    if (existingFavorite) {
      await prisma.userFavoriteMovies.delete({
        where: {
          userId_movieId: {
            userId: idUser,
            movieId: idMovie
          }
        }
      });
      revalidatePath(`/movies/${idMovie}`);
      return { status: 200, message: 'Supprimé des favoris avec succès' };
    }
     await prisma.userFavoriteMovies.create({
      data: {
        userId: idUser,
        movieId: idMovie
      }
    });
    revalidatePath(`/movies/${idMovie}`);
    return { status: 200, message: 'Ajouté aux favoris avec succès' };

  } catch (error) {
    console.log(error);
    return {
      status: 500,
      message: 'Erreur serveur'
    };
  }
};

export const getAllMovies =  async ()=> {
  
  try {

   const movieInDb = await prisma.movie.findMany({
    cacheStrategy: { ttl: 300 },})

    return {movieInDb, status: 200 };
  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
} 

export const fetchMovies = async ({ pageParam, search }: { pageParam: number, search: string }) => {
 
  try {

    if (!search.trim()) {
     
      const movies = await prisma.movie.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: pageParam,
        cacheStrategy: { ttl: 300 },
      });

      return {
        movies,
        status: 200,
        prevOffset: pageParam,
      };
    }

    // Extraction des paramètres de recherche
    const params = new URLSearchParams(search);
    const subtitles = params.get('subtitles');
    const language = params.get('language');
    const decade = params.get('decade');
    const genre = params.get('genre');
    const q = params.get('q');

    // Conditions pour la requête
    const conditions: {
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' };
        originalTitle?: { contains: string; mode: 'insensitive' };
        titleJapanese?: { contains: string; mode: 'insensitive' };
        titleEnglish?: { contains: string; mode: 'insensitive' };
      }>;
      AND?: Array<{
        subtitles?: { has: string };
        genre?: { has: string };
        language?: { contains: string };
        year?: { gte: number; lte: number };
      }>;
    } = {};

    // Ajout des conditions OR basées sur la recherche 'q'
    if (q && q.length > 0) {
      conditions.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { originalTitle: { contains: q, mode: 'insensitive' } },
        { titleJapanese: { contains: q, mode: 'insensitive' } },
        { titleEnglish: { contains: q, mode: 'insensitive' } },
        { director: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Ajout des conditions AND selon les paramètres facultatifs
    conditions.AND = [];
    if (subtitles) {
      conditions.AND.push({ subtitles: { has: subtitles } });
    }

    if (decade) {
      const startOfDecade = Number(decade); 
      const endOfDecade = startOfDecade + 9;

      conditions.AND.push({ year : {
        gte: startOfDecade, 
        lte: endOfDecade 
      }
     });
    }

    if (language) {
      conditions.AND.push({ country: { contains: language,  mode: 'insensitive' } });
    }

    if (genre) {
      conditions.AND.push({ genre: { has: genre } });
    }

    // Concaténation des conditions OR et AND si elles existent
    const whereClause = {
      ...(conditions.OR?.length ? { OR: conditions.OR } : {}),
      ...(conditions.AND?.length ? { AND: conditions.AND } : {}),
    };


    const movies = await prisma.movie.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: pageParam,
      cacheStrategy: { ttl: 300 },
    });

    return {
      movies,
      status: 200,
      prevOffset: pageParam,
    };

  } catch (err) {
    console.error('Erreur lors de la récupération des films:', err);
    return {
      status: 500,
      message: 'Erreur serveur. Impossible de récupérer les films.',
    };
  }
};

 export const getMoviesGenre = async () => {
  try {
    const uniqueGenres  = await prisma.movie.findMany({
      select: {
        genre: true,
      },
      cacheStrategy: { ttl: 300 },
      distinct: ['genre'],
      
    });
  
    if (!uniqueGenres) {
      return { status: 400, message: 'Pas de genre' };
    }

  const genres = uniqueGenres?.flatMap(item => item.genre)
    return { status: 200, genres};

      } catch (error) {
      console.log(error)
      return {
        status : 500
      }
    }
  }

  export const getMoviesCountries = async () => {
    try {
      const countriesValues  = await prisma.movie.findMany({
        select: {
          country: true,
        },
        cacheStrategy: { ttl: 300 * 60 },
        distinct: ['country'],
        
      });
    
      if (!countriesValues) {
        return { status: 400, message: 'Pas de pays' };
      }
  
    const countries = countriesValues?.flatMap(item => item.country)

      return { status: 200, countries};
  
        } catch (error) {
        console.log(error)
        return {
          status : 500
        }
      }
    }

export const getAllGenres = async () => {
  try {
    const genres = await prisma.genre.findMany();
    if (!genres) {
      return { status: 404, genres };
    }
    return { status: 200, genres };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
    };
  }
};

export const addGenre = async (genre: IGenre) => {
  try {
    const genres = await prisma.genre.create({
      data: genre,
    });
    if (!genres) {
      return { status: 404, genres };
    }
    revalidatePath(URL_GENRE_SECTION)
    return { status: 200, genres };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
    };
  }
};

export const updateGenre = async (genre: IGenre) => {
  try {
    const genres = await prisma.genre.update({
      where: {
        id: genre.id,
      },
      data: genre,
    });
    if (!genres) {
      return { status: 404, genres };
    }
    revalidatePath(URL_GENRE_SECTION)
    return { status: 200, genres };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
    };
  }
};

export const deleteGenre = async (id: string) => {
  try {
    const genres = await prisma.genre.delete({
      where: {
        id: id,
      },
    });
    if (!genres) {
      return { status: 404, genres };
    }
    revalidatePath(URL_GENRE_SECTION)
    return { status: 200, genres };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
    };
  }
};  