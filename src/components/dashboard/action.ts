"use server"
import prisma from "@/lib/prisma";
import { URL_DASHBOARD } from "@/shared/route";
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