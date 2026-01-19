import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import useDeleteMovieFromGoogleDrive from '../useDeleteMovieFromGoogleDrive';

// Mock the server action
jest.mock('../../actions/movie', () => ({
  deleteMovieByIdToGoogleDrive: jest.fn(),
}));

import { deleteMovieByIdToGoogleDrive } from '../../actions/movie';

const mockDeleteMovieByIdToGoogleDrive =
  deleteMovieByIdToGoogleDrive as jest.MockedFunction<
    typeof deleteMovieByIdToGoogleDrive
  >;

/**
 * Wrapper component to provide React Query context
 * Required for hooks that use useMutation
 */
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  Wrapper.displayName = 'TestQueryWrapper';

  return { Wrapper, queryClient };
};

describe('useDeleteMovieFromGoogleDrive', () => {
  // Spy on console.error for error handling tests
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockClear();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Hook initialization', () => {
    it('should render hook without crashing', () => {
      // Arrange
      const { Wrapper } = createWrapper();

      // Act
      const { result } = renderHook(() => useDeleteMovieFromGoogleDrive(), {
        wrapper: Wrapper,
      });

      // Assert
      expect(result.current).toBeDefined();
    });

    it('should return deleteMovieFromGoogleDrive mutation object', () => {
      // Arrange
      const { Wrapper } = createWrapper();

      // Act
      const { result } = renderHook(() => useDeleteMovieFromGoogleDrive(), {
        wrapper: Wrapper,
      });

      // Assert
      expect(result.current).toHaveProperty('deleteMovieFromGoogleDrive');
      expect(result.current.deleteMovieFromGoogleDrive).toHaveProperty(
        'mutate'
      );
      expect(result.current.deleteMovieFromGoogleDrive).toHaveProperty(
        'mutateAsync'
      );
      expect(result.current.deleteMovieFromGoogleDrive).toHaveProperty(
        'isPending'
      );
      expect(result.current.deleteMovieFromGoogleDrive).toHaveProperty('error');
    });

    it('should start with isPending false', () => {
      // Arrange
      const { Wrapper } = createWrapper();

      // Act
      const { result } = renderHook(() => useDeleteMovieFromGoogleDrive(), {
        wrapper: Wrapper,
      });

      // Assert
      expect(result.current.deleteMovieFromGoogleDrive.isPending).toBe(false);
      expect(result.current.deleteMovieFromGoogleDrive.error).toBeNull();
    });
  });

  describe('Successful deletion', () => {
    it('should call deleteMovieByIdToGoogleDrive with correct movieId', async () => {
      // Arrange
      const movieId = 'movie-123';
      mockDeleteMovieByIdToGoogleDrive.mockResolvedValue({
        status: 200,
        message: 'File deleted successfully',
      });

      const { Wrapper } = createWrapper();

      // Act
      const { result } = renderHook(() => useDeleteMovieFromGoogleDrive(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        result.current.deleteMovieFromGoogleDrive.mutate(movieId);
      });

      // Assert
      await waitFor(() =>
        expect(result.current.deleteMovieFromGoogleDrive.isSuccess).toBe(true)
      );

      expect(mockDeleteMovieByIdToGoogleDrive).toHaveBeenCalledWith(movieId);
      expect(mockDeleteMovieByIdToGoogleDrive).toHaveBeenCalledTimes(1);
    });

    it('should invalidate movies-from-google-drive query on success', async () => {
      // Arrange
      const movieId = 'movie-456';
      mockDeleteMovieByIdToGoogleDrive.mockResolvedValue({
        status: 200,
        message: 'File deleted successfully',
      });

      const { Wrapper, queryClient } = createWrapper();

      // Pre-populate the query cache
      queryClient.setQueryData(
        ['movies-from-google-drive'],
        [{ id: movieId, name: 'Test Movie' }]
      );

      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

      // Act
      const { result } = renderHook(() => useDeleteMovieFromGoogleDrive(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.deleteMovieFromGoogleDrive.mutateAsync(movieId);
      });

      // Assert
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['movies-from-google-drive'],
      });

      invalidateQueriesSpy.mockRestore();
    });

    it('should handle mutateAsync and return result', async () => {
      // Arrange
      const movieId = 'movie-789';
      const expectedResponse = {
        status: 200,
        message: 'File deleted successfully',
      };
      mockDeleteMovieByIdToGoogleDrive.mockResolvedValue(expectedResponse);

      const { Wrapper } = createWrapper();

      // Act
      const { result } = renderHook(() => useDeleteMovieFromGoogleDrive(), {
        wrapper: Wrapper,
      });

      let mutationResult: { status: number; message?: string } | undefined;
      await act(async () => {
        mutationResult =
          await result.current.deleteMovieFromGoogleDrive.mutateAsync(movieId);
      });

      // Assert
      expect(mutationResult).toEqual(expectedResponse);
    });
  });

  describe('Error handling', () => {
    it('should handle deletion failure and log error', async () => {
      // Arrange
      const movieId = 'movie-error';
      const error = new Error('Failed to delete file');
      mockDeleteMovieByIdToGoogleDrive.mockRejectedValue(error);

      const { Wrapper } = createWrapper();

      // Act
      const { result } = renderHook(() => useDeleteMovieFromGoogleDrive(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        result.current.deleteMovieFromGoogleDrive.mutate(movieId);
      });

      // Assert
      await waitFor(() =>
        expect(result.current.deleteMovieFromGoogleDrive.isError).toBe(true)
      );

      expect(result.current.deleteMovieFromGoogleDrive.error).toEqual(error);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error deleting movie from Google Drive:',
        error
      );
    });

    it('should handle 404 not found response', async () => {
      // Arrange
      const movieId = 'non-existent-movie';
      mockDeleteMovieByIdToGoogleDrive.mockResolvedValue({
        status: 404,
        message: 'Failed to delete file',
      });

      const { Wrapper } = createWrapper();

      // Act
      const { result } = renderHook(() => useDeleteMovieFromGoogleDrive(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        result.current.deleteMovieFromGoogleDrive.mutate(movieId);
      });

      // Assert: Even with 404 status, mutation succeeds (no exception thrown)
      await waitFor(() =>
        expect(result.current.deleteMovieFromGoogleDrive.isSuccess).toBe(true)
      );

      expect(mockDeleteMovieByIdToGoogleDrive).toHaveBeenCalledWith(movieId);
    });

    it('should handle network error', async () => {
      // Arrange
      const movieId = 'movie-network-error';
      const networkError = new Error('Network error');
      mockDeleteMovieByIdToGoogleDrive.mockRejectedValue(networkError);

      const { Wrapper } = createWrapper();

      // Act
      const { result } = renderHook(() => useDeleteMovieFromGoogleDrive(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        result.current.deleteMovieFromGoogleDrive.mutate(movieId);
      });

      // Assert
      await waitFor(() =>
        expect(result.current.deleteMovieFromGoogleDrive.isError).toBe(true)
      );

      expect(result.current.deleteMovieFromGoogleDrive.error?.message).toBe(
        'Network error'
      );
    });

    it('should handle unauthorized error (403)', async () => {
      // Arrange
      const movieId = 'movie-unauthorized';
      const unauthorizedError = new Error('Admin privileges required');
      mockDeleteMovieByIdToGoogleDrive.mockRejectedValue(unauthorizedError);

      const { Wrapper } = createWrapper();

      // Act
      const { result } = renderHook(() => useDeleteMovieFromGoogleDrive(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        result.current.deleteMovieFromGoogleDrive.mutate(movieId);
      });

      // Assert
      await waitFor(() =>
        expect(result.current.deleteMovieFromGoogleDrive.isError).toBe(true)
      );

      expect(result.current.deleteMovieFromGoogleDrive.error?.message).toBe(
        'Admin privileges required'
      );
    });
  });

  describe('Mutation state management', () => {
    it('should set isPending to true during mutation', async () => {
      // Arrange
      const movieId = 'movie-pending';

      // Create a promise we can control
      let resolvePromise: (value: { status: number; message: string }) => void;
      const controlledPromise = new Promise<{
        status: number;
        message: string;
      }>((resolve) => {
        resolvePromise = resolve;
      });
      mockDeleteMovieByIdToGoogleDrive.mockReturnValue(controlledPromise);

      const { Wrapper } = createWrapper();

      // Act
      const { result } = renderHook(() => useDeleteMovieFromGoogleDrive(), {
        wrapper: Wrapper,
      });

      // Start mutation but don't await
      act(() => {
        result.current.deleteMovieFromGoogleDrive.mutate(movieId);
      });

      // Assert: isPending should be true
      await waitFor(() =>
        expect(result.current.deleteMovieFromGoogleDrive.isPending).toBe(true)
      );

      // Resolve the promise
      await act(async () => {
        resolvePromise!({ status: 200, message: 'File deleted successfully' });
      });

      // Assert: isPending should be false after completion
      await waitFor(() =>
        expect(result.current.deleteMovieFromGoogleDrive.isPending).toBe(false)
      );
    });

    it('should reset mutation state when reset is called', async () => {
      // Arrange
      const movieId = 'movie-reset';
      const error = new Error('Test error');
      mockDeleteMovieByIdToGoogleDrive.mockRejectedValue(error);

      const { Wrapper } = createWrapper();

      // Act
      const { result } = renderHook(() => useDeleteMovieFromGoogleDrive(), {
        wrapper: Wrapper,
      });

      // Trigger error
      await act(async () => {
        result.current.deleteMovieFromGoogleDrive.mutate(movieId);
      });

      await waitFor(() =>
        expect(result.current.deleteMovieFromGoogleDrive.isError).toBe(true)
      );

      // Reset
      act(() => {
        result.current.deleteMovieFromGoogleDrive.reset();
      });
      // Assert après re-render
      await waitFor(() => {
        expect(result.current.deleteMovieFromGoogleDrive.isError).toBe(false);
        expect(result.current.deleteMovieFromGoogleDrive.error).toBeNull();
      });
    });
  });

  describe('Multiple deletions', () => {
    it('should handle sequential deletions', async () => {
      // Arrange
      const movieIds = ['movie-1', 'movie-2', 'movie-3'];
      mockDeleteMovieByIdToGoogleDrive.mockResolvedValue({
        status: 200,
        message: 'File deleted successfully',
      });

      const { Wrapper } = createWrapper();

      // Act
      const { result } = renderHook(() => useDeleteMovieFromGoogleDrive(), {
        wrapper: Wrapper,
      });

      for (const movieId of movieIds) {
        await act(async () => {
          await result.current.deleteMovieFromGoogleDrive.mutateAsync(movieId);
        });
      }

      // Assert
      expect(mockDeleteMovieByIdToGoogleDrive).toHaveBeenCalledTimes(3);
      expect(mockDeleteMovieByIdToGoogleDrive).toHaveBeenNthCalledWith(
        1,
        'movie-1'
      );
      expect(mockDeleteMovieByIdToGoogleDrive).toHaveBeenNthCalledWith(
        2,
        'movie-2'
      );
      expect(mockDeleteMovieByIdToGoogleDrive).toHaveBeenNthCalledWith(
        3,
        'movie-3'
      );
    });

    it('should handle rapid fire mutations', async () => {
      // Arrange
      mockDeleteMovieByIdToGoogleDrive.mockResolvedValue({
        status: 200,
        message: 'File deleted successfully',
      });

      const { Wrapper } = createWrapper();

      // Act
      const { result } = renderHook(() => useDeleteMovieFromGoogleDrive(), {
        wrapper: Wrapper,
      });

      // Fire multiple mutations quickly
      await act(async () => {
        result.current.deleteMovieFromGoogleDrive.mutate('movie-rapid-1');
        result.current.deleteMovieFromGoogleDrive.mutate('movie-rapid-2');
        result.current.deleteMovieFromGoogleDrive.mutate('movie-rapid-3');
      });

      // Wait for all to complete
      await waitFor(() =>
        expect(mockDeleteMovieByIdToGoogleDrive).toHaveBeenCalledTimes(3)
      );

      // Assert: All mutations should have been called
      expect(mockDeleteMovieByIdToGoogleDrive).toHaveBeenCalledWith(
        'movie-rapid-1'
      );
      expect(mockDeleteMovieByIdToGoogleDrive).toHaveBeenCalledWith(
        'movie-rapid-2'
      );
      expect(mockDeleteMovieByIdToGoogleDrive).toHaveBeenCalledWith(
        'movie-rapid-3'
      );
    });
  });
});
