"use server";
import { Buffer } from 'buffer';
import { google, GoogleApis } from "googleapis";
import { revalidatePath } from "next/cache";
import { Readable } from "stream";
import { auth } from "./lib/google-api";
import { URL_DASHBOARD_ROUTE } from "./shared/route";


export const findExistingFile = async (driveService:GoogleApis, fileName:string) => {
    try {
        const response = await driveService.files.list({
            q: `name='${fileName}'`,
            fields: "files(id, webViewLink)",
        });const files = response.data.files;
        if (files && files.length > 0) {
            return files[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error searching for file:", error);
        throw error;
    }
};

export const getDataFromGoogleDrive = async () => {
  // allows you to use drive API methods e.g. listing files, creating files.
  const drive = google.drive({ version: "v3", auth })
  try {
    // const res = await drive.files.get({fileId: "1r-YRsOe6x5Sx7hc8VKk5WzkcD5TI5YJD"})
    const movies = await drive.files.list({q: "mimeType='video/mp4' and '1r-YRsOe6x5Sx7hc8VKk5WzkcD5TI5YJD' in parents"})

   // const files = res.data
    return { movies : movies.data.files}
  } catch (error) {
    console.error("Error fetching files:", error)
    return null
  }
}
const checkPermissions = async (fileId: string) => {
  const drive = google.drive({ version: "v3", auth })
  try {
    const permissions = await drive.permissions.list({
      fileId,
      fields: 'permissions(id, role, type, emailAddress)',
    });
    return permissions.data.permissions
  } catch (error) {
    console.error("Error checking permissions:", error);
  }
};

export const deleteFileFromGoogleDrive = async (fileId: string): Promise<{status: number}> => {
  const drive = google.drive({ version: "v3", auth })

  try {
    const permissions = await checkPermissions(fileId);
    const user = permissions?.filter(d => d.emailAddress === process.env.CLIENT_EMAIL && d.role === 'owner')
   if(user && user[0].id){
    const response = await drive.files.delete({fileId})
    if(response.statusText === 'No Content' ){
      revalidatePath(URL_DASHBOARD_ROUTE.movie)
      return {status : 200};
    }
   }
   return {status : 404};
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

export const addFileToGoogleDriveAction = async (formData: File): Promise<{data: unknown, status: number} | null>  =>{

  if(!formData) return null;
  const drive = google.drive({ version: "v3", auth })

  //const formData = file.get('file') as File;

  if (!formData) throw new Error('No file found');
  if (formData.size < 1) throw new Error('File is empty');

  // Créer un ReadableStream directement à partir de l'objet File

  const buffer = Buffer.from(await formData.arrayBuffer());

  const bufferStream = Readable.from(buffer);
  try {
    const fileMetadata = {
      name: formData.name,
      parents: ['1r-YRsOe6x5Sx7hc8VKk5WzkcD5TI5YJD'],
    };

    const media = {
      mimeType:'application/octet-stream',
      body: bufferStream,
    };

    const response = await drive.files.create(
      {
      requestBody: fileMetadata,
      uploadType: 'resumable',
      media: media,
      fields: 'id, webViewLink, webContentLink, name',
    },
  );

    if(response){
      revalidatePath(URL_DASHBOARD_ROUTE.movie);
      return {data : response, status : 200};
    }
    return {data : null, status : 404};
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}