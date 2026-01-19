import { GoogleDriveUploadService } from '@/domains/dashboard/services/google-drive-upload.service';
import { verifyAdmin } from '@/lib/data/dal/core/auth';
import { DALError } from '@/lib/data/dal/core/errors';
import { logError } from '@/lib/errors';
import HttpStatus from '@/shared/constants/httpStatus';
import { UPLOAD_CONFIG } from '@/shared/constants/upload';

/**
 * Route Segment Config for App Router
 * This route handles small files (< 50MB) - larger files use chunked upload
 */
export const maxDuration = 120; // 2 minutes for small file uploads
export const dynamic = 'force-dynamic';

/**
 * POST /api/upload/google-drive
 * Upload a video file to Google Drive (for small files < 50MB)
 *
 * Security: Requires ADMIN role (DAL verification)
 * Accepts: multipart/form-data with 'file' field
 * Returns: { data: GoogleDriveUploadResult } or { error: string }
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // DAL Security Check - Admin only
    await verifyAdmin();

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // Validate file presence
    if (!file) {
      return Response.json(
        { error: 'No file provided' },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Validate file type
    if (!UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(file.type as 'video/mp4')) {
      return Response.json(
        { error: 'Invalid file type. Only MP4 files are allowed.' },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Validate file size
    const maxSizeBytes = UPLOAD_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return Response.json(
        {
          error: `File too large. Maximum size is ${UPLOAD_CONFIG.MAX_FILE_SIZE_MB}MB.`,
        },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Upload to Google Drive using service layer
    const result = await GoogleDriveUploadService.uploadFile(file);

    // Handle service errors
    if (result.status !== HttpStatus.OK) {
      return Response.json(
        { error: result.message },
        { status: result.status }
      );
    }

    // Return success response
    return Response.json({ data: result.data }, { status: HttpStatus.OK });
  } catch (error) {
    // Handle DAL errors (authentication/authorization)
    if (error instanceof DALError) {
      return Response.json(
        { error: error.message },
        { status: error.toHTTPStatus() }
      );
    }

    // Log and return generic error
    logError(error, 'POST /api/upload/google-drive');
    return Response.json(
      { error: 'Internal server error' },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
