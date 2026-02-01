import { GET, DELETE } from '../files/route';
import HttpStatus from '@/shared/constants/httpStatus';
import { DALError } from '@/lib/data/dal/core/errors';

// Mock dependencies
const mockVerifyAdmin = jest.fn();
jest.mock('@/lib/data/dal/core/auth', () => ({
  verifyAdmin: () => mockVerifyAdmin(),
}));

jest.mock('@/lib/errors', () => ({
  logError: jest.fn(),
}));

const mockFilesList = jest.fn();
const mockFilesDelete = jest.fn();
jest.mock('@/lib/google-api', () => ({
  auth: {},
}));

jest.mock('googleapis', () => ({
  google: {
    drive: () => ({
      files: {
        list: () => mockFilesList(),
        delete: (params: { fileId: string }) => mockFilesDelete(params),
      },
    }),
  },
}));

describe('/api/upload/google-drive/files', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
  });

  describe('GET - List files', () => {
    describe('Authentication', () => {
      it('should return 401 when user is not authenticated', async () => {
        mockVerifyAdmin.mockRejectedValue(
          new DALError('UNAUTHORIZED', 'Not authenticated')
        );

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(data.error).toBe('Not authenticated');
      });

      it('should return 403 when user is not admin', async () => {
        mockVerifyAdmin.mockRejectedValue(
          new DALError('FORBIDDEN', 'Admin privileges required')
        );

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(data.error).toBe('Admin privileges required');
      });
    });

    describe('File listing', () => {
      it('should return empty list when no files exist', async () => {
        mockFilesList.mockResolvedValue({
          data: {
            files: [],
            nextPageToken: undefined,
          },
        });

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(HttpStatus.OK);
        expect(data.count).toBe(0);
        expect(data.totalSize).toBe(0);
        expect(data.files).toEqual([]);
      });

      it('should return list of files with formatted sizes', async () => {
        mockFilesList.mockResolvedValue({
          data: {
            files: [
              {
                id: 'file-1',
                name: 'movie1.mp4',
                size: '1073741824', // 1 GB
                mimeType: 'video/mp4',
                createdTime: '2024-01-01T00:00:00Z',
                modifiedTime: '2024-01-02T00:00:00Z',
              },
              {
                id: 'file-2',
                name: 'movie2.mp4',
                size: '2147483648', // 2 GB
                mimeType: 'video/mp4',
                createdTime: '2024-01-03T00:00:00Z',
                modifiedTime: '2024-01-04T00:00:00Z',
              },
            ],
            nextPageToken: undefined,
          },
        });

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(HttpStatus.OK);
        expect(data.count).toBe(2);
        expect(data.totalSize).toBe(3221225472); // 3 GB
        expect(data.totalSizeFormatted).toBe('3 GB');
        expect(data.files).toHaveLength(2);
        expect(data.files[0].sizeFormatted).toBe('1 GB');
        expect(data.files[1].sizeFormatted).toBe('2 GB');
      });

      it('should handle pagination', async () => {
        mockFilesList
          .mockResolvedValueOnce({
            data: {
              files: [
                {
                  id: 'file-1',
                  name: 'movie1.mp4',
                  size: '100',
                  mimeType: 'video/mp4',
                  createdTime: '2024-01-01T00:00:00Z',
                  modifiedTime: '2024-01-01T00:00:00Z',
                },
              ],
              nextPageToken: 'token-page-2',
            },
          })
          .mockResolvedValueOnce({
            data: {
              files: [
                {
                  id: 'file-2',
                  name: 'movie2.mp4',
                  size: '200',
                  mimeType: 'video/mp4',
                  createdTime: '2024-01-02T00:00:00Z',
                  modifiedTime: '2024-01-02T00:00:00Z',
                },
              ],
              nextPageToken: undefined,
            },
          });

        const response = await GET();
        const data = await response.json();

        expect(data.count).toBe(2);
        expect(data.totalSize).toBe(300);
        expect(mockFilesList).toHaveBeenCalledTimes(2);
      });

      it('should handle files with missing properties', async () => {
        mockFilesList.mockResolvedValue({
          data: {
            files: [
              {
                id: 'file-1',
                // name, size, mimeType, etc. are missing
              },
            ],
            nextPageToken: undefined,
          },
        });

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(HttpStatus.OK);
        expect(data.files[0].name).toBe('Unknown');
        expect(data.files[0].size).toBe('0');
        expect(data.files[0].mimeType).toBe('unknown');
      });

      it('should handle Google Drive API errors', async () => {
        mockFilesList.mockRejectedValue(new Error('API Error'));

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(data.error).toBe('Failed to list files');
      });
    });
  });

  describe('DELETE - Delete file', () => {
    const createMockRequest = (body: object): Request => {
      return {
        json: () => Promise.resolve(body),
      } as Request;
    };

    describe('Authentication', () => {
      it('should return 401 when user is not authenticated', async () => {
        mockVerifyAdmin.mockRejectedValue(
          new DALError('UNAUTHORIZED', 'Not authenticated')
        );

        const request = createMockRequest({ fileId: 'file-1' });
        const response = await DELETE(request);
        const data = await response.json();

        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(data.error).toBe('Not authenticated');
      });
    });

    describe('Validation', () => {
      it('should return BAD_REQUEST when fileId is missing', async () => {
        const request = createMockRequest({});
        const response = await DELETE(request);
        const data = await response.json();

        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(data.error).toBe('fileId is required');
      });

      it('should return BAD_REQUEST when fileId is empty string', async () => {
        const request = createMockRequest({ fileId: '' });
        const response = await DELETE(request);
        const data = await response.json();

        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(data.error).toBe('fileId is required');
      });
    });

    describe('File deletion', () => {
      it('should delete file successfully', async () => {
        mockFilesDelete.mockResolvedValue({});

        const request = createMockRequest({ fileId: 'file-123' });
        const response = await DELETE(request);
        const data = await response.json();

        expect(response.status).toBe(HttpStatus.OK);
        expect(data.success).toBe(true);
        expect(data.message).toContain('file-123');
        expect(mockFilesDelete).toHaveBeenCalledWith({ fileId: 'file-123' });
      });

      it('should handle Google Drive API errors', async () => {
        mockFilesDelete.mockRejectedValue(new Error('File not found'));

        const request = createMockRequest({ fileId: 'non-existent' });
        const response = await DELETE(request);
        const data = await response.json();

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(data.error).toBe('Failed to delete file');
      });
    });
  });
});
