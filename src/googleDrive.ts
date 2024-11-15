"use server"; 
import { google, GoogleApis } from "googleapis";
import { revalidatePath } from "next/cache";
import { URL_ADD_MOVIE } from "./shared/route";
import { Readable } from "stream";

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

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    //@ts-ignore
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    universe_domain: process.env.UNIVERSE_DOMAIN,
  },
  scopes: ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/drive.file"],
});


export const getDataFromGoogleDrive = async () => {
  // allows you to use drive API methods e.g. listing files, creating files.
  const drive = google.drive({ version: "v3", auth })
  try {
    // const res = await drive.files.get({fileId: "1r-YRsOe6x5Sx7hc8VKk5WzkcD5TI5YJD"})
    const movies = await drive.files.list({q: "mimeType='video/mp4' and '1r-YRsOe6x5Sx7hc8VKk5WzkcD5TI5YJD' in parents"})
        
   // const files = res.data
    return { movies : movies.data.files}
  } catch (error: any) {
    console.error("Error fetching files:", error.message)
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
  } catch (error: any) {
    console.error("Error checking permissions:", error.message);
  }
};

const transferOwnership = async (id:string,fileId: string) => {
  const drive = google.drive({ version: "v3", auth })
  try {
    await drive.permissions.update({
      fileId,
      permissionId: id, 
      requestBody: {
        role: 'owner',
      },
      transferOwnership: true,
    });

  } catch (error: any) {
    console.error("Error transferring ownership:", error);
  }
};

export const deleteFileFromGoogleDrive = async (fileId: string) => {
  const drive = google.drive({ version: "v3", auth })
  try {
    const data = await checkPermissions(fileId);
    const user = data?.filter(d => d.emailAddress === process.env.CLIENT_EMAIL && d.role === 'writer')
    if(user && user[0].id){
      await transferOwnership(user[0].id,fileId);
    }
    revalidatePath(URL_ADD_MOVIE)

  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};


export const addFileToGoogleDrive = async (file: FormData)=>{
  if(!file) return null;
  const drive = google.drive({ version: "v3", auth })
  
  const formData = file.get('file') as File;

  if (!formData) throw new Error('No file found');
  if (formData.size < 1) throw new Error('File is empty');

  const buffer = Buffer.from(await formData.arrayBuffer());
  const bufferStream = Readable.from(buffer);
  try {
    const fileMetadata = {
      name: formData.name, 
      parents: ['1r-YRsOe6x5Sx7hc8VKk5WzkcD5TI5YJD'], 
    };
  
    const media = {
      mimeType: formData.type || 'application/octet-stream',
      body: bufferStream,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink, name',
    });
   
    return response.data.id;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
} 