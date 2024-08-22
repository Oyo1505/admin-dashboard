//@ts-nocheck
"use server"
import prisma from "@/lib/prisma";
import { IMovie } from "@/models/movie/movie";
import { URL_ADD_MOVIE, URL_USERS } from "@/shared/route";
import { revalidatePath } from "next/cache";


export const getUsersWithPageParam = async (search:string, pageParam:number)=> {

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

   const movieInDb = await prisma.movie.findMany({cacheStrategy: { ttl: 60 }})

    return {movieInDb, status: 200 };
  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
} 

export const addMovieToDb =  async (movie:any)=> {
  
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
        originalTitle: movie.originalTitle,
        subtitles: movie.subtitles,
        language: movie.language,
        duration: Number(movie.duration),
        idGoogleDive: movie.idGoogleDive,
        year: Number(movie.year),
        genre: movie?.genre ? movie?.genre : [],
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
      originalTitle: movie.originalTitle,
      duration:  Number(movie.duration),
      idGoogleDive: movie.idGoogleDive,
      language: movie.language,
      subtitles: movie.subtitles,
      year: Number(movie.year),
      genre:movie.genre,
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
      cacheStrategy: { ttl: 60 },
    });
    return { movies , status: 200 };
  
  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
} 
