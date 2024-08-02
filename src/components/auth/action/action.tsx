"use server"
import prisma from "@/lib/prisma";
import { User } from "next-auth";

export const getUserConnected = async (email:string): Promise<{ user?: User | undefined, status?:number | undefined }> => {
  try {
    const user = await prisma.user.findUnique({
      where:{email}
    })
    return {user : user ? user : {}, status:200 }
  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
}