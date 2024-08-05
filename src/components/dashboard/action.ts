"use server"
import prisma from "@/lib/prisma";
import { IMovie } from "@/models/movie/movie";
import { URL_ADD_MOVIE, URL_DASHBOARD, URL_MOVIES } from "@/shared/route";
import { revalidatePath } from "next/cache";

export const getUsersWithPageParam = async (search:string, pageParam:number)=> {

 try{
  

    const users = search.trim() === '' ?
    await prisma.user.findMany({
      take:pageParam
     })
    : await prisma.user.findMany({
    where:{
      name: search
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

export const deleteUserById =  async (id:string)=> {
  
  try {
    await prisma.user.delete({
      where:{
        id
      },
    })
    revalidatePath(URL_DASHBOARD)
    return {status: 200 };
  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
} 

export const addMovieToDb =  async (movie:IMovie)=> {
  
  try {
  const link = `${URL_MOVIES}/test-1`
   const movieInDb = await prisma.movie.findUnique({
      where:{
        link
      }
    })
    if(movieInDb){
      return {status: 409, message :'Le film existe déjà' };
    }
    await prisma.movie.create({
      data: {
        title: movie.title,
        image: 'test.jpg',
        link: `${URL_MOVIES}/test-1`,
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