"use server"
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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