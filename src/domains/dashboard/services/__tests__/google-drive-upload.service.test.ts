import { GoogleDriveUploadService } from '../google-drive-upload.service';
import HttpStatus from '@/shared/constants/httpStatus';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock dependencies
jest.mock('googleapis', () => ({
  google: {
    drive: jest.fn(() => ({
      files: {
        create: jest.fn(),
      },
    })),
  },
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('@/lib/errors', () => ({
  logError: jest.fn(),
}));

// Mock auth with OAuth2 token response format
const mockGetAccessToken = jest.fn();
jest.mock('@/lib/google-api', () => ({
  auth: {
    getAccessToken: () => mockGetAccessToken(),
  },
}));

describe('GoogleDriveUploadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
    // Default: return valid token (GoogleAuth returns string directly)
    mockGetAccessToken.mockResolvedValue('mock-access-token');
  });

  describe('uploadFile - validation tests', () => {
    it('should return BAD_REQUEST for null file', async () => {
      const result = await GoogleDriveUploadService.uploadFile(
        null as unknown as File
      );

      expect(result.status).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toContain('Invalid file');
    });

    it('should return BAD_REQUEST for empty file', async () => {
      const emptyFile = new File([], 'empty.mp4', { type: 'video/mp4' });

      const result = await GoogleDriveUploadService.uploadFile(emptyFile);

      expect(result.status).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toContain('Invalid file');
    });

    it('should return BAD_REQUEST for file without name', async () => {
      const fileWithoutName = new File(['content'], '', { type: 'video/mp4' });

      const result = await GoogleDriveUploadService.uploadFile(fileWithoutName);

      expect(result.status).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toContain('file name is required');
    });
  });

  describe('initResumableUpload - validation tests', () => {
    it('should return BAD_REQUEST for empty file name', async () => {
      const result = await GoogleDriveUploadService.initResumableUpload(
        '',
        1000,
        'video/mp4'
      );

      expect(result.status).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toContain('File name is required');
    });

    it('should return BAD_REQUEST for whitespace-only file name', async () => {
      const result = await GoogleDriveUploadService.initResumableUpload(
        '   ',
        1000,
        'video/mp4'
      );

      expect(result.status).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toContain('File name is required');
    });

    it('should return BAD_REQUEST for zero file size', async () => {
      const result = await GoogleDriveUploadService.initResumableUpload(
        'test.mp4',
        0,
        'video/mp4'
      );

      expect(result.status).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toContain('File size must be greater than 0');
    });

    it('should return BAD_REQUEST for negative file size', async () => {
      const result = await GoogleDriveUploadService.initResumableUpload(
        'test.mp4',
        -100,
        'video/mp4'
      );

      expect(result.status).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toContain('File size must be greater than 0');
    });
  });

  describe('initResumableUpload - service account authentication', () => {
    it('should return UNAUTHORIZED when access token is null', async () => {
      mockGetAccessToken.mockResolvedValue(null);

      const result = await GoogleDriveUploadService.initResumableUpload(
        'test.mp4',
        1000,
        'video/mp4'
      );

      expect(result.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(result.message).toContain('Failed to get access token');
    });

    it('should return UNAUTHORIZED when token response is null', async () => {
      mockGetAccessToken.mockResolvedValue(null);

      const result = await GoogleDriveUploadService.initResumableUpload(
        'test.mp4',
        1000,
        'video/mp4'
      );

      expect(result.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(result.message).toContain('Failed to get access token');
    });

    it('should return UNAUTHORIZED when getAccessToken throws', async () => {
      mockGetAccessToken.mockRejectedValue(new Error('OAuth error'));

      const result = await GoogleDriveUploadService.initResumableUpload(
        'test.mp4',
        1000,
        'video/mp4'
      );

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toContain('Failed to initialize resumable upload');
    });
  });

  describe('initResumableUpload - Google Drive API interaction', () => {
    it('should successfully initialize resumable upload', async () => {
      const mockResumableUri =
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=abc123';

      mockFetch.mockResolvedValue({
        ok: true,
        headers: {
          get: (name: string) =>
            name === 'Location' ? mockResumableUri : null,
        },
      });

      const result = await GoogleDriveUploadService.initResumableUpload(
        'test.mp4',
        1000,
        'video/mp4'
      );

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data).toBeDefined();
      expect(result.data?.resumableUri).toBe(mockResumableUri);
      expect(result.data?.uploadId).toMatch(/^upload_\d+_[a-z0-9]+$/);
    });

    it('should call Google Drive API with correct headers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: {
          get: () => 'https://example.com/upload',
        },
      });

      await GoogleDriveUploadService.initResumableUpload(
        'test.mp4',
        2000000,
        'video/mp4',
        'https://myapp.com'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-access-token',
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Upload-Content-Type': 'video/mp4',
            'X-Upload-Content-Length': '2000000',
            Origin: 'https://myapp.com',
          }),
        })
      );
    });

    it('should return error when Google Drive API returns error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              error: { message: 'Quota exceeded', code: 403 },
            })
          ),
      });

      const result = await GoogleDriveUploadService.initResumableUpload(
        'test.mp4',
        1000,
        'video/mp4'
      );

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toContain('Failed to initialize resumable upload');
    });

    it('should return error when no resumable URI in response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: {
          get: () => null, // No Location header
        },
      });

      const result = await GoogleDriveUploadService.initResumableUpload(
        'test.mp4',
        1000,
        'video/mp4'
      );

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toContain('No resumable URI returned');
    });
  });

  describe('uploadChunk', () => {
    it('should return OK for incomplete chunk upload (308)', async () => {
      mockFetch.mockResolvedValue({
        status: 308,
      });

      const result = await GoogleDriveUploadService.uploadChunk(
        'upload_123',
        'https://example.com/upload',
        Buffer.from('chunk data'),
        0,
        9,
        1000
      );

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toContain('Chunk uploaded successfully');
    });

    it('should return file data for completed upload (200)', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        json: () =>
          Promise.resolve({
            id: 'file-123',
            name: 'test.mp4',
            webViewLink: 'https://drive.google.com/file/d/file-123/view',
            webContentLink: 'https://drive.google.com/uc?id=file-123',
          }),
      });

      const result = await GoogleDriveUploadService.uploadChunk(
        'upload_123',
        'https://example.com/upload',
        Buffer.from('final chunk'),
        990,
        999,
        1000
      );

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data).toBeDefined();
      expect(result.data?.fileId).toBe('file-123');
      expect(result.data?.name).toBe('test.mp4');
    });

    it('should return file data for completed upload (201)', async () => {
      mockFetch.mockResolvedValue({
        status: 201,
        json: () =>
          Promise.resolve({
            id: 'file-456',
            name: 'movie.mp4',
          }),
      });

      const result = await GoogleDriveUploadService.uploadChunk(
        'upload_456',
        'https://example.com/upload',
        Buffer.from('data'),
        0,
        999,
        1000
      );

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data?.fileId).toBe('file-456');
    });

    it('should return BAD_REQUEST for missing resumable URI', async () => {
      const result = await GoogleDriveUploadService.uploadChunk(
        'upload_123',
        '',
        Buffer.from('data'),
        0,
        9,
        1000
      );

      expect(result.status).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toContain('Resumable URI is required');
    });

    it('should return error status from failed chunk upload', async () => {
      mockFetch.mockResolvedValue({
        status: 400,
        text: () => Promise.resolve('Bad request'),
      });

      const result = await GoogleDriveUploadService.uploadChunk(
        'upload_123',
        'https://example.com/upload',
        Buffer.from('data'),
        0,
        9,
        1000
      );

      expect(result.status).toBe(400);
      expect(result.message).toContain('Chunk upload failed');
    });

    it('should send correct Content-Range header', async () => {
      mockFetch.mockResolvedValue({
        status: 308,
      });

      const chunk = Buffer.from('x'.repeat(100));

      await GoogleDriveUploadService.uploadChunk(
        'upload_123',
        'https://example.com/upload',
        chunk,
        500,
        599,
        10000
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/upload',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Length': '100',
            'Content-Range': 'bytes 500-599/10000',
          }),
          body: chunk,
        })
      );
    });
  });

  describe('getSession', () => {
    it('should return undefined for non-existent session', () => {
      const session = GoogleDriveUploadService.getSession('non-existent');

      expect(session).toBeUndefined();
    });
  });
});
