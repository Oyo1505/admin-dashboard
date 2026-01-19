import { GoogleDriveUploadService } from '../google-drive-upload.service';
import HttpStatus from '@/shared/constants/httpStatus';

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
jest.mock('@/lib/google-api', () => ({
  auth: {
    getAccessToken: jest.fn().mockResolvedValue('mock-access-token'),
  },
}));

describe('GoogleDriveUploadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
