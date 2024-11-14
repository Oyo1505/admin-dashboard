//@ts-nocheck
"use server"
import prisma from "@/lib/prisma";
import { IDirector } from "@/models/director/director";
import { IMovie } from "@/models/movie/movie";
import { URL_ADD_MOVIE, URL_USERS } from "@/shared/route";
import { revalidatePath } from "next/cache";


export const getUsersWithPageParam = async (search:string, pageParam:number):Promise<{users: User[], newOffset: number | null, status: number}>  =>{

 try{
    const users = search.trim() === '' ?
    await prisma.user.findMany({
      take:pageParam,
      cacheStrategy: { ttl: 60 },
     })
    : await prisma.user.findMany({
    where:{
      name: search
    },
    cacheStrategy: { ttl: 60 },
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

export const deleteUserById =  async (id:string)=> {

  try {
    await prisma.user.delete({
      where:{
        id
      },
    })
   
    return { status: 200 };
  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
} 
export const getAllMovies =  async ()=> {
  
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

export const addMovieToDb =  async (movie:IMovie)=> {
  
    try {
  
   const movieInDb = await prisma.movie.findUnique({
      where:{
        idGoogleDive: movie.idGoogleDive
      }
    })
    if(movieInDb){
      return {status: 409, message :'Le film existe déjà' };
    }
    
    await prisma.movie.create({
      data: {
        title: movie.title ?? 'Nouveau film',
        titleEnglish: movie.titleEnglish,
        titleJapanese: movie.titleJapanese,
        link: movie?.link,
        image: movie?.link,
        director : movie?.director,
        imdbId : movie?.imdbId,
        originalTitle: movie.originalTitle,
        subtitles: movie.subtitles,
        language: movie.language,
        genresIds:{
          create: movie.genresIds.map((genreId) => ({
            genre: {
              connect: { id: genreId }
            }
          }))
        },
        duration: Number(movie.duration),
        idGoogleDive: movie.idGoogleDive,
        year: Number(movie.year),
        country: movie.country,
        synopsis: movie.synopsis,
        trailer: movie.trailer,
      },
    })

    revalidatePath(URL_ADD_MOVIE)
    return {status: 200 };
  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
} 

export const editMovieToDb =  async (movie:IMovie)=> {
  
  try {

  const movieInDb = await prisma.movie.findUnique({
    where:{
      id: movie.id
    }
  })

  if (!movieInDb) {
    return { status: 404, message: 'Le film n\'existe pas' };
  }
  
  await prisma.movie.update({
    where: {
      id: movie.id
    },
    data: {
      title: movie.title,
      titleEnglish: movie.titleEnglish,
      titleJapanese: movie.titleJapanese,
      link: movie?.link,
      image: movie?.link,
      director: movie?.director,
      imdbId: movie?.imdbId,
      originalTitle: movie.originalTitle,
      duration:  Number(movie.duration),
      idGoogleDive: movie.idGoogleDive,
      language: movie.language,
      subtitles: movie.subtitles,
      year: Number(movie.year),
      genresIds:{
        deleteMany:{},
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

  revalidatePath(URL_ADD_MOVIE)
  return {status: 200 };
} catch (error) {
  console.log(error)
    return {
      status : 500
    }
  }
} 

export const deleteMovieById =  async (id:string)=> {
  
  try {
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

export const getFavoriteMovies =  async (id:string)=> {
  
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
    return { movies , status: 200 };
  
  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
} 

export const getDirectorFromSection =  async () => {
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

export const createDirectorFromSection =  async (formDirector:IDirector) => {
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

export const deleteDirectorFromSection =  async (id:string) => {

  try
  {
    const director = await prisma.directorSection.delete({
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