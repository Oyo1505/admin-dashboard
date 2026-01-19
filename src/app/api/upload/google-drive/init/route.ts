import { GoogleDriveUploadService } from '@/domains/dashboard/services/google-drive-upload.service';
import { verifyAdmin } from '@/lib/data/dal/core/auth';
import { DALError } from '@/lib/data/dal/core/errors';
import { logError } from '@/lib/errors';
import HttpStatus from '@/shared/constants/httpStatus';
import { UPLOAD_CONFIG } from '@/shared/constants/upload';

/**
 * Route Segment Config for App Router
 */
export const maxDuration = 60; // 1 minute for session initialization
export const dynamic = 'force-dynamic';

/**
 * Request body interface for init endpoint
 */
interface InitRequestBody {
  fileName: string;
  fileSize: number;
  mimeType: string;
}

/**
 * POST /api/upload/google-drive/init
 * Initialize a resumable upload session for large files
 *
 * Security: Requires ADMIN role (DAL verification)
 * Accepts: JSON body with fileName, fileSize, mimeType
 * Returns: { uploadId, resumableUri } or { error: string }
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // DAL Security Check - Admin only
    await verifyAdmin();

    // Parse request body
    const body = (await request.json()) as InitRequestBody;
    const { fileName, fileSize, mimeType } = body;

    // Validate required fields
    if (!fileName?.trim()) {
      return Response.json(
        { error: 'File name is required' },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    if (!fileSize || fileSize < 1) {
      return Response.json(
        { error: 'File size must be greater than 0' },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Validate file size limit
    const maxSizeBytes = UPLOAD_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024;
    if (fileSize > maxSizeBytes) {
      return Response.json(
        {
          error: `File too large. Maximum size is ${UPLOAD_CONFIG.MAX_FILE_SIZE_MB}MB.`,
        },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Validate MIME type
    const validMimeType = mimeType || 'video/mp4';
    if (!UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(validMimeType as 'video/mp4')) {
      return Response.json(
        { error: 'Invalid file type. Only MP4 files are allowed.' },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Get origin from request for CORS support in direct browser uploads
    const origin = request.headers.get('origin') || undefined;

    // Initialize resumable upload with origin for CORS
    const result = await GoogleDriveUploadService.initResumableUpload(
      fileName,
      fileSize,
      validMimeType,
      origin
    );

    // Handle service errors
    if (result.status !== HttpStatus.OK) {
      return Response.json(
        { error: result.message },
        { status: result.status }
      );
    }

    // Return success response
    return Response.json(result.data, { status: HttpStatus.OK });
  } catch (error) {
    // Handle DAL errors (authentication/authorization)
    if (error instanceof DALError) {
      return Response.json(
        { error: error.message },
        { status: error.toHTTPStatus() }
      );
    }

    // Log and return generic error
    logError(error, 'POST /api/upload/google-drive/init');
    return Response.json(
      { error: 'Internal server error' },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
