import { GET } from '../quota/route';
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

const mockAboutGet = jest.fn();
jest.mock('@/lib/google-api', () => ({
  auth: {},
}));

jest.mock('googleapis', () => ({
  google: {
    drive: () => ({
      about: {
        get: () => mockAboutGet(),
      },
    }),
  },
}));

describe('GET /api/upload/google-drive/quota', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
  });

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

  describe('Quota retrieval', () => {
    it('should return quota information successfully', async () => {
      mockAboutGet.mockResolvedValue({
        data: {
          storageQuota: {
            limit: '16106127360', // 15 GB
            usage: '8053063680', // 7.5 GB
            usageInDrive: '8000000000',
            usageInDriveTrash: '53063680',
          },
        },
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(HttpStatus.OK);
      expect(data.limit).toBe(16106127360);
      expect(data.usage).toBe(8053063680);
      expect(data.available).toBe(16106127360 - 8053063680);
      expect(data.formatted).toBeDefined();
      expect(data.formatted.limit).toBe('15 GB');
      expect(data.formatted.percentUsed).toContain('%');
    });

    it('should handle zero quota values', async () => {
      mockAboutGet.mockResolvedValue({
        data: {
          storageQuota: {
            limit: '0',
            usage: '0',
            usageInDrive: '0',
            usageInDriveTrash: '0',
          },
        },
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(HttpStatus.OK);
      expect(data.limit).toBe(0);
      expect(data.formatted.percentUsed).toBe('N/A');
    });

    it('should return error when quota is not available', async () => {
      mockAboutGet.mockResolvedValue({
        data: {
          storageQuota: null,
        },
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(data.error).toContain('Failed to retrieve quota');
    });

    it('should handle Google Drive API errors', async () => {
      mockAboutGet.mockRejectedValue(new Error('API Error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(data.error).toBe('Failed to get quota');
    });
  });

  describe('formatBytes utility', () => {
    it('should format bytes correctly', async () => {
      mockAboutGet.mockResolvedValue({
        data: {
          storageQuota: {
            limit: '1073741824', // 1 GB
            usage: '1048576', // 1 MB
            usageInDrive: '1024', // 1 KB
            usageInDriveTrash: '0',
          },
        },
      });

      const response = await GET();
      const data = await response.json();

      expect(data.formatted.limit).toBe('1 GB');
      expect(data.formatted.usage).toBe('1 MB');
      expect(data.formatted.usageInDrive).toBe('1 KB');
      expect(data.formatted.usageInTrash).toBe('0 B');
    });
  });
});
