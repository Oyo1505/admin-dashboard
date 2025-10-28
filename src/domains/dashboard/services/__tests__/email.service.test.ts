import { EmailService } from '../email.service';
import { handlePrismaError, logError } from '@/lib/errors';
import nodemailer from 'nodemailer';

// Mock dependencies
jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(),
  },
}));

jest.mock('@/lib/errors', () => ({
  handlePrismaError: jest.fn((error) => ({
    statusCode: 500,
    message: 'Email error',
  })),
  logError: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variables for tests
    process.env.SMTP_SERVICE = 'gmail';
    process.env.EMAIL_GMAIL = 'test@example.com';
    process.env.SMTP_PASS = 'test-password';
  });

  describe('sendMail', () => {
    it('should send an email successfully', async () => {
      const mockSendMail = jest.fn().mockResolvedValue({
        accepted: ['test@example.com'],
        rejected: [],
        response: '250 Message accepted',
      });

      const mockTransporter = {
        sendMail: mockSendMail,
      };

      (nodemailer.createTransport as jest.Mock).mockReturnValue(
        mockTransporter
      );

      const emailData = {
        message: 'Test message',
        topic: 'Test subject',
        emailUser: 'user@example.com',
      };

      const result = await EmailService.sendMail(emailData);

      expect(result).toEqual({ status: 200 });
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        service: 'gmail',
        auth: {
          user: 'test@example.com',
          pass: 'test-password',
        },
      });
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'user@example.com',
        to: 'test@example.com',
        subject: 'Test subject',
        text: expect.stringContaining('Test message'),
      });
    });

    it('should return 500 when email sending fails (no accepted recipients)', async () => {
      const mockSendMail = jest.fn().mockResolvedValue({
        accepted: [],
        rejected: ['test@example.com'],
        response: '550 Recipient rejected',
      });

      const mockTransporter = {
        sendMail: mockSendMail,
      };

      (nodemailer.createTransport as jest.Mock).mockReturnValue(
        mockTransporter
      );

      const emailData = {
        message: 'Test message',
        topic: 'Test subject',
        emailUser: 'user@example.com',
      };

      const result = await EmailService.sendMail(emailData);

      expect(result).toEqual({ status: 500 });
    });

    it('should handle nodemailer errors', async () => {
      const mockError = new Error('SMTP connection failed');
      const mockSendMail = jest.fn().mockRejectedValue(mockError);

      const mockTransporter = {
        sendMail: mockSendMail,
      };

      (nodemailer.createTransport as jest.Mock).mockReturnValue(
        mockTransporter
      );

      const emailData = {
        message: 'Test message',
        topic: 'Test subject',
        emailUser: 'user@example.com',
      };

      const result = await EmailService.sendMail(emailData);

      expect(result).toEqual({ status: 500 });
      expect(logError).toHaveBeenCalledWith(mockError, 'sendEmail');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });

    it('should include correct email content format', async () => {
      const mockSendMail = jest.fn().mockResolvedValue({
        accepted: ['test@example.com'],
      });

      const mockTransporter = {
        sendMail: mockSendMail,
      };

      (nodemailer.createTransport as jest.Mock).mockReturnValue(
        mockTransporter
      );

      const emailData = {
        message: 'Hello, this is a test message',
        topic: 'Test Subject',
        emailUser: 'sender@example.com',
      };

      await EmailService.sendMail(emailData);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.text).toContain('Message: Hello, this is a test message');
      expect(callArgs.text).toContain('Email: sender@example.com');
      expect(callArgs.subject).toBe('Test Subject');
      expect(callArgs.from).toBe('sender@example.com');
    });
  });
});
