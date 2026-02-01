import { DELETE } from '../clear/route';
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
const mockAboutGet = jest.fn();

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
      about: {
        get: () => mockAboutGet(),
      },
    }),
  },
}));

// Suppress console.log and console.error during tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('DELETE /api/upload/google-drive/clear', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
    mockAboutGet.mockResolvedValue({
      data: {
        storageQuota: {
          limit: '16106127360',
          usage: '0',
        },
      },
    });
  });

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockVerifyAdmin.mockRejectedValue(
        new DALError('UNAUTHORIZED', 'Not authenticated')
      );

      const response = await DELETE();
      const data = await response.json();

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(data.error).toBe('Not authenticated');
    });

    it('should return 403 when user is not admin', async () => {
      mockVerifyAdmin.mockRejectedValue(
        new DALError('FORBIDDEN', 'Admin privileges required')
      );

      const response = await DELETE();
      const data = await response.json();

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(data.error).toBe('Admin privileges required');
    });
  });

  describe('Clear all files', () => {
    it('should return success when no files exist', async () => {
      mockFilesList.mockResolvedValue({
        data: {
          files: [],
          nextPageToken: undefined,
        },
      });

      const response = await DELETE();
      const data = await response.json();

      expect(response.status).toBe(HttpStatus.OK);
      expect(data.success).toBe(true);
      expect(data.deletedCount).toBe(0);
      expect(data.deleted).toEqual([]);
    });

    it('should delete all files successfully', async () => {
      mockFilesList.mockResolvedValue({
        data: {
          files: [
            { id: 'file-1', name: 'movie1.mp4', size: '1000' },
            { id: 'file-2', name: 'movie2.mp4', size: '2000' },
          ],
          nextPageToken: undefined,
        },
      });
      mockFilesDelete.mockResolvedValue({});

      const response = await DELETE();
      const data = await response.json();

      expect(response.status).toBe(HttpStatus.OK);
      expect(data.success).toBe(true);
      expect(data.deletedCount).toBe(2);
      expect(data.deleted).toContain('movie1.mp4 (file-1)');
      expect(data.deleted).toContain('movie2.mp4 (file-2)');
      expect(mockFilesDelete).toHaveBeenCalledTimes(2);
      expect(mockFilesDelete).toHaveBeenCalledWith({ fileId: 'file-1' });
      expect(mockFilesDelete).toHaveBeenCalledWith({ fileId: 'file-2' });
    });

    it('should handle pagination when clearing files', async () => {
      mockFilesList
        .mockResolvedValueOnce({
          data: {
            files: [{ id: 'file-1', name: 'movie1.mp4', size: '1000' }],
            nextPageToken: 'token-page-2',
          },
        })
        .mockResolvedValueOnce({
          data: {
            files: [{ id: 'file-2', name: 'movie2.mp4', size: '2000' }],
            nextPageToken: undefined,
          },
        });
      mockFilesDelete.mockResolvedValue({});

      const response = await DELETE();
      const data = await response.json();

      expect(data.deletedCount).toBe(2);
      expect(mockFilesList).toHaveBeenCalledTimes(2);
    });

    it('should continue deleting even if some files fail', async () => {
      mockFilesList.mockResolvedValue({
        data: {
          files: [
            { id: 'file-1', name: 'movie1.mp4', size: '1000' },
            { id: 'file-2', name: 'movie2.mp4', size: '2000' },
            { id: 'file-3', name: 'movie3.mp4', size: '3000' },
          ],
          nextPageToken: undefined,
        },
      });

      // First and third succeed, second fails
      mockFilesDelete
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('Permission denied'))
        .mockResolvedValueOnce({});

      const response = await DELETE();
      const data = await response.json();

      expect(response.status).toBe(HttpStatus.OK);
      expect(data.success).toBe(true);
      expect(data.deletedCount).toBe(2);
      expect(data.errors).toHaveLength(1);
      expect(data.errors[0]).toContain('movie2.mp4');
    });

    it('should return updated quota after clearing', async () => {
      mockFilesList.mockResolvedValue({
        data: {
          files: [{ id: 'file-1', name: 'movie1.mp4', size: '1000' }],
          nextPageToken: undefined,
        },
      });
      mockFilesDelete.mockResolvedValue({});
      mockAboutGet.mockResolvedValue({
        data: {
          storageQuota: {
            limit: '16106127360',
            usage: '1000000',
          },
        },
      });

      const response = await DELETE();
      const data = await response.json();

      expect(data.newQuota).toBeDefined();
      expect(data.newQuota.usage).toBeDefined();
      expect(data.newQuota.available).toBeDefined();
    });

    it('should skip files without id', async () => {
      mockFilesList.mockResolvedValue({
        data: {
          files: [
            { id: 'file-1', name: 'movie1.mp4', size: '1000' },
            { name: 'no-id.mp4', size: '2000' }, // Missing id
            { id: 'file-3', name: 'movie3.mp4', size: '3000' },
          ],
          nextPageToken: undefined,
        },
      });
      mockFilesDelete.mockResolvedValue({});

      const response = await DELETE();
      const data = await response.json();

      expect(data.deletedCount).toBe(2);
      expect(mockFilesDelete).toHaveBeenCalledTimes(2);
    });

    it('should handle Google Drive API errors', async () => {
      mockFilesList.mockRejectedValue(new Error('API Error'));

      const response = await DELETE();
      const data = await response.json();

      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(data.error).toBe('Failed to clear files');
    });
  });
});
