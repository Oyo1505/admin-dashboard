//@ts-nocheck
"use server"
import prisma from "@/lib/prisma";
import { IDirector } from "@/models/director/director";
import { IFavoriteMovieResponse, IMovie } from "@/models/movie/movie";
import { User } from "@/models/user/user";
import { URL_DASHBOARD_MOVIE, URL_DASHBOARD_USERS, URL_HOME } from "@/shared/route";
import { revalidatePath } from "next/cache";


export const getUsersWithPageParam = async (search:string, pageParam:number):Promise<{users: User[], newOffset: number | null, status: number}>  =>{

 try{
    const users = search.trim() === '' ?
    await prisma.user.findMany({
      take:pageParam,
     })
    : await prisma.user.findMany({
    where:{
      name: {
        contains: search,
        mode: 'insensitive'
      }
    },
    take:pageParam
   });

      if(users){  
        const newOffset = users.length >= 20 ? pageParam + 20 : null;
        return {
          users,
          status : 200,
          newOffset: newOffset
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

export const deleteUserById = async ({id, user, token}:{id : string, user: User, token: any}): Promise<{ status: number, message?: string }> => {
  if (!id) {
    return {
      status: 400,
      message: 'User ID is required'
    };
  }

  try {
    if (!token) {
      return {
        status: 401,
        message: 'Token is required'
      };
    }
    if (user.role !== 'ADMIN') {
      return {
        status: 403,
        message: 'Unauthorized'
      };
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id }
    });

    if (!userToDelete) {
      return {
        status: 404,
        message: 'User not found'
      };
    }

    await prisma.user.delete({
      where: { id }
    });

    revalidatePath(URL_DASHBOARD_USERS);
    return { status: 200, message: 'User deleted successfully' };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      message: 'Internal server error'
    };
  }
};

export const deleteUserByIdFromUser = async (id): Promise<{ status: number, message?: string }> => {
  if (!id) {
    return {
      status: 400,
      message: 'User ID is required'
    };
  }

  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id }
    });

    if (!userToDelete) {
      return {
        status: 404,
        message: 'User not found'
      };
    }

    await prisma.user.delete({
      where: { id }
    });

    revalidatePath(URL_HOME);
    return { status: 200, message: 'User deleted successfully' };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      message: 'Internal server error'
    };
  }
};
export const getAllMovies =  async (): Promise<{movieInDb: IMovie[], status: number}> => {
  
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
        createdAt: 'desc'
      }
    });
    return {movieInDb, status: 200 };
  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
} 

export const addMovieToDb = async (movie: IMovie, user:User): Promise<{ status: number; message: string }> => {
  
  try {
    if(user.role !== 'ADMIN') return {
      status: 403,
      message: 'Unautorized'
    }
    const existingMovie = await prisma.movie.findUnique({
      where: { idGoogleDive: movie.idGoogleDive },
    });
    if (existingMovie) {
      return { status: 409, message: 'Le film existe déjà' };
    }

    if (!movie.genresIds || !Array.isArray(movie.genresIds) || movie.genresIds.length === 0) {
      throw new Error('Au moins un genre est requis.');
    }

    await prisma.movie.create({
      data: {
        title: movie?.title,
        titleEnglish: movie?.titleEnglish,
        titleJapanese: movie?.titleJapanese,
        link: movie?.link,
        image: movie?.link,
        director: movie?.director,
        imdbId: movie?.imdbId,
        originalTitle: movie?.originalTitle,
        duration: Number(movie?.duration),
        idGoogleDive: movie?.idGoogleDive,
        language: movie?.language,
        subtitles: movie?.subtitles || [],
        year: Number(movie?.year),
        genresIds: {
          create: movie?.genresIds?.map((genreId) => ({
            genre: {
              connect: { id: genreId },
            },
          })),
        },        
        country: movie?.country,
        synopsis: movie?.synopsis,
        trailer: movie?.trailer,
      },
    });
    

    revalidatePath(URL_DASHBOARD_MOVIE)
    return { status: 200, message: 'Film ajouté avec succès' };

  } catch (error) {
    console.error('Erreur lors de l’ajout du film:', error);
    return { status: 500, message: 'Erreur interne' };
  }
};


