'use server';
import { Buffer } from 'buffer';
import { google } from 'googleapis';
import { revalidatePath } from 'next/cache';
import { Readable } from 'stream';
import { logError } from './lib/errors';
import { auth } from './lib/google-api';
import { URL_DASHBOARD_ROUTE } from './shared/route';

export const getDataFromGoogleDrive = async () => {
  // allows you to use drive API methods e.g. listing files, creating files.
  const drive = google.drive({ version: 'v3', auth });
  try {
    const movies = await drive.files.list({
      q: `mimeType='video/mp4' and '${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents`,
    });

    // const files = res.data
    return { movies: movies.data.files };
  } catch (error) {
    logError(error, 'getDataFromGoogleDrive');
    return null;
  }
};
const checkPermissions = async (fileId: string) => {
  const drive = google.drive({ version: 'v3', auth });
  try {
    const permissions = await drive.permissions.list({
      fileId,
      fields: 'permissions(id, role, type, emailAddress)',
    });
    return permissions.data.permissions;
  } catch (error) {
    logError(error, 'checkPermissions');
  }
};

export const deleteFileFromGoogleDrive = async (
  fileId: string
): Promise<{ status: number }> => {
  const drive = google.drive({ version: 'v3', auth });

  try {
    const permissions = await checkPermissions(fileId);
    const user = permissions?.filter(
      (d) => d.emailAddress === process.env.CLIENT_EMAIL && d.role === 'owner'
    );
    if (user && user[0].id) {
      const response = await drive.files.delete({ fileId });
      if (response.statusText === 'No Content') {
        revalidatePath(URL_DASHBOARD_ROUTE.movie);
        return { status: 200 };
      }
    }
    return { status: 404 };
  } catch (error) {
    logError(error, 'deleteFileFromGoogleDrive');
    throw error;
  }
};

export const addFileToGoogleDriveAction = async (
  formData: File
): Promise<{ data: unknown; status: number } | null> => {
  if (!formData) return null;
  const drive = google.drive({ version: 'v3', auth });

  if (!formData) throw new Error('No file found');
  if (formData.size < 1) throw new Error('File is empty');

  // Créer un ReadableStream directement à partir de l'objet File

  const buffer = Buffer.from(await formData.arrayBuffer());

  const bufferStream = Readable.from(buffer);
  try {
    const fileMetadata = {
      name: formData.name,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
    };

    const media = {
      mimeType: 'application/octet-stream',
      body: bufferStream,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      uploadType: 'resumable',
      media: media,
      fields: 'id, webViewLink, webContentLink, name',
    });

    if (response) {
      revalidatePath(URL_DASHBOARD_ROUTE.movie);
      return { data: response, status: 200 };
    }
    return { data: null, status: 404 };
  } catch (error) {
    logError(error, 'addFileToGoogleDriveAction');
    throw error;
  }
};
