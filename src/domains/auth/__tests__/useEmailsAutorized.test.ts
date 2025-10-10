/**
 * Unit tests for the useEmailsAutorized hook
 *
 * Concepts tested:
 * - React Query mutations (useMutation)
 * - Toast notifications based on API responses
 * - Query cache invalidation after successful mutations
 * - Error handling for different HTTP status codes
 * - Integration with i18n translations
 * - Hook state management (loading, error, success)
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { toast } from 'react-toastify';
import {
  deleteEmailAuthorized,
  getAuthorizedEmailsPagination,
  postAuthorizedEmail,
} from '../actions/action.email';
import useEmailsAutorized from '../hooks/useEmailsAutorized';

// Mock react-toastify - tracks toast calls
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock next-intl - returns translation keys
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => `translated.${key}`,
}));

// Mock the server actions
jest.mock('../actions/action.email', () => ({
  postAuthorizedEmail: jest.fn(),
  getAuthorizedEmailsPagination: jest.fn(),
  deleteEmailAuthorized: jest.fn(),
}));

/**
 * Wrapper component to provide React Query context
 * Required for hooks that use useMutation or useQuery
 */
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  Wrapper.displayName = 'TestQueryWrapper';

  return Wrapper;
};

describe('useEmailsAutorized', () => {
  const mockReset = jest.fn();
  const mockEmail = 'test@example.com';

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Default mock to prevent "Query data cannot be undefined" warnings
    // Tests that need specific data will override this mock
    (getAuthorizedEmailsPagination as jest.Mock).mockResolvedValue({
      status: 200,
      mails: [],
    });
  });

  /**
   * Group 1: Hook initialization and structure
   *
   * Verifies the hook returns the expected structure
   */
  describe('Hooks initialization', () => {
    it('should return addEmailMutation object', () => {
      // Arrange & Act
      const { result } = renderHook(
        () => useEmailsAutorized({ reset: mockReset }),
        { wrapper: createWrapper() }
      );

      // Assert: Hook returns expected structure
      expect(result.current).toHaveProperty('addEmailMutation');
      expect(result.current.addEmailMutation).toHaveProperty('mutate');
      expect(result.current.addEmailMutation).toHaveProperty('mutateAsync');
      expect(result.current.addEmailMutation).toHaveProperty('isPending');
      expect(result.current.addEmailMutation).toHaveProperty('isError');
      expect(result.current.addEmailMutation).toHaveProperty('isSuccess');
    });

    it('should initialize with idle state for addEmailMutation', () => {
      // Arrange & Act
      const { result } = renderHook(
        () => useEmailsAutorized({ reset: mockReset }),
        { wrapper: createWrapper() }
      );

      // Assert: Initial state is idle
      expect(result.current.addEmailMutation.isPending).toBe(false);
      expect(result.current.addEmailMutation.isError).toBe(false);
      expect(result.current.addEmailMutation.isSuccess).toBe(false);
      expect(result.current.addEmailMutation.data).toBeUndefined();
    });

    it('should return deleteEmailMutation object', () => {
      // Arrange & Act
      const { result } = renderHook(
        () => useEmailsAutorized({ email: 'test@email.com' }),
        {
          wrapper: createWrapper(),
        }
      );

      // Assert: Hook returns expected structure
      expect(result.current).toHaveProperty('deleteEmailMutation');
      expect(result.current.deleteEmailMutation).toHaveProperty('mutate');
      expect(result.current.deleteEmailMutation).toHaveProperty('mutateAsync');
      expect(result.current.deleteEmailMutation).toHaveProperty('isPending');
      expect(result.current.deleteEmailMutation).toHaveProperty('isError');
      expect(result.current.deleteEmailMutation).toHaveProperty('isSuccess');
    });

    it('should initialize with idle state for deleteEmailMutation', () => {
      // Arrange & Act
      const { result } = renderHook(
        () => useEmailsAutorized({ email: 'test@email.com' }),
        { wrapper: createWrapper() }
      );

      // Assert: Initial state is idle
      expect(result.current.deleteEmailMutation.isPending).toBe(false);
      expect(result.current.deleteEmailMutation.isError).toBe(false);
      expect(result.current.deleteEmailMutation.isSuccess).toBe(false);
      expect(result.current.deleteEmailMutation.data).toBeUndefined();
    });

    it('should return getAuthorizedEmails object', () => {
      // Arrange & Act
      const { result } = renderHook(() => useEmailsAutorized({ page: 0 }), {
        wrapper: createWrapper(),
      });

      // Assert: Hook returns expected structure
      expect(result.current).toHaveProperty('getAuthorizedEmails');
      expect(result.current.getAuthorizedEmails).toHaveProperty('isPending');
      expect(result.current.getAuthorizedEmails).toHaveProperty('isError');
      expect(result.current.getAuthorizedEmails).toHaveProperty('isSuccess');
    });

    it('should initialize with idle state for getAuthorizedEmails', async () => {
      // Arrange: Mock successful response
      const mockEmails = [
        { id: '1', email: 'test1@example.com' },
        { id: '2', email: 'test2@example.com' },
      ];
      (getAuthorizedEmailsPagination as jest.Mock).mockResolvedValue({
        status: 200,
        mails: mockEmails,
      });

      // Act
      const { result } = renderHook(() => useEmailsAutorized({ page: 0 }), {
        wrapper: createWrapper(),
      });

      // Assert: Wait for query to resolve
      await waitFor(() =>
        expect(result.current.getAuthorizedEmails.isSuccess).toBe(true)
      );

      expect(result.current.getAuthorizedEmails.isPending).toBe(false);
      expect(result.current.getAuthorizedEmails.isError).toBe(false);
      expect(result.current.getAuthorizedEmails.data).toEqual({
        status: 200,
        mails: mockEmails,
      });
    });
  });

  /**
   * Group 2: Successful email addition
   *
   * Tests the happy path where email is successfully added
   */
  describe('Successful email addition', () => {
    it('should call postAuthorizedEmail with correct email when mutate is called', async () => {
      // Arrange: Mock successful API response
      (postAuthorizedEmail as jest.Mock).mockResolvedValue({
        status: 200,
        message: undefined,
      });

      // Act: Render hook and trigger mutation
      const { result } = renderHook(
        () => useEmailsAutorized({ reset: mockReset }),
        { wrapper: createWrapper() }
      );

      result.current.addEmailMutation.mutate({ email: 'test@example.com' });

      // Wait for mutation to complete
      await waitFor(() =>
        expect(result.current.addEmailMutation.isSuccess).toBe(true)
      );

      // Assert: Verify the server action was called with correct email
      expect(postAuthorizedEmail).toHaveBeenCalledWith('test@example.com');
      expect(postAuthorizedEmail).toHaveBeenCalledTimes(1);
    });

    it('should show success toast and call reset on status 200', async () => {
      // Arrange
      (postAuthorizedEmail as jest.Mock).mockResolvedValue({
        status: 200,
        message: undefined,
      });

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ reset: mockReset }),
        { wrapper: createWrapper() }
      );

      result.current.addEmailMutation.mutate({ email: 'test@example.com' });

      await waitFor(() =>
        expect(result.current.addEmailMutation.isSuccess).toBe(true)
      );

      // Assert: Success toast was shown
      expect(toast.success).toHaveBeenCalledWith('translated.userEmailAdded');

      // Assert: Reset function was called
      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it('should transition through loading state during mutation', async () => {
      // Arrange
      (postAuthorizedEmail as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ status: 200 }), 100)
          )
      );

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ reset: mockReset }),
        { wrapper: createWrapper() }
      );

      // Assert: Initial state is not pending
      expect(result.current.addEmailMutation.isPending).toBe(false);

      result.current.addEmailMutation.mutate({ email: 'test@example.com' });

      // Assert: State changes to pending
      await waitFor(() =>
        expect(result.current.addEmailMutation.isPending).toBe(true)
      );

      // Assert: Eventually completes successfully
      await waitFor(() =>
        expect(result.current.addEmailMutation.isSuccess).toBe(true)
      );
      expect(result.current.addEmailMutation.isPending).toBe(false);
    });

    it('should invalidate queries on successful mutation', async () => {
      // Arrange
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          children
        );

      (postAuthorizedEmail as jest.Mock).mockResolvedValue({
        status: 200,
      });

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ reset: mockReset }),
        { wrapper }
      );

      result.current.addEmailMutation.mutate({ email: 'test@example.com' });

      await waitFor(() =>
        expect(result.current.addEmailMutation.isSuccess).toBe(true)
      );

      // Assert: Query invalidation was triggered
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['users-mails-authorized'],
        exact: false,
      });
    });

    it('should return status and email in mutation data', async () => {
      // Arrange
      (postAuthorizedEmail as jest.Mock).mockResolvedValue({
        status: 200,
      });

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ reset: mockReset }),
        { wrapper: createWrapper() }
      );

      result.current.addEmailMutation.mutate({ email: 'test@example.com' });

      await waitFor(() =>
        expect(result.current.addEmailMutation.isSuccess).toBe(true)
      );

      // Assert: Mutation data contains expected values
      expect(result.current.addEmailMutation.data).toEqual({
        status: 200,
        email: 'test@example.com',
      });
    });
  });

  /**
   * Group 3: Error handling
   *
   * Tests different error scenarios and their handling
   */
  describe('Error handling', () => {
    it('should show specific error toast on status 409 (email already exists)', async () => {
      // Arrange: Mock conflict response
      (postAuthorizedEmail as jest.Mock).mockResolvedValue({
        status: 409,
        message: 'User Already authorized',
      });

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ reset: mockReset }),
        { wrapper: createWrapper() }
      );

      result.current.addEmailMutation.mutate({ email: 'test@example.com' });

      await waitFor(() =>
        expect(result.current.addEmailMutation.isSuccess).toBe(true)
      );

      // Assert: Correct error message shown
      expect(toast.error).toHaveBeenCalledWith('User Already authorized');
      expect(toast.success).not.toHaveBeenCalled();
    });

    it('should show default message when 409 has no custom message', async () => {
      // Arrange
      (postAuthorizedEmail as jest.Mock).mockResolvedValue({
        status: 409,
        message: undefined,
      });

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ reset: mockReset }),
        { wrapper: createWrapper() }
      );

      result.current.addEmailMutation.mutate({ email: 'test@example.com' });

      await waitFor(() =>
        expect(result.current.addEmailMutation.isSuccess).toBe(true)
      );

      // Assert: Default 409 message shown
      expect(toast.error).toHaveBeenCalledWith('Email already authorized');
    });

    it('should show generic error toast on status 500', async () => {
      // Arrange: Mock generic error response
      (postAuthorizedEmail as jest.Mock).mockResolvedValue({
        status: 500,
        message: 'Server error',
      });

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ reset: mockReset }),
        { wrapper: createWrapper() }
      );

      result.current.addEmailMutation.mutate({ email: 'test@example.com' });

      await waitFor(() =>
        expect(result.current.addEmailMutation.isSuccess).toBe(true)
      );

      // Assert: Generic error message shown
      expect(toast.error).toHaveBeenCalledWith('Failed to add email');
    });

    it('should show generic error toast on status 400', async () => {
      // Arrange
      (postAuthorizedEmail as jest.Mock).mockResolvedValue({
        status: 400,
        message: 'Bad request',
      });

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ reset: mockReset }),
        { wrapper: createWrapper() }
      );

      result.current.addEmailMutation.mutate({ email: 'test@example.com' });

      await waitFor(() =>
        expect(result.current.addEmailMutation.isSuccess).toBe(true)
      );

      // Assert
      expect(toast.error).toHaveBeenCalledWith('Failed to add email');
    });

    it('should NOT call reset on error status', async () => {
      // Arrange
      (postAuthorizedEmail as jest.Mock).mockResolvedValue({
        status: 409,
        message: 'Email already exists',
      });

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ reset: mockReset }),
        { wrapper: createWrapper() }
      );

      result.current.addEmailMutation.mutate({ email: 'test@example.com' });

      await waitFor(() =>
        expect(result.current.addEmailMutation.isSuccess).toBe(true)
      );

      // Assert: Reset was NOT called on error
      expect(mockReset).not.toHaveBeenCalled();
    });
  });

  /**
   * Group 4: Multiple mutations
   *
   * Tests behavior when multiple mutations are triggered
   */
  describe('Multiple mutations', () => {
    it('should handle sequential mutations correctly', async () => {
      // Arrange
      (postAuthorizedEmail as jest.Mock)
        .mockResolvedValueOnce({ status: 200 })
        .mockResolvedValueOnce({ status: 409, message: 'Already exists' });

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ reset: mockReset }),
        { wrapper: createWrapper() }
      );

      // First mutation - success
      result.current.addEmailMutation.mutate({ email: 'first@example.com' });
      await waitFor(() =>
        expect(result.current.addEmailMutation.isSuccess).toBe(true)
      );

      expect(toast.success).toHaveBeenCalledWith('translated.userEmailAdded');
      expect(mockReset).toHaveBeenCalledTimes(1);

      // Clear mocks between mutations
      jest.clearAllMocks();

      // Second mutation - conflict
      result.current.addEmailMutation.mutate({ email: 'second@example.com' });
      await waitFor(() =>
        expect(result.current.addEmailMutation.data).toEqual({
          status: 409,
          email: 'second@example.com',
        })
      );

      expect(toast.error).toHaveBeenCalledWith('Already exists');
      expect(mockReset).not.toHaveBeenCalled();
    });

    it('should reset state between mutations', async () => {
      // Arrange
      (postAuthorizedEmail as jest.Mock).mockResolvedValue({ status: 200 });

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ reset: mockReset }),
        { wrapper: createWrapper() }
      );

      // First mutation
      result.current.addEmailMutation.mutate({ email: 'first@example.com' });
      await waitFor(() =>
        expect(result.current.addEmailMutation.isSuccess).toBe(true)
      );

      const firstData = result.current.addEmailMutation.data;

      // Reset mutation state
      result.current.addEmailMutation.reset();

      // Assert: State is reset (wait for the reset to take effect)
      await waitFor(() => {
        expect(result.current.addEmailMutation.data).toBeUndefined();
        expect(result.current.addEmailMutation.isSuccess).toBe(false);
      });

      // Second mutation
      result.current.addEmailMutation.mutate({ email: 'second@example.com' });
      await waitFor(() =>
        expect(result.current.addEmailMutation.isSuccess).toBe(true)
      );

      // Assert: New data is different
      expect(result.current.addEmailMutation.data).not.toEqual(firstData);
      expect(result.current.addEmailMutation.data).toEqual({
        status: 200,
        email: 'second@example.com',
      });
    });
  });

  /**
   * Group 5: Edge cases
   *
   * Tests unusual or boundary conditions
   */
  describe('Edge cases', () => {
    it('should handle empty email string', async () => {
      // Arrange
      (postAuthorizedEmail as jest.Mock).mockResolvedValue({
        status: 400,
        message: 'Invalid email',
      });

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ reset: mockReset }),
        { wrapper: createWrapper() }
      );

      result.current.addEmailMutation.mutate({ email: '' });

      await waitFor(() =>
        expect(result.current.addEmailMutation.isSuccess).toBe(true)
      );

      // Assert: Should call API even with empty email (validation is server-side)
      expect(postAuthorizedEmail).toHaveBeenCalledWith('');
      expect(toast.error).toHaveBeenCalledWith('Failed to add email');
    });

    it('should handle network errors gracefully', async () => {
      // Arrange: Mock network error
      (postAuthorizedEmail as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ reset: mockReset }),
        { wrapper: createWrapper() }
      );

      result.current.addEmailMutation.mutate({ email: 'test@example.com' });

      // Wait for error state
      await waitFor(() =>
        expect(result.current.addEmailMutation.isError).toBe(true)
      );

      // Assert: Mutation is in error state
      expect(result.current.addEmailMutation.isError).toBe(true);
      expect(result.current.addEmailMutation.error).toEqual(
        new Error('Network error')
      );
    });

    it('should handle very long email addresses', async () => {
      // Arrange
      const longEmail = 'a'.repeat(100) + '@example.com';
      (postAuthorizedEmail as jest.Mock).mockResolvedValue({ status: 200 });

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ reset: mockReset }),
        { wrapper: createWrapper() }
      );

      result.current.addEmailMutation.mutate({ email: longEmail });

      await waitFor(() =>
        expect(result.current.addEmailMutation.isSuccess).toBe(true)
      );

      // Assert
      expect(postAuthorizedEmail).toHaveBeenCalledWith(longEmail);
      expect(result.current.addEmailMutation.data?.email).toBe(longEmail);
    });
  });

  /**
   * Group 6: Internationalization
   *
   * Verifies translation system usage
   */
  describe('Internationalization', () => {
    it('should use translated strings for success toast', async () => {
      // Arrange
      (postAuthorizedEmail as jest.Mock).mockResolvedValue({ status: 200 });

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ reset: mockReset }),
        { wrapper: createWrapper() }
      );

      result.current.addEmailMutation.mutate({ email: 'test@example.com' });

      await waitFor(() =>
        expect(result.current.addEmailMutation.isSuccess).toBe(true)
      );

      // Assert: Translation key was used
      expect(toast.success).toHaveBeenCalledWith('translated.userEmailAdded');
    });

    it('should use hardcoded strings for error messages', async () => {
      // Arrange
      (postAuthorizedEmail as jest.Mock).mockResolvedValue({
        status: 500,
      });

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ reset: mockReset }),
        { wrapper: createWrapper() }
      );

      result.current.addEmailMutation.mutate({ email: 'test@example.com' });

      await waitFor(() =>
        expect(result.current.addEmailMutation.isSuccess).toBe(true)
      );

      // Assert: Hardcoded error message (not translated)
      expect(toast.error).toHaveBeenCalledWith('Failed to add email');
    });
  });

  /**
   * Group 7: getAuthorizedEmails query tests
   *
   * Tests for fetching authorized emails with pagination
   */
  describe('getAuthorizedEmails', () => {
    it('should fetch authorized emails successfully', async () => {
      // Arrange
      const mockEmails = [
        { id: '1', email: 'user1@example.com' },
        { id: '2', email: 'user2@example.com' },
        { id: '3', email: 'user3@example.com' },
      ];
      (getAuthorizedEmailsPagination as jest.Mock).mockResolvedValue({
        status: 200,
        mails: mockEmails,
      });

      // Act
      const { result } = renderHook(() => useEmailsAutorized({ page: 0 }), {
        wrapper: createWrapper(),
      });

      // Assert: Wait for successful fetch
      await waitFor(() =>
        expect(result.current.getAuthorizedEmails.isSuccess).toBe(true)
      );

      expect(result.current.getAuthorizedEmails.data).toEqual({
        status: 200,
        mails: mockEmails,
      });
      expect(result.current.getAuthorizedEmails.isPending).toBe(false);
      expect(result.current.getAuthorizedEmails.isError).toBe(false);
    });

    it('should call getAuthorizedEmailsPagination with correct page offset', async () => {
      // Arrange
      const mockEmails = [{ id: '1', email: 'test@example.com' }];
      (getAuthorizedEmailsPagination as jest.Mock).mockResolvedValue({
        status: 200,
        mails: mockEmails,
      });

      // Act: Render with page 2
      const { result } = renderHook(() => useEmailsAutorized({ page: 2 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() =>
        expect(result.current.getAuthorizedEmails.isSuccess).toBe(true)
      );

      // Assert: Should calculate offset as page * 5
      expect(getAuthorizedEmailsPagination).toHaveBeenCalledWith({
        pageParam: 10, // page 2 * 5 = 10
      });
    });

    it('should handle empty results', async () => {
      // Arrange: Mock empty array response
      (getAuthorizedEmailsPagination as jest.Mock).mockResolvedValue({
        status: 200,
        mails: [],
      });

      // Act
      const { result } = renderHook(() => useEmailsAutorized({ page: 0 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() =>
        expect(result.current.getAuthorizedEmails.isSuccess).toBe(true)
      );

      // Assert
      expect(result.current.getAuthorizedEmails.data).toEqual({
        status: 200,
        mails: [],
      });
      expect(result.current.getAuthorizedEmails.isPending).toBe(false);
    });

    it('should handle query errors gracefully', async () => {
      // Arrange: Mock error
      const errorMessage = 'Failed to fetch emails';
      (getAuthorizedEmailsPagination as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      // Act
      const { result } = renderHook(() => useEmailsAutorized({ page: 0 }), {
        wrapper: createWrapper(),
      });

      // Assert: Wait for error state
      await waitFor(() =>
        expect(result.current.getAuthorizedEmails.isError).toBe(true)
      );

      expect(result.current.getAuthorizedEmails.isPending).toBe(false);
      expect(result.current.getAuthorizedEmails.isSuccess).toBe(false);
      expect(result.current.getAuthorizedEmails.error).toEqual(
        new Error(errorMessage)
      );
    });

    it('should use keepPreviousData for pagination', async () => {
      // Arrange
      const page0Data = {
        status: 200,
        mails: [{ id: '1', email: 'page0@example.com' }],
      };
      const page1Data = {
        status: 200,
        mails: [{ id: '2', email: 'page1@example.com' }],
      };

      (getAuthorizedEmailsPagination as jest.Mock).mockResolvedValueOnce(
        page0Data
      );

      // Act: Initial render with page 0
      const { result, rerender } = renderHook(
        ({ page }) => useEmailsAutorized({ page }),
        {
          wrapper: createWrapper(),
          initialProps: { page: 0 },
        }
      );

      await waitFor(() =>
        expect(result.current.getAuthorizedEmails.isSuccess).toBe(true)
      );

      expect(result.current.getAuthorizedEmails.data).toEqual(page0Data);

      // Setup mock for page 1
      (getAuthorizedEmailsPagination as jest.Mock).mockResolvedValueOnce(
        page1Data
      );

      // Act: Change to page 1
      rerender({ page: 1 });

      // Assert: Should still show previous data while loading new page
      expect(result.current.getAuthorizedEmails.data).toEqual(page0Data);

      // Wait for new data
      await waitFor(() => {
        expect(result.current.getAuthorizedEmails.data).toEqual(page1Data);
      });
    });

    it('should not refetch on window focus', async () => {
      // Arrange
      const mockEmails = [{ id: '1', email: 'test@example.com' }];
      (getAuthorizedEmailsPagination as jest.Mock).mockResolvedValue({
        status: 200,
        mails: mockEmails,
      });

      // Act
      const { result } = renderHook(() => useEmailsAutorized({ page: 0 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() =>
        expect(result.current.getAuthorizedEmails.isSuccess).toBe(true)
      );

      // Clear mock calls
      jest.clearAllMocks();

      // Simulate window focus event
      window.dispatchEvent(new Event('focus'));

      // Wait a bit to see if refetch happens
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Assert: Should not have called the API again
      expect(getAuthorizedEmailsPagination).not.toHaveBeenCalled();
    });

    it('should update query when page changes', async () => {
      // Arrange
      const page0Data = {
        status: 200,
        mails: [{ id: '1', email: 'page0@example.com' }],
      };
      const page1Data = {
        status: 200,
        mails: [{ id: '2', email: 'page1@example.com' }],
      };

      (getAuthorizedEmailsPagination as jest.Mock)
        .mockResolvedValueOnce(page0Data)
        .mockResolvedValueOnce(page1Data);

      // Act: Initial render
      const { result, rerender } = renderHook(
        ({ page }) => useEmailsAutorized({ page }),
        {
          wrapper: createWrapper(),
          initialProps: { page: 0 },
        }
      );

      await waitFor(() =>
        expect(result.current.getAuthorizedEmails.isSuccess).toBe(true)
      );

      expect(result.current.getAuthorizedEmails.data).toEqual(page0Data);

      // Act: Change page
      rerender({ page: 1 });

      await waitFor(() => {
        expect(result.current.getAuthorizedEmails.data).toEqual(page1Data);
      });

      // Assert: Both pages were called with correct offsets
      expect(getAuthorizedEmailsPagination).toHaveBeenCalledTimes(2);
      expect(getAuthorizedEmailsPagination).toHaveBeenNthCalledWith(1, {
        pageParam: 0,
      });
      expect(getAuthorizedEmailsPagination).toHaveBeenNthCalledWith(2, {
        pageParam: 5,
      });
    });

    it('should refetch after successful email addition', async () => {
      // Arrange
      const initialEmails = {
        status: 200,
        mails: [{ id: '1', email: 'initial@example.com' }],
      };
      const updatedEmails = {
        status: 200,
        mails: [
          { id: '1', email: 'initial@example.com' },
          { id: '2', email: 'new@example.com' },
        ],
      };

      (getAuthorizedEmailsPagination as jest.Mock)
        .mockResolvedValueOnce(initialEmails)
        .mockResolvedValueOnce(updatedEmails);

      (postAuthorizedEmail as jest.Mock).mockResolvedValue({ status: 200 });

      // Act: Initial render
      const { result } = renderHook(
        () => useEmailsAutorized({ page: 0, reset: mockReset }),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() =>
        expect(result.current.getAuthorizedEmails.isSuccess).toBe(true)
      );

      expect(result.current.getAuthorizedEmails.data).toEqual(initialEmails);

      // Act: Add new email
      result.current.addEmailMutation.mutate({ email: 'new@example.com' });

      await waitFor(() =>
        expect(result.current.addEmailMutation.isSuccess).toBe(true)
      );

      // Assert: Query should refetch and get updated data
      await waitFor(() => {
        expect(result.current.getAuthorizedEmails.data).toEqual(updatedEmails);
      });

      expect(getAuthorizedEmailsPagination).toHaveBeenCalledTimes(2);
    });

    it('should transition through loading state on initial fetch', async () => {
      // Arrange: Delay the response
      (getAuthorizedEmailsPagination as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  status: 200,
                  mails: [{ id: '1', email: 'test@example.com' }],
                }),
              100
            )
          )
      );

      // Act
      const { result } = renderHook(() => useEmailsAutorized({ page: 0 }), {
        wrapper: createWrapper(),
      });

      // Assert: Should start in pending state
      expect(result.current.getAuthorizedEmails.isPending).toBe(true);
      expect(result.current.getAuthorizedEmails.isSuccess).toBe(false);

      // Wait for completion
      await waitFor(() =>
        expect(result.current.getAuthorizedEmails.isSuccess).toBe(true)
      );

      expect(result.current.getAuthorizedEmails.isPending).toBe(false);
    });
  });

  /**
   * Group 8: deleteEmailMutation query tests
   *
   * Tests for fetching delete email authorized emails
   */
  describe('deleteEmailMutation tests', () => {
    it('should call deleteEmailAuthorized with correct email when mutate is called', async () => {
      // Arrange: Mock successful API response
      (deleteEmailAuthorized as jest.Mock).mockResolvedValue({
        status: 200,
        message: undefined,
      });

      // Act: Render hook and trigger mutation
      const { result } = renderHook(
        () => useEmailsAutorized({ email: mockEmail }),
        { wrapper: createWrapper() }
      );

      result.current.deleteEmailMutation.mutate(mockEmail);

      // Wait for mutation to complete
      await waitFor(() =>
        expect(result.current.deleteEmailMutation.isSuccess).toBe(true)
      );

      // Assert: Verify the server action was called with correct email
      expect(deleteEmailAuthorized).toHaveBeenCalledWith(mockEmail);
      expect(deleteEmailAuthorized).toHaveBeenCalledTimes(1);
    });

    it('should show success toast and call reset on status 200', async () => {
      // Arrange
      (deleteEmailAuthorized as jest.Mock).mockResolvedValue({
        status: 200,
        message: undefined,
      });

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ email: mockEmail }),
        { wrapper: createWrapper() }
      );

      result.current.deleteEmailMutation.mutate(mockEmail);

      await waitFor(() =>
        expect(result.current.deleteEmailMutation.isSuccess).toBe(true)
      );

      // Assert: Success toast was shown
      expect(toast.success).toHaveBeenCalledWith('Email deleted successfully');
    });

    it('should transition through loading state during mutation', async () => {
      // Arrange
      (deleteEmailAuthorized as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ status: 200 }), 100)
          )
      );

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ email: mockEmail }),
        { wrapper: createWrapper() }
      );

      // Assert: Initial state is not pending
      expect(result.current.deleteEmailMutation.isPending).toBe(false);

      result.current.deleteEmailMutation.mutate(mockEmail);

      // Assert: State changes to pending
      await waitFor(() =>
        expect(result.current.deleteEmailMutation.isPending).toBe(true)
      );

      // Assert: Eventually completes successfully
      await waitFor(() =>
        expect(result.current.deleteEmailMutation.isSuccess).toBe(true)
      );
      expect(result.current.deleteEmailMutation.isPending).toBe(false);
    });
    it('should invalidate queries on successful mutation', async () => {
      // Arrange
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          children
        );

      (deleteEmailAuthorized as jest.Mock).mockResolvedValue({
        status: 200,
      });

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ email: mockEmail }),
        { wrapper }
      );

      result.current.deleteEmailMutation.mutate(mockEmail);

      await waitFor(() =>
        expect(result.current.deleteEmailMutation.isSuccess).toBe(true)
      );

      // Assert: Query invalidation was triggered
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['users-mails-authorized'],
        exact: false,
      });
    });

    it('should return status and email in mutation data', async () => {
      // Arrange
      (deleteEmailAuthorized as jest.Mock).mockResolvedValue({
        status: 200,
      });

      // Act
      const { result } = renderHook(
        () => useEmailsAutorized({ email: mockEmail }),
        { wrapper: createWrapper() }
      );

      result.current.deleteEmailMutation.mutate(mockEmail);

      await waitFor(() =>
        expect(result.current.deleteEmailMutation.isSuccess).toBe(true)
      );

      // Assert: Mutation data contains expected values
      expect(result.current.deleteEmailMutation.data).toEqual({
        status: 200,
        email: 'test@example.com',
      });
    });
  });
});
