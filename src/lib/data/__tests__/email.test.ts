import { EmailData } from '../email';
import prisma from '@/lib/prisma';
import { logError } from '@/lib/errors';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    authorizedEmail: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/errors', () => ({
  logError: jest.fn(),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: any) => fn,
}));

describe('EmailData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthorizedEmails', () => {
    it('should return all authorized emails successfully', async () => {
      const mockEmails = [
        { id: '1', email: 'user1@example.com' },
        { id: '2', email: 'user2@example.com' },
        { id: '3', email: 'user3@example.com' },
      ];

      (prisma.authorizedEmail.findMany as jest.Mock).mockResolvedValue(
        mockEmails
      );

      const result = await EmailData.getAuthorizedEmails();

      expect(result).toEqual({
        mails: mockEmails,
        status: 200,
      });
      expect(prisma.authorizedEmail.findMany).toHaveBeenCalledWith({
        orderBy: {
          email: 'asc',
        },
      });
    });

    it('should return 400 when no emails found', async () => {
      (prisma.authorizedEmail.findMany as jest.Mock).mockResolvedValue(null);

      const result = await EmailData.getAuthorizedEmails();

      expect(result).toEqual({
        status: 400,
      });
    });

    it('should return empty array when database returns empty', async () => {
      (prisma.authorizedEmail.findMany as jest.Mock).mockResolvedValue([]);

      const result = await EmailData.getAuthorizedEmails();

      expect(result).toEqual({
        mails: [],
        status: 200,
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      (prisma.authorizedEmail.findMany as jest.Mock).mockRejectedValue(
        mockError
      );

      const result = await EmailData.getAuthorizedEmails();

      expect(result).toEqual({
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(mockError, 'getAuthorizedEmails');
    });
  });

  describe('getAuthorizedEmailsPagination', () => {
    it('should return paginated emails with default pageParam', async () => {
      const mockEmails = [
        { id: '1', email: 'user1@example.com' },
        { id: '2', email: 'user2@example.com' },
      ];

      (prisma.authorizedEmail.findMany as jest.Mock).mockResolvedValue(
        mockEmails
      );

      const result = await EmailData.getAuthorizedEmailsPagination({});

      expect(result).toEqual({
        mails: mockEmails,
        status: 200,
      });
      expect(prisma.authorizedEmail.findMany).toHaveBeenCalledWith({
        orderBy: {
          email: 'asc',
        },
        skip: undefined,
        take: 5,
      });
    });

    it('should return paginated emails with specific pageParam', async () => {
      const mockEmails = [
        { id: '6', email: 'user6@example.com' },
        { id: '7', email: 'user7@example.com' },
      ];

      (prisma.authorizedEmail.findMany as jest.Mock).mockResolvedValue(
        mockEmails
      );

      const result = await EmailData.getAuthorizedEmailsPagination({
        pageParam: 5,
      });

      expect(result).toEqual({
        mails: mockEmails,
        status: 200,
      });
      expect(prisma.authorizedEmail.findMany).toHaveBeenCalledWith({
        orderBy: {
          email: 'asc',
        },
        skip: 5,
        take: 5,
      });
    });

    it('should return paginated emails with pageParam 0', async () => {
      const mockEmails = [{ id: '1', email: 'user1@example.com' }];

      (prisma.authorizedEmail.findMany as jest.Mock).mockResolvedValue(
        mockEmails
      );

      const result = await EmailData.getAuthorizedEmailsPagination({
        pageParam: 0,
      });

      expect(result).toEqual({
        mails: mockEmails,
        status: 200,
      });
      expect(prisma.authorizedEmail.findMany).toHaveBeenCalledWith({
        orderBy: {
          email: 'asc',
        },
        skip: 0,
        take: 5,
      });
    });

    it('should return 400 when no emails found', async () => {
      (prisma.authorizedEmail.findMany as jest.Mock).mockResolvedValue(null);

      const result = await EmailData.getAuthorizedEmailsPagination({
        pageParam: 10,
      });

      expect(result).toEqual({
        status: 400,
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database query failed');
      (prisma.authorizedEmail.findMany as jest.Mock).mockRejectedValue(
        mockError
      );

      const result = await EmailData.getAuthorizedEmailsPagination({
        pageParam: 0,
      });

      expect(result).toEqual({
        status: 500,
      });
      expect(logError).toHaveBeenCalledWith(
        mockError,
        'getAuthorizedEmailsPagination'
      );
    });
  });
});
