import { withAuth, withDALAuth } from '../helpers';
import { DALError } from '../core/errors';

describe('DAL helpers', () => {
  describe('withAuth', () => {
    it('should execute handler when auth check passes', async () => {
      const mockAuthCheck = jest.fn().mockResolvedValue(undefined);
      const mockHandler = jest
        .fn()
        .mockResolvedValue({ status: 200, data: 'success' });

      const wrappedFunction = withAuth(mockAuthCheck, mockHandler);
      const result = await wrappedFunction('arg1', 'arg2');

      expect(mockAuthCheck).toHaveBeenCalledTimes(1);
      expect(mockHandler).toHaveBeenCalledWith('arg1', 'arg2');
      expect(result).toEqual({ status: 200, data: 'success' });
    });

    it('should return error response when auth check throws DALError', async () => {
      const mockAuthCheck = jest
        .fn()
        .mockRejectedValue(new DALError('UNAUTHORIZED', 'Not authenticated'));
      const mockHandler = jest.fn();

      const wrappedFunction = withAuth(mockAuthCheck, mockHandler);
      const result = await wrappedFunction('arg1');

      expect(mockAuthCheck).toHaveBeenCalledTimes(1);
      expect(mockHandler).not.toHaveBeenCalled();
      expect(result).toEqual({
        status: 401,
        message: 'Not authenticated',
      });
    });

    it('should return 403 for FORBIDDEN DALError', async () => {
      const mockAuthCheck = jest
        .fn()
        .mockRejectedValue(
          new DALError('FORBIDDEN', 'Admin privileges required')
        );
      const mockHandler = jest.fn();

      const wrappedFunction = withAuth(mockAuthCheck, mockHandler);
      const result = await wrappedFunction();

      expect(result).toEqual({
        status: 403,
        message: 'Admin privileges required',
      });
    });

    it('should return 404 for NOT_FOUND DALError', async () => {
      const mockAuthCheck = jest
        .fn()
        .mockRejectedValue(new DALError('NOT_FOUND', 'User not found'));
      const mockHandler = jest.fn();

      const wrappedFunction = withAuth(mockAuthCheck, mockHandler);
      const result = await wrappedFunction();

      expect(result).toEqual({
        status: 404,
        message: 'User not found',
      });
    });

    it('should rethrow non-DALError errors', async () => {
      const mockError = new Error('Unexpected error');
      const mockAuthCheck = jest.fn().mockRejectedValue(mockError);
      const mockHandler = jest.fn();

      const wrappedFunction = withAuth(mockAuthCheck, mockHandler);

      await expect(wrappedFunction()).rejects.toThrow('Unexpected error');
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should handle handler throwing DALError', async () => {
      const mockAuthCheck = jest.fn().mockResolvedValue(undefined);
      const mockHandler = jest
        .fn()
        .mockRejectedValue(new DALError('FORBIDDEN', 'Operation not allowed'));

      const wrappedFunction = withAuth(mockAuthCheck, mockHandler);
      const result = await wrappedFunction('data');

      expect(mockAuthCheck).toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalledWith('data');
      expect(result).toEqual({
        status: 403,
        message: 'Operation not allowed',
      });
    });

    it('should handle handler throwing non-DALError', async () => {
      const mockAuthCheck = jest.fn().mockResolvedValue(undefined);
      const mockError = new Error('Handler failed');
      const mockHandler = jest.fn().mockRejectedValue(mockError);

      const wrappedFunction = withAuth(mockAuthCheck, mockHandler);

      await expect(wrappedFunction()).rejects.toThrow('Handler failed');
    });

    it('should pass multiple arguments to handler', async () => {
      const mockAuthCheck = jest.fn().mockResolvedValue(undefined);
      const mockHandler = jest.fn().mockResolvedValue({ success: true });

      const wrappedFunction = withAuth(mockAuthCheck, mockHandler);
      await wrappedFunction('arg1', 'arg2', 'arg3');

      expect(mockHandler).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });
  });

  describe('withDALAuth', () => {
    it('should execute handler when auth check passes', async () => {
      const mockAuthCheck = jest.fn().mockResolvedValue(undefined);
      const mockHandler = jest
        .fn()
        .mockResolvedValue({ status: 200, data: 'success' });

      const wrappedFunction = withDALAuth(mockAuthCheck, mockHandler);
      const result = await wrappedFunction('userId-123', 'data');

      expect(mockAuthCheck).toHaveBeenCalledWith('userId-123', 'data');
      expect(mockHandler).toHaveBeenCalledWith('userId-123', 'data');
      expect(result).toEqual({ status: 200, data: 'success' });
    });

    it('should pass all arguments to auth check', async () => {
      const mockAuthCheck = jest.fn().mockResolvedValue(undefined);
      const mockHandler = jest.fn().mockResolvedValue({ status: 200 });

      const wrappedFunction = withDALAuth(mockAuthCheck, mockHandler);
      await wrappedFunction('arg1', 'arg2', 'arg3');

      expect(mockAuthCheck).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
      expect(mockHandler).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    it('should return error response when auth check throws DALError', async () => {
      const mockAuthCheck = jest
        .fn()
        .mockRejectedValue(new DALError('UNAUTHORIZED', 'Session expired'));
      const mockHandler = jest.fn();

      const wrappedFunction = withDALAuth(mockAuthCheck, mockHandler);
      const result = await wrappedFunction('userId-123');

      expect(mockAuthCheck).toHaveBeenCalledWith('userId-123');
      expect(mockHandler).not.toHaveBeenCalled();
      expect(result).toEqual({
        status: 401,
        message: 'Session expired',
      });
    });

    it('should return 403 for ownership verification failure', async () => {
      const mockAuthCheck = jest
        .fn()
        .mockRejectedValue(
          new DALError('FORBIDDEN', 'Access to resource denied')
        );
      const mockHandler = jest.fn();

      const wrappedFunction = withDALAuth(mockAuthCheck, mockHandler);
      const result = await wrappedFunction('userId-123', 'resourceId-456');

      expect(mockAuthCheck).toHaveBeenCalledWith(
        'userId-123',
        'resourceId-456'
      );
      expect(result).toEqual({
        status: 403,
        message: 'Access to resource denied',
      });
    });

    it('should rethrow non-DALError errors', async () => {
      const mockError = new Error('Database connection failed');
      const mockAuthCheck = jest.fn().mockRejectedValue(mockError);
      const mockHandler = jest.fn();

      const wrappedFunction = withDALAuth(mockAuthCheck, mockHandler);

      await expect(wrappedFunction('arg')).rejects.toThrow(
        'Database connection failed'
      );
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should handle handler throwing DALError', async () => {
      const mockAuthCheck = jest.fn().mockResolvedValue(undefined);
      const mockHandler = jest
        .fn()
        .mockRejectedValue(new DALError('NOT_FOUND', 'Resource not found'));

      const wrappedFunction = withDALAuth(mockAuthCheck, mockHandler);
      const result = await wrappedFunction('resourceId');

      expect(mockAuthCheck).toHaveBeenCalledWith('resourceId');
      expect(mockHandler).toHaveBeenCalledWith('resourceId');
      expect(result).toEqual({
        status: 404,
        message: 'Resource not found',
      });
    });

    it('should handle handler throwing non-DALError', async () => {
      const mockAuthCheck = jest.fn().mockResolvedValue(undefined);
      const mockError = new Error('Business logic error');
      const mockHandler = jest.fn().mockRejectedValue(mockError);

      const wrappedFunction = withDALAuth(mockAuthCheck, mockHandler);

      await expect(wrappedFunction('data')).rejects.toThrow(
        'Business logic error'
      );
    });

    it('should work with complex return types', async () => {
      interface ComplexReturn {
        status: number;
        user: { id: string; name: string };
        metadata: { timestamp: Date };
      }

      const mockAuthCheck = jest.fn().mockResolvedValue(undefined);
      const mockHandler = jest.fn().mockResolvedValue<ComplexReturn>({
        status: 200,
        user: { id: '123', name: 'John' },
        metadata: { timestamp: new Date() },
      });

      const wrappedFunction = withDALAuth<[string], ComplexReturn>(
        mockAuthCheck,
        mockHandler
      );
      const result = await wrappedFunction('userId');

      expect(result.status).toBe(200);
      expect(result.user).toEqual({ id: '123', name: 'John' });
      expect(result.metadata).toHaveProperty('timestamp');
    });
  });

  describe('withAuth vs withDALAuth comparison', () => {
    it('withAuth should not pass args to auth check', async () => {
      const mockAuthCheck = jest.fn().mockResolvedValue(undefined);
      const mockHandler = jest.fn().mockResolvedValue({ status: 200 });

      const wrappedFunction = withAuth(mockAuthCheck, mockHandler);
      await wrappedFunction('arg1', 'arg2');

      expect(mockAuthCheck).toHaveBeenCalledWith(); // No args
      expect(mockHandler).toHaveBeenCalledWith('arg1', 'arg2'); // Has args
    });

    it('withDALAuth should pass args to both auth check and handler', async () => {
      const mockAuthCheck = jest.fn().mockResolvedValue(undefined);
      const mockHandler = jest.fn().mockResolvedValue({ status: 200 });

      const wrappedFunction = withDALAuth(mockAuthCheck, mockHandler);
      await wrappedFunction('arg1', 'arg2');

      expect(mockAuthCheck).toHaveBeenCalledWith('arg1', 'arg2'); // Has args
      expect(mockHandler).toHaveBeenCalledWith('arg1', 'arg2'); // Has args
    });
  });
});
