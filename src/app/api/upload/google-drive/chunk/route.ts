import { GoogleDriveUploadService } from '@/domains/dashboard/services/google-drive-upload.service';
import { verifyAdmin } from '@/lib/data/dal/core/auth';
import { DALError } from '@/lib/data/dal/core/errors';
import { logError } from '@/lib/errors';
import HttpStatus from '@/shared/constants/httpStatus';

/**
 * Route Segment Config for App Router
 * - maxDuration: Maximum execution time for serverless function (in seconds)
 * - dynamic: Force dynamic rendering for this route
 */
export const maxDuration = 300; // 5 minutes max for large chunk uploads
export const dynamic = 'force-dynamic';

/**
 * PUT /api/upload/google-drive/chunk
 * Upload a chunk to an existing resumable upload session
 *
 * Security: Requires ADMIN role (DAL verification)
 * Headers:
 *   - X-Upload-Id: Upload session ID
 *   - X-Resumable-Uri: Google Drive resumable upload URI
 *   - X-Chunk-Start: Start byte position
 *   - X-Chunk-End: End byte position
 *   - X-File-Size: Total file size
 * Body: Raw chunk data (application/octet-stream)
 * Returns: { data: GoogleDriveUploadResult } for last chunk or { message: string } for intermediate chunks
 */
export async function PUT(request: Request): Promise<Response> {
  try {
    // DAL Security Check - Admin only
    await verifyAdmin();

    // Extract headers
    const uploadId = request.headers.get('X-Upload-Id');
    const resumableUri = request.headers.get('X-Resumable-Uri');
    const chunkStart = request.headers.get('X-Chunk-Start');
    const chunkEnd = request.headers.get('X-Chunk-End');
    const fileSize = request.headers.get('X-File-Size');

    // Validate required headers
    if (!uploadId) {
      return Response.json(
        { error: 'X-Upload-Id header is required' },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    if (!resumableUri) {
      return Response.json(
        { error: 'X-Resumable-Uri header is required' },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    if (!chunkStart || !chunkEnd || !fileSize) {
      return Response.json(
        { error: 'X-Chunk-Start, X-Chunk-End, and X-File-Size headers are required' },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Parse numeric values
    const startByte = parseInt(chunkStart, 10);
    const endByte = parseInt(chunkEnd, 10);
    const totalSize = parseInt(fileSize, 10);

    if (isNaN(startByte) || isNaN(endByte) || isNaN(totalSize)) {
      return Response.json(
        { error: 'Invalid numeric values in headers' },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Get chunk data from request body
    const arrayBuffer = await request.arrayBuffer();
    const chunk = Buffer.from(arrayBuffer);

    // Basic validation - chunk should have some data
    if (chunk.length === 0) {
      return Response.json(
        { error: 'Empty chunk received' },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Update endByte to match actual chunk size
    // This handles the last chunk which may be smaller than the full chunk size
    const actualEndByte = startByte + chunk.length - 1;

    // Upload chunk using actual byte range
    const result = await GoogleDriveUploadService.uploadChunk(
      uploadId,
      resumableUri,
      chunk,
      startByte,
      actualEndByte,
      totalSize
    );

    // Handle service errors
    if (result.status !== HttpStatus.OK) {
      return Response.json(
        { error: result.message },
        { status: result.status }
      );
    }

    // Return response
    // If data is present, it's the final response with file info
    // If not, it's an intermediate chunk acknowledgment
    if (result.data) {
      return Response.json({ data: result.data }, { status: HttpStatus.OK });
    }

    return Response.json(
      { message: result.message || 'Chunk uploaded successfully' },
      { status: HttpStatus.OK }
    );
  } catch (error) {
    // Handle DAL errors (authentication/authorization)
    if (error instanceof DALError) {
      return Response.json(
        { error: error.message },
        { status: error.toHTTPStatus() }
      );
    }

    // Log and return generic error
    logError(error, 'PUT /api/upload/google-drive/chunk');
    return Response.json(
      { error: 'Internal server error' },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
