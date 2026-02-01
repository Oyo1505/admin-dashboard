import { verifyAdmin } from '@/lib/data/dal/core/auth';
import { DALError } from '@/lib/data/dal/core/errors';
import { logError } from '@/lib/errors';
import { auth } from '@/lib/google-api';
import HttpStatus from '@/shared/constants/httpStatus';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for large cleanups

/**
 * DELETE /api/upload/google-drive/clear
 * Delete ALL files owned by the service account
 * ⚠️ DANGEROUS: This will permanently delete all files!
 */
export async function DELETE(): Promise<Response> {
  try {
    await verifyAdmin();

    const drive = google.drive({ version: 'v3', auth });

    const deleted: string[] = [];
    const errors: string[] = [];
    let pageToken: string | undefined;

    // Get all files
    do {
      const response = await drive.files.list({
        pageSize: 100,
        pageToken,
        fields: 'nextPageToken, files(id, name, size)',
      });

      if (response.data.files) {
        for (const file of response.data.files) {
          if (file.id) {
            try {
              await drive.files.delete({ fileId: file.id });
              deleted.push(`${file.name} (${file.id})`);
              console.log(`Deleted: ${file.name}`);
            } catch (err) {
              errors.push(`${file.name} (${file.id}): ${err}`);
              console.error(`Failed to delete ${file.name}:`, err);
            }
          }
        }
      }

      pageToken = response.data.nextPageToken || undefined;
    } while (pageToken);

    // Get updated quota
    const quotaResponse = await drive.about.get({
      fields: 'storageQuota',
    });

    const quota = quotaResponse.data.storageQuota;

    return Response.json({
      success: true,
      deletedCount: deleted.length,
      deleted,
      errors: errors.length > 0 ? errors : undefined,
      newQuota: quota
        ? {
            usage: formatBytes(Number(quota.usage || 0)),
            available: formatBytes(
              Number(quota.limit || 0) - Number(quota.usage || 0)
            ),
          }
        : undefined,
    });
  } catch (error) {
    if (error instanceof DALError) {
      return Response.json(
        { error: error.message },
        { status: error.toHTTPStatus() }
      );
    }

    logError(error, 'DELETE /api/upload/google-drive/clear');
    return Response.json(
      { error: 'Failed to clear files' },
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
