import { EmailAuthorizationService } from '../email-authorization.service';
import { EmailData } from '@/lib/data/email';
import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    authorizedEmail: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('@/lib/data/email', () => ({
  EmailData: {
    getAuthorizedEmails: jest.fn(),
  },
}));

jest.mock('@/lib/errors', () => ({
  handlePrismaError: jest.fn((error) => ({
    statusCode: 500,
    message: 'Database error',
  })),
  logError: jest.fn(),
}));

describe('EmailAuthorizationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidEmailFormat', () => {
    it('should return true for valid email formats', () => {
      expect(
        EmailAuthorizationService.isValidEmailFormat('user@example.com')
      ).toBe(true);
      expect(
        EmailAuthorizationService.isValidEmailFormat('test.user@domain.co.uk')
      ).toBe(true);
      expect(
        EmailAuthorizationService.isValidEmailFormat('user+tag@example.com')
      ).toBe(true);
    });

    it('should return false for invalid email formats', () => {
      expect(
        EmailAuthorizationService.isValidEmailFormat('invalid.email')
      ).toBe(false);
      expect(EmailAuthorizationService.isValidEmailFormat('no-at-sign')).toBe(
        false
      );
      expect(
        EmailAuthorizationService.isValidEmailFormat('missing-domain@')
      ).toBe(false);
      expect(
        EmailAuthorizationService.isValidEmailFormat('@missing-local.com')
      ).toBe(false);
      expect(EmailAuthorizationService.isValidEmailFormat('')).toBe(false);
    });
  });

  describe('normalizeEmail', () => {
    it('should trim whitespace and convert to lowercase', () => {
      expect(
        EmailAuthorizationService.normalizeEmail('  User@Example.COM  ')
      ).toBe('user@example.com');
      expect(
        EmailAuthorizationService.normalizeEmail('UPPERCASE@DOMAIN.COM')
      ).toBe('uppercase@domain.com');
      expect(
        EmailAuthorizationService.normalizeEmail('  spaces@example.com')
      ).toBe('spaces@example.com');
    });

    it('should handle already normalized emails', () => {
      expect(EmailAuthorizationService.normalizeEmail('user@example.com')).toBe(
        'user@example.com'
      );
    });
  });

  describe('isEmailAlreadyAuthorized', () => {
    it('should return true when email exists in database', async () => {
      (prisma.authorizedEmail.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'authorized@example.com',
      });

      const result = await EmailAuthorizationService.isEmailAlreadyAuthorized(
        'authorized@example.com'
      );

      expect(result).toBe(true);
      expect(prisma.authorizedEmail.findUnique).toHaveBeenCalledWith({
        where: { email: 'authorized@example.com' },
      });
    });

    it('should return false when email does not exist', async () => {
      (prisma.authorizedEmail.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await EmailAuthorizationService.isEmailAlreadyAuthorized(
        'notfound@example.com'
      );

      expect(result).toBe(false);
    });

    it('should throw error when database query fails', async () => {
      const mockError = new Error('Database connection failed');
      (prisma.authorizedEmail.findUnique as jest.Mock).mockRejectedValue(
        mockError
      );

      await expect(
        EmailAuthorizationService.isEmailAlreadyAuthorized('test@example.com')
      ).rejects.toThrow('Database connection failed');

      expect(logError).toHaveBeenCalledWith(
        mockError,
        'isEmailAlreadyAuthorized'
      );
    });
  });

  describe('isEmailAuthorized', () => {
    it('should return true when email is in authorized list', async () => {
      (EmailData.getAuthorizedEmails as jest.Mock).mockResolvedValue({
        mails: [
          { id: '1', email: 'user@example.com' },
          { id: '2', email: 'admin@example.com' },
        ],
        status: 200,
      });

      const result =
        await EmailAuthorizationService.isEmailAuthorized('user@example.com');

      expect(result).toBe(true);
    });

    it('should return false when email is not in authorized list', async () => {
      (EmailData.getAuthorizedEmails as jest.Mock).mockResolvedValue({
        mails: [{ id: '1', email: 'other@example.com' }],
        status: 200,
      });

      const result = await EmailAuthorizationService.isEmailAuthorized(
        'notauthorized@example.com'
      );

      expect(result).toBe(false);
    });

    it('should return false when status is not 200', async () => {
      (EmailData.getAuthorizedEmails as jest.Mock).mockResolvedValue({
        status: 500,
      });

      const result =
        await EmailAuthorizationService.isEmailAuthorized('user@example.com');

      expect(result).toBe(false);
      expect(logError).toHaveBeenCalledWith(
        {},
        'Failed to fetch authorized emails in isEmailAuthorized'
      );
    });

    it('should return false when mails is undefined', async () => {
      (EmailData.getAuthorizedEmails as jest.Mock).mockResolvedValue({
        mails: undefined,
        status: 200,
      });

      const result =
        await EmailAuthorizationService.isEmailAuthorized('user@example.com');

      expect(result).toBe(false);
    });

    it('should return false and log error on exception', async () => {
      const mockError = new Error('Service failed');
      (EmailData.getAuthorizedEmails as jest.Mock).mockRejectedValue(mockError);

      const result =
        await EmailAuthorizationService.isEmailAuthorized('user@example.com');

      expect(result).toBe(false);
      expect(logError).toHaveBeenCalledWith(mockError, 'isEmailAuthorized');
    });
  });

  describe('authorizeEmail', () => {
    it('should authorize a valid email successfully', async () => {
      (prisma.authorizedEmail.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.authorizedEmail.create as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'newuser@example.com',
      });

      const result = await EmailAuthorizationService.authorizeEmail(
        'newuser@example.com'
      );

      expect(result).toEqual({
        status: 200,
        message: 'Email authorized successfully',
      });
      expect(prisma.authorizedEmail.create).toHaveBeenCalledWith({
        data: { email: 'newuser@example.com' },
      });
    });

    it('should normalize email before authorizing', async () => {
      (prisma.authorizedEmail.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.authorizedEmail.create as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'user@example.com',
      });

      const result = await EmailAuthorizationService.authorizeEmail(
        '  USER@EXAMPLE.COM  '
      );

      expect(result.status).toBe(200);
      expect(prisma.authorizedEmail.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
      expect(prisma.authorizedEmail.create).toHaveBeenCalledWith({
        data: { email: 'user@example.com' },
      });
    });

    it('should return 400 when email is empty', async () => {
      const result = await EmailAuthorizationService.authorizeEmail('');

      expect(result).toEqual({
        status: 400,
        message: 'Email is required',
      });
      expect(prisma.authorizedEmail.create).not.toHaveBeenCalled();
    });

    it('should return 400 when email is only whitespace', async () => {
      const result = await EmailAuthorizationService.authorizeEmail('   ');

      expect(result).toEqual({
        status: 400,
        message: 'Email is required',
      });
    });

    it('should return 400 when email format is invalid', async () => {
      const result =
        await EmailAuthorizationService.authorizeEmail('invalid-email');

      expect(result).toEqual({
        status: 400,
        message: 'Invalid email format',
      });
      expect(prisma.authorizedEmail.create).not.toHaveBeenCalled();
    });

    it('should return 409 when email is already authorized', async () => {
      (prisma.authorizedEmail.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'existing@example.com',
      });

      const result = await EmailAuthorizationService.authorizeEmail(
        'existing@example.com'
      );

      expect(result).toEqual({
        status: 409,
        message: 'User Already authorized',
      });
      expect(prisma.authorizedEmail.create).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      (prisma.authorizedEmail.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.authorizedEmail.create as jest.Mock).mockRejectedValue(mockError);

      const result =
        await EmailAuthorizationService.authorizeEmail('user@example.com');

      expect(result).toEqual({
        status: 500,
        message: 'Database error',
      });
      expect(logError).toHaveBeenCalledWith(
        mockError,
        'EmailAuthorizationService.authorizeEmail'
      );
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('revokeEmailAuthorization', () => {
    it('should revoke email authorization successfully', async () => {
      (prisma.authorizedEmail.delete as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'user@example.com',
      });

      const result =
        await EmailAuthorizationService.revokeEmailAuthorization(
          'user@example.com'
        );

      expect(result).toEqual({
        status: 200,
        message: 'Email authorization revoked',
      });
      expect(prisma.authorizedEmail.delete).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
    });

    it('should normalize email before revoking', async () => {
      (prisma.authorizedEmail.delete as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'user@example.com',
      });

      const result = await EmailAuthorizationService.revokeEmailAuthorization(
        '  USER@EXAMPLE.COM  '
      );

      expect(result.status).toBe(200);
      expect(prisma.authorizedEmail.delete).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
    });

    it('should return 400 when email is empty', async () => {
      const result =
        await EmailAuthorizationService.revokeEmailAuthorization('');

      expect(result).toEqual({
        status: 400,
        message: 'Email is required',
      });
      expect(prisma.authorizedEmail.delete).not.toHaveBeenCalled();
    });

    it('should return 400 when email is only whitespace', async () => {
      const result =
        await EmailAuthorizationService.revokeEmailAuthorization('   ');

      expect(result).toEqual({
        status: 400,
        message: 'Email is required',
      });
    });

    it('should return 404 when emailDeleted is null', async () => {
      (prisma.authorizedEmail.delete as jest.Mock).mockResolvedValue(null);

      const result = await EmailAuthorizationService.revokeEmailAuthorization(
        'notfound@example.com'
      );

      expect(result).toEqual({
        status: 404,
        message: 'Email not found',
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Delete failed');
      (prisma.authorizedEmail.delete as jest.Mock).mockRejectedValue(mockError);

      const result =
        await EmailAuthorizationService.revokeEmailAuthorization(
          'user@example.com'
        );

      expect(result).toEqual({
        status: 500,
        message: 'Database error',
      });
      expect(logError).toHaveBeenCalledWith(
        mockError,
        'EmailAuthorizationService.revokeEmailAuthorization'
      );
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('validateEmailForAuth', () => {
    it('should validate authorized email successfully', async () => {
      (EmailData.getAuthorizedEmails as jest.Mock).mockResolvedValue({
        mails: [{ id: '1', email: 'authorized@example.com' }],
        status: 200,
      });

      const result = await EmailAuthorizationService.validateEmailForAuth(
        'authorized@example.com'
      );

      expect(result).toEqual({
        isAuthorized: true,
        message: 'Email is authorized',
      });
    });

    it('should normalize email before validation', async () => {
      (EmailData.getAuthorizedEmails as jest.Mock).mockResolvedValue({
        mails: [{ id: '1', email: 'user@example.com' }],
        status: 200,
      });

      const result = await EmailAuthorizationService.validateEmailForAuth(
        '  USER@EXAMPLE.COM  '
      );

      expect(result.isAuthorized).toBe(true);
    });

    it('should return error when email is undefined', async () => {
      const result =
        await EmailAuthorizationService.validateEmailForAuth(undefined);

      expect(result).toEqual({
        isAuthorized: false,
        message: 'Email is required',
      });
    });

    it('should return error when email is not authorized', async () => {
      (EmailData.getAuthorizedEmails as jest.Mock).mockResolvedValue({
        mails: [{ id: '1', email: 'other@example.com' }],
        status: 200,
      });

      const result = await EmailAuthorizationService.validateEmailForAuth(
        'unauthorized@example.com'
      );

      expect(result).toEqual({
        isAuthorized: false,
        message:
          'Your email is not authorized to access this application. Please contact an administrator.',
      });
    });

    it('should handle errors and return authorization failed', async () => {
      // Mock isEmailAuthorized to throw error (simulating internal error)
      const mockError = new Error('Validation failed');
      (EmailData.getAuthorizedEmails as jest.Mock).mockRejectedValue(mockError);

      const result =
        await EmailAuthorizationService.validateEmailForAuth(
          'user@example.com'
        );

      // isEmailAuthorized returns false on error, so validation result shows not authorized
      expect(result).toEqual({
        isAuthorized: false,
        message:
          'Your email is not authorized to access this application. Please contact an administrator.',
      });
      expect(logError).toHaveBeenCalledWith(mockError, 'isEmailAuthorized');
    });
  });
});
