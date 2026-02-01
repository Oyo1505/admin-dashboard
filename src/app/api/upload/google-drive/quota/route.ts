import { verifyAdmin } from '@/lib/data/dal/core/auth';
import { DALError } from '@/lib/data/dal/core/errors';
import { logError } from '@/lib/errors';
import { auth } from '@/lib/google-api';
import HttpStatus from '@/shared/constants/httpStatus';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

/**
 * GET /api/upload/google-drive/quota
 * Get Google Drive storage quota for the service account
 */
export async function GET(): Promise<Response> {
  try {
    await verifyAdmin();

    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.about.get({
      fields: 'storageQuota',
    });

    const quota = response.data.storageQuota;

    if (!quota) {
      return Response.json(
        { error: 'Failed to retrieve quota information' },
        { status: HttpStatus.INTERNAL_SERVER_ERROR }
      );
    }

    const limit = Number(quota.limit || 0);
    const usage = Number(quota.usage || 0);
    const usageInDrive = Number(quota.usageInDrive || 0);
    const usageInTrash = Number(quota.usageInDriveTrash || 0);

    return Response.json({
      limit,
      usage,
      usageInDrive,
      usageInTrash,
      available: limit - usage,
      // Human readable
      formatted: {
        limit: formatBytes(limit),
        usage: formatBytes(usage),
        usageInDrive: formatBytes(usageInDrive),
        usageInTrash: formatBytes(usageInTrash),
        available: formatBytes(limit - usage),
        percentUsed: limit > 0 ? ((usage / limit) * 100).toFixed(1) + '%' : 'N/A',
      },
    });
  } catch (error) {
    if (error instanceof DALError) {
      return Response.json(
        { error: error.message },
        { status: error.toHTTPStatus() }
      );
    }

    logError(error, 'GET /api/upload/google-drive/quota');
    return Response.json(
      { error: 'Failed to get quota' },
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
