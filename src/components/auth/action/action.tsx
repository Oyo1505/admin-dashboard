"use server"
import prisma from "@/lib/prisma";
import { EmailAuthorized } from "@/models/auth/auth";
import { URL_USERS } from "@/shared/route";
import { User } from "next-auth";
import { revalidatePath } from "next/cache";

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

export const postAuthorizedEmail = async (email:string, ): Promise<{ status?:number | undefined, message?:string | undefined }> => {
  try {

    const user = await prisma.authorizedEmail.findUnique({
      where:{email}
    })
    if(!user){
      await prisma.authorizedEmail.create({
        data:{
          email: email,
        }
      })
      revalidatePath(URL_USERS)
      return {status:200}
    }
    return {message:'User Already authorized', status:409 }
  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
}

export const getAuthorizedEmails = async ( ): Promise<{ status?:number | undefined, mails?:any[] | undefined }> => {
  try {
    const userauthorizedEmails = await prisma.authorizedEmail.findMany() 
  
    if (!userauthorizedEmails) {
      return { status: 400 };
    }

    return {mails:userauthorizedEmails, status:200 }
  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
}

export const deleteEmailAuthorized = async (email:string): Promise<{ status?:number | undefined, }> => {
  try {
    const emailDeleted = await prisma.authorizedEmail.delete({
      where:{email}
    })
  
    if(!emailDeleted){
      return {status:400}
    }
    revalidatePath(URL_USERS)
    return { status:200 }
  } catch (error) {
    console.log(error)
    return {
      status : 500
    }
  }
}