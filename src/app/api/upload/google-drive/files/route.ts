import { verifyAdmin } from '@/lib/data/dal/core/auth';
import { DALError } from '@/lib/data/dal/core/errors';
import { logError } from '@/lib/errors';
import { auth } from '@/lib/google-api';
import HttpStatus from '@/shared/constants/httpStatus';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

interface DriveFile {
  id: string;
  name: string;
  size: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
}

/**
 * GET /api/upload/google-drive/files
 * List all files owned by the service account
 */
export async function GET(): Promise<Response> {
  try {
    await verifyAdmin();

    const drive = google.drive({ version: 'v3', auth });

    const files: DriveFile[] = [];
    let pageToken: string | undefined;

    // Paginate through all files
    do {
      const response = await drive.files.list({
        pageSize: 100,
        pageToken,
        fields: 'nextPageToken, files(id, name, size, mimeType, createdTime, modifiedTime)',
        orderBy: 'createdTime desc',
      });

      if (response.data.files) {
        for (const file of response.data.files) {
          files.push({
            id: file.id || '',
            name: file.name || 'Unknown',
            size: file.size || '0',
            mimeType: file.mimeType || 'unknown',
            createdTime: file.createdTime || '',
            modifiedTime: file.modifiedTime || '',
          });
        }
      }

      pageToken = response.data.nextPageToken || undefined;
    } while (pageToken);

    // Calculate total size
    const totalSize = files.reduce((acc, file) => acc + Number(file.size), 0);

    return Response.json({
      count: files.length,
      totalSize,
      totalSizeFormatted: formatBytes(totalSize),
      files: files.map((file) => ({
        ...file,
        sizeFormatted: formatBytes(Number(file.size)),
      })),
    });
  } catch (error) {
    if (error instanceof DALError) {
      return Response.json(
        { error: error.message },
        { status: error.toHTTPStatus() }
      );
    }

    logError(error, 'GET /api/upload/google-drive/files');
    return Response.json(
      { error: 'Failed to list files' },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/upload/google-drive/files
 * Delete a file by ID (pass fileId in body)
 */
export async function DELETE(request: Request): Promise<Response> {
  try {
    await verifyAdmin();

    const body = await request.json();
    const { fileId } = body;

    if (!fileId) {
      return Response.json(
        { error: 'fileId is required' },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    const drive = google.drive({ version: 'v3', auth });

    await drive.files.delete({ fileId });

    return Response.json({
      success: true,
      message: `File ${fileId} deleted successfully`,
    });
  } catch (error) {
    if (error instanceof DALError) {
      return Response.json(
        { error: error.message },
        { status: error.toHTTPStatus() }
      );
    }

    logError(error, 'DELETE /api/upload/google-drive/files');
    return Response.json(
      { error: 'Failed to delete file' },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
