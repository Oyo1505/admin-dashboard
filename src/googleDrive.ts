"use server"; // if you are using reactjs remove this line this is for nextjs only
import { google, GoogleApis } from "googleapis";

export const findExistingFile = async (driveService:GoogleApis, fileName:string) => {
    try {
        const response = await driveService.files.list({
            q: `name='${fileName}'`,
            fields: "files(id, webViewLink)",
        });const files = response.data.files;
        if (files && files.length > 0) {
            return files[0]; // Return the first matching file
        } else {
            return null; // File not found
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
  scopes: ["https://www.googleapis.com/auth/drive"],
});


export const getData = async () => {
  // allows you to use drive API methods e.g. listing files, creating files.
  const drive = google.drive({ version: "v3", auth })
  try {
    const res = await drive.files.get({fileId: "1r-YRsOe6x5Sx7hc8VKk5WzkcD5TI5YJD"})
    const movies = await drive.files.list({q: "mimeType='video/mp4' and '1r-YRsOe6x5Sx7hc8VKk5WzkcD5TI5YJD' in parents"})
        
    const files = res.data
    return { files, movie : movies.data}
  } catch (error: any) {
    console.error("Error fetching files:", error.message)
    return null
  }
}