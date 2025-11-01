import { DALError } from '../errors';

describe('DALError', () => {
  describe('constructor', () => {
    it('should create error with correct type and message', () => {
      const error = new DALError('UNAUTHORIZED', 'Test message');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DALError);
      expect(error.type).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Test message');
      expect(error.name).toBe('DALError');
    });

    it('should create FORBIDDEN error', () => {
      const error = new DALError('FORBIDDEN', 'Access denied');

      expect(error.type).toBe('FORBIDDEN');
      expect(error.message).toBe('Access denied');
    });

    it('should create NOT_FOUND error', () => {
      const error = new DALError('NOT_FOUND', 'Resource not found');

      expect(error.type).toBe('NOT_FOUND');
      expect(error.message).toBe('Resource not found');
    });
  });

  describe('toHTTPStatus', () => {
    it('should return 401 for UNAUTHORIZED', () => {
      const error = new DALError('UNAUTHORIZED', 'Test');
      expect(error.toHTTPStatus()).toBe(401);
    });

    it('should return 403 for FORBIDDEN', () => {
      const error = new DALError('FORBIDDEN', 'Test');
      expect(error.toHTTPStatus()).toBe(403);
    });

    it('should return 404 for NOT_FOUND', () => {
      const error = new DALError('NOT_FOUND', 'Test');
      expect(error.toHTTPStatus()).toBe(404);
    });
  });

  describe('error handling', () => {
    it('should be catchable as Error', () => {
      try {
        throw new DALError('UNAUTHORIZED', 'Test');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as DALError).type).toBe('UNAUTHORIZED');
      }
    });

    it('should be identifiable with instanceof', () => {
      try {
        throw new DALError('FORBIDDEN', 'Test');
      } catch (error) {
        if (error instanceof DALError) {
          expect(error.toHTTPStatus()).toBe(403);
        } else {
          fail('Error should be instance of DALError');
        }
      }
    });
  });
});