export const editMovieToDb = async (movie: IMovie, user:User): Promise<{status: number, message: string}> => {

  try {
    if(user.role !== 'ADMIN') return {
      status: 403,
      message: 'Unautorized'
    }
    const movieInDb = await prisma.movie.findUnique({
      where: {
        id: movie.id
      }
    })

    if (!movieInDb) {
      return { status: 404, message: 'Le film n\'existe pas' };
    }

    // Vérifier que les genres sont valides
    if (!movie.genresIds || !Array.isArray(movie.genresIds) || movie.genresIds.length === 0) {
      return { status: 400, message: 'Au moins un genre est requis' };
    }

    // Mise à jour du film
    await prisma.movie.update({
      where: {
        id: movie.id
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
        idGoogleDrive: movie.idGoogleDrive,
        language: movie.language,
        subtitles: movie.subtitles || [],
        year: Number(movie.year),
        genresIds: {
          deleteMany: {},
          create: movie.genresIds.map((genreId) => ({
            genre: {
              connect: { id: genreId }
            }
          }))
        },
        country: movie.country,
        synopsis: movie.synopsis,
        trailer: movie.trailer,
      },
    })

    revalidatePath(URL_DASHBOARD_MOVIE)
    return { status: 200, message: 'Film modifié avec succès' };

  } catch (error) {
    console.error('Erreur lors de la modification du film:', error);
    return {
      status: 500,
      message: 'Erreur interne du serveur'
    }
  }
}

export const deleteMovieById =  async (id:string, user:User): Promise<{status: number}> => {
  
  try {
    if(user.role !== 'ADMIN') return {
      status: 403,
      message: 'Unautorized'
    }
   if(id){
    await prisma.movie.delete({
        where: {
          id,
        },
      });
      revalidatePath('/dashboard/add-movie')
    return { status: 200 };
   }
  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
} 


export const publishedMovieById =  async (id:string): Promise<{publish: boolean, status: number}> => {
 
  try {
   if(id){
    const findedMovie = await prisma.movie.findUnique({
      where: {
        id,
      },
    })
    if(findedMovie){
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
    console.log(error)
    return { publish: false, status: 500 };
  }
} 

export const getFavoriteMovies = async (id: string): Promise<{ movies: IFavoriteMovieResponse[], status: number }> => {  
  try {
    const movies = await prisma.userFavoriteMovies.findMany({
      relationLoadStrategy: 'join',
      where: {
        userId: id
      },
      include: {
        movie: true
      },
    });
    return { movies, status: 200 };
  
  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
} 

export const getDirectorFromSection =  async (): Promise<{directorMovies: IDirector | null, status: number}> => {
  try {
    const directorMovies = await prisma.directorSection.findFirst();
    return { directorMovies , status: 200 };
  
  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
} 

export const createDirectorFromSection =  async (formDirector:IDirector): Promise<{director: IDirector, status: number}> => {
  try{
    const director = await prisma.directorSection.create({
      data: {
        director: formDirector.director,
        imageBackdrop: formDirector.image,
      },
    })
    revalidatePath('dashboard/director')
    return { director , status: 200 };

  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
} 

export const updateDirectorFromSection =  async (formDirector:IDirector): Promise<{director: IDirector, status: number}> => {
 
  try
  {
    if(formDirector.id){
    const director = await prisma.directorSection.update({
      where: {
        id: formDirector.id
      },
      data: {
        director: formDirector.director,
        imageBackdrop: formDirector.imageBackdrop,
      },
    })
    revalidatePath('dashboard/director')
    return { director , status: 200 };
  }
  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
} 

export const deleteDirectorFromSection =  async (id:string): Promise<{director: IDirector, status: number}> => {

  try
  {
    await prisma.directorSection.delete({
      where: {
        id,
      },
    })
    revalidatePath('dashboard/director')
    return { status: 200 };
  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
} 

export const getDirectorMovies = async ():Promise<{directorMovies: IMovie[] | null, director: string | null, imageBackdrop: string | null, status: number}> => {
  
  try {
    const director  = await getDirectorFromSection()
    if(director && director?.directorMovies?.director){
     
      const directorMovies = await prisma.movie.findMany({
        where:{
          publish: true,
          director: director?.directorMovies.director
        },
        cacheStrategy: { ttl: 60 * 5 },
       })

      return { directorMovies, director:director?.directorMovies?.director, imageBackdrop:director?.directorMovies?.imageBackdrop, status: 200 };
    }else{
      return { status: 200 };
    }

  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
} 