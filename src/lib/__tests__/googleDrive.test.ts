/**
 * Tests for Google Drive functions
 * @module googleDrive.test
 */

import { deleteFileFromGoogleDrive, getDataFromGoogleDrive } from '@/googleDrive';
import { logError } from '@/lib/errors';
import HttpStatus from '@/shared/constants/httpStatus';

// Mock googleapis
const mockFilesDelete = jest.fn();
const mockFilesList = jest.fn();

jest.mock('googleapis', () => ({
  google: {
    drive: jest.fn(() => ({
      files: {
        delete: mockFilesDelete,
        list: mockFilesList,
      },
    })),
  },
}));

// Mock next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock lib/errors
jest.mock('@/lib/errors', () => ({
  logError: jest.fn(),
}));

// Mock google-api auth
jest.mock('@/lib/google-api', () => ({
  auth: 'mock-auth',
}));

describe('Google Drive Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteFileFromGoogleDrive', () => {
    describe('Input validation', () => {
      it('should return null when fileId is empty string', async () => {
        // Act
        const result = await deleteFileFromGoogleDrive('');

        // Assert
        expect(result).toBeNull();
        expect(mockFilesDelete).not.toHaveBeenCalled();
      });

      it('should return null when fileId is undefined', async () => {
        // Act
        const result = await deleteFileFromGoogleDrive(
          undefined as unknown as string
        );

        // Assert
        expect(result).toBeNull();
        expect(mockFilesDelete).not.toHaveBeenCalled();
      });

      it('should return null when fileId is null', async () => {
        // Act
        const result = await deleteFileFromGoogleDrive(null as unknown as string);

        // Assert
        expect(result).toBeNull();
        expect(mockFilesDelete).not.toHaveBeenCalled();
      });
    });

    describe('Successful deletion', () => {
      it('should delete file and return status 200', async () => {
        // Arrange
        const fileId = 'valid-file-id-123';
        const mockResponse = { status: 204, statusText: 'No Content' };
        mockFilesDelete.mockResolvedValue(mockResponse);

        // Act
        const result = await deleteFileFromGoogleDrive(fileId);

        // Assert
        expect(result).toEqual({
          data: mockResponse,
          status: HttpStatus.OK,
        });
        expect(mockFilesDelete).toHaveBeenCalledWith({ fileId });
        expect(mockFilesDelete).toHaveBeenCalledTimes(1);
      });

      it('should call revalidatePath after successful deletion', async () => {
        // Arrange
        const { revalidatePath } = require('next/cache');
        const fileId = 'file-to-revalidate';
        mockFilesDelete.mockResolvedValue({ status: 204 });

        // Act
        await deleteFileFromGoogleDrive(fileId);

        // Assert
        expect(revalidatePath).toHaveBeenCalled();
      });

      it('should handle different file ID formats', async () => {
        // Arrange
        const fileIds = [
          '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
          'abc123',
          'file_with_underscore',
          'file-with-dash',
        ];
        mockFilesDelete.mockResolvedValue({ status: 204 });

        // Act & Assert
        for (const fileId of fileIds) {
          const result = await deleteFileFromGoogleDrive(fileId);

          expect(result).toEqual({
            data: { status: 204 },
            status: HttpStatus.OK,
          });
          expect(mockFilesDelete).toHaveBeenCalledWith({ fileId });
        }
      });
    });

    describe('Error handling', () => {
      it('should throw error and log when Google Drive API fails', async () => {
        // Arrange
        const fileId = 'file-that-causes-error';
        const apiError = new Error('Google Drive API Error');
        mockFilesDelete.mockRejectedValue(apiError);

        // Act & Assert
        await expect(deleteFileFromGoogleDrive(fileId)).rejects.toThrow(
          'Google Drive API Error'
        );

        expect(logError).toHaveBeenCalledWith(
          apiError,
          'deleteFileFromGoogleDrive'
        );
      });

      it('should throw error when file not found (404)', async () => {
        // Arrange
        const fileId = 'non-existent-file';
        const notFoundError = {
          code: 404,
          message: 'File not found',
        };
        mockFilesDelete.mockRejectedValue(notFoundError);

        // Act & Assert
        await expect(deleteFileFromGoogleDrive(fileId)).rejects.toEqual(
          notFoundError
        );

        expect(logError).toHaveBeenCalledWith(
          notFoundError,
          'deleteFileFromGoogleDrive'
        );
      });

      it('should throw error when unauthorized (403)', async () => {
        // Arrange
        const fileId = 'unauthorized-file';
        const forbiddenError = {
          code: 403,
          message: 'The user does not have sufficient permissions',
        };
        mockFilesDelete.mockRejectedValue(forbiddenError);

        // Act & Assert
        await expect(deleteFileFromGoogleDrive(fileId)).rejects.toEqual(
          forbiddenError
        );

        expect(logError).toHaveBeenCalledWith(
          forbiddenError,
          'deleteFileFromGoogleDrive'
        );
      });

      it('should throw error when rate limited (429)', async () => {
        // Arrange
        const fileId = 'rate-limited-request';
        const rateLimitError = {
          code: 429,
          message: 'Rate Limit Exceeded',
        };
        mockFilesDelete.mockRejectedValue(rateLimitError);

        // Act & Assert
        await expect(deleteFileFromGoogleDrive(fileId)).rejects.toEqual(
          rateLimitError
        );

        expect(logError).toHaveBeenCalledWith(
          rateLimitError,
          'deleteFileFromGoogleDrive'
        );
      });

      it('should handle network errors', async () => {
        // Arrange
        const fileId = 'network-error-file';
        const networkError = new Error('ENOTFOUND');
        mockFilesDelete.mockRejectedValue(networkError);

        // Act & Assert
        await expect(deleteFileFromGoogleDrive(fileId)).rejects.toThrow(
          'ENOTFOUND'
        );

        expect(logError).toHaveBeenCalledWith(
          networkError,
          'deleteFileFromGoogleDrive'
        );
      });
    });

    describe('Edge cases', () => {
      it('should return NOT_FOUND when response is falsy', async () => {
        // Arrange
        const fileId = 'file-with-no-response';
        mockFilesDelete.mockResolvedValue(null);

        // Act
        const result = await deleteFileFromGoogleDrive(fileId);

        // Assert
        expect(result).toEqual({
          data: null,
          status: HttpStatus.NOT_FOUND,
        });
      });

      it('should return NOT_FOUND when response is undefined', async () => {
        // Arrange
        const fileId = 'file-with-undefined-response';
        mockFilesDelete.mockResolvedValue(undefined);

        // Act
        const result = await deleteFileFromGoogleDrive(fileId);

        // Assert
        expect(result).toEqual({
          data: null,
          status: HttpStatus.NOT_FOUND,
        });
      });
    });
  });

  describe('getDataFromGoogleDrive', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = {
        ...originalEnv,
        GOOGLE_DRIVE_FOLDER_ID: 'test-folder-id',
      };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    describe('Successful data retrieval', () => {
      it('should return movies from Google Drive', async () => {
        // Arrange
        const mockFiles = [
          {
            kind: 'drive#file',
            id: 'file-1',
            name: 'Movie 1.mp4',
            mimeType: 'video/mp4',
            owners: [{ displayName: 'John Doe', emailAddress: 'john@example.com' }],
          },
          {
            kind: 'drive#file',
            id: 'file-2',
            name: 'Movie 2.mp4',
            mimeType: 'video/mp4',
            owners: [{ displayName: 'Jane Doe', emailAddress: 'jane@example.com' }],
          },
        ];
        mockFilesList.mockResolvedValue({ data: { files: mockFiles } });

        // Act
        const result = await getDataFromGoogleDrive();

        // Assert
        expect(result).toEqual({ movies: mockFiles });
        expect(mockFilesList).toHaveBeenCalledWith({
          q: `mimeType='video/mp4' and 'test-folder-id' in parents`,
          fields:
            'files(kind, id, name, mimeType, owners(displayName, emailAddress))',
        });
      });

      it('should return empty array when no movies found', async () => {
        // Arrange
        mockFilesList.mockResolvedValue({ data: { files: [] } });

        // Act
        const result = await getDataFromGoogleDrive();

        // Assert
        expect(result).toEqual({ movies: [] });
      });

      it('should include owner information in response', async () => {
        // Arrange
        const mockFiles = [
          {
            id: 'file-with-owner',
            name: 'Owned Movie.mp4',
            owners: [
              {
                displayName: 'Service Account',
                emailAddress: 'service@project.iam.gserviceaccount.com',
              },
            ],
          },
        ];
        mockFilesList.mockResolvedValue({ data: { files: mockFiles } });

        // Act
        const result = await getDataFromGoogleDrive();

        // Assert
        expect(result?.movies?.[0].owners).toBeDefined();
        expect(result?.movies?.[0].owners?.[0].emailAddress).toBe(
          'service@project.iam.gserviceaccount.com'
        );
      });
    });

    describe('Error handling', () => {
      it('should return null and log error when API fails', async () => {
        // Arrange
        const apiError = new Error('API Error');
        mockFilesList.mockRejectedValue(apiError);

        // Act
        const result = await getDataFromGoogleDrive();

        // Assert
        expect(result).toBeNull();
        expect(logError).toHaveBeenCalledWith(apiError, 'getDataFromGoogleDrive');
      });

      it('should handle authentication errors', async () => {
        // Arrange
        const authError = { code: 401, message: 'Invalid credentials' };
        mockFilesList.mockRejectedValue(authError);

        // Act
        const result = await getDataFromGoogleDrive();

        // Assert
        expect(result).toBeNull();
        expect(logError).toHaveBeenCalledWith(
          authError,
          'getDataFromGoogleDrive'
        );
      });
    });
  });
});
