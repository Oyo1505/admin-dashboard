"use server"
import prisma from "@/lib/prisma";
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
      }
    })
   
  if (!movieInDb) {
    return { status: 404, message: 'Le film n\'existe pas' };
  }
  return {movie : movieInDb, status: 200 };
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
      orderBy: {
        createdAt: 'desc'
      },
      take: 6
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
  const uniqueCountries = await prisma.movie.findMany({
    select: {
      country: true,
    },
    distinct: ['country'],
    
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
    take: 5
   });
  
   if (!movies) {
    return { status: 400, message: 'Pas de films' };
  }
  return { status: 200, movies, country: getARadomCountry.country};
}

export const getMoviesByARandomGenre = async () => {

  const uniqueGenres = await prisma.movie.findMany({
    select: {
      genre: true,
    },
    distinct: ['genre'],
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
    take: 5
   });
  
   if (!movies) {
    return { status: 400, message: 'Pas de films' };
  }
  return { status: 200, movies, genre: randomGenre};
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

   const movieInDb = await prisma.movie.findMany()

    return {movieInDb, status: 200 };
  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
} 


export const fetchMovies = async ({ pageParam, search }: { pageParam: number, search: string }) => {
  console.log(search)
  try{
    const movies = search.trim() === '' ? await prisma.movie.findMany({
 
      orderBy: {
        createdAt: 'desc',
    },
      take:pageParam
   }):
     await prisma.movie.findMany({
      where:{
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { originalTitle: { contains: search, mode: 'insensitive' } },
        ],
      },
       orderBy: {
         createdAt: 'desc',
     },
       take:pageParam
    });
   
    if(movies){  
     return {
        movies,
       status : 200,
       prevOffset: pageParam
     }
   }else{
     return {
       status : 400
     }
   }
  }catch(err){
   console.log(err)
   return {
     status : 500
   }
  }
 };
 
