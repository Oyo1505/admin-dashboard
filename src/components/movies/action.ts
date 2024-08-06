"use server"
import prisma from "@/lib/prisma";
import { IMovie } from "@/models/movie/movie";

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