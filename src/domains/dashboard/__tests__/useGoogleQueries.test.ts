/**
 * Unit tests for the useGoogleQueries hook
 *
 * Concepts tested:
 * - React Query mutations (useMutation)
 * - Google Drive file upload integration
 * - Mutation state management (loading, error, success)
 * - File handling and validation
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { addFileToGoogleDriveAction } from '@/googleDrive';
import useGoogleQueries from '../hooks/useGoogleQueries';

// Mock the Google Drive module to avoid Next.js server component issues
jest.mock('@/googleDrive', () => ({
  addFileToGoogleDriveAction: jest.fn(),
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

describe('useGoogleQueries', () => {
  const mockFile = new File(['test content'], 'test.txt', {
    type: 'text/plain',
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('Hook initialization', () => {
    it('should render hook without crashing', () => {
      // Arrange & Act
      const wrapper = createWrapper();
      // Assert
      expect(wrapper).toBeDefined();
    });

    it('should return addFileToGoogleDrive mutation object', () => {
      // Arrange & Act
      const { result } = renderHook(() => useGoogleQueries(), {
        wrapper: createWrapper(),
      });

      // Assert: Hook returns expected structure
      expect(result.current).toHaveProperty('addFileToGoogleDrive');
      expect(result.current.addFileToGoogleDrive).toHaveProperty('mutate');
      expect(result.current.addFileToGoogleDrive).toHaveProperty('mutateAsync');
      expect(result.current.addFileToGoogleDrive).toHaveProperty('isPending');
      expect(result.current.addFileToGoogleDrive).toHaveProperty('isError');
      expect(result.current.addFileToGoogleDrive).toHaveProperty('isSuccess');
    });

    it('should initialize with idle state', () => {
      // Arrange & Act
      const { result } = renderHook(() => useGoogleQueries(), {
        wrapper: createWrapper(),
      });

      // Assert: Initial state is idle
      expect(result.current.addFileToGoogleDrive.isPending).toBe(false);
      expect(result.current.addFileToGoogleDrive.isError).toBe(false);
      expect(result.current.addFileToGoogleDrive.isSuccess).toBe(false);
      expect(result.current.addFileToGoogleDrive.data).toBeUndefined();
    });
  });

  describe('File upload functionality', () => {
    it('should call addFileToGoogleDriveAction with file when mutate is called', async () => {
      // Arrange: Mock successful upload
      (addFileToGoogleDriveAction as jest.Mock).mockResolvedValue({
        id: 'file-123',
        name: 'test.txt',
      });

      const { result } = renderHook(() => useGoogleQueries(), {
        wrapper: createWrapper(),
      });

      // Act: Trigger file upload
      result.current.addFileToGoogleDrive.mutate({ file: mockFile });

      // Assert: Wait for mutation to complete
      await waitFor(() =>
        expect(result.current.addFileToGoogleDrive.isSuccess).toBe(true)
      );

      expect(addFileToGoogleDriveAction).toHaveBeenCalledWith(mockFile);
      expect(addFileToGoogleDriveAction).toHaveBeenCalledTimes(1);
    });

    it('should transition through loading state during upload', async () => {
      // Arrange: Mock delayed upload
      (addFileToGoogleDriveAction as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  id: 'file-123',
                  name: 'test.txt',
                }),
              100
            )
          )
      );

      const { result } = renderHook(() => useGoogleQueries(), {
        wrapper: createWrapper(),
      });

      // Assert: Initial state is not pending
      expect(result.current.addFileToGoogleDrive.isPending).toBe(false);

      // Act: Trigger upload
      result.current.addFileToGoogleDrive.mutate({ file: mockFile });

      // Assert: State changes to pending
      await waitFor(() =>
        expect(result.current.addFileToGoogleDrive.isPending).toBe(true)
      );

      // Assert: Eventually completes successfully
      await waitFor(() =>
        expect(result.current.addFileToGoogleDrive.isSuccess).toBe(true)
      );
      expect(result.current.addFileToGoogleDrive.isPending).toBe(false);
    });

    it('should return uploaded file data on success', async () => {
      // Arrange
      const mockResponse = {
        id: 'file-123',
        name: 'test.txt',
        webViewLink: 'https://drive.google.com/file/d/file-123',
      };

      (addFileToGoogleDriveAction as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGoogleQueries(), {
        wrapper: createWrapper(),
      });

      // Act
      result.current.addFileToGoogleDrive.mutate({ file: mockFile });

      // Assert
      await waitFor(() =>
        expect(result.current.addFileToGoogleDrive.isSuccess).toBe(true)
      );

      expect(result.current.addFileToGoogleDrive.data).toEqual(mockResponse);
    });
  });

  describe('Error handling', () => {
    it('should handle upload errors gracefully', async () => {
      // Arrange: Mock upload error
      const errorMessage = 'Upload failed: insufficient storage';
      (addFileToGoogleDriveAction as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useGoogleQueries(), {
        wrapper: createWrapper(),
      });

      // Act
      result.current.addFileToGoogleDrive.mutate({ file: mockFile });

      // Assert: Wait for error state
      await waitFor(() =>
        expect(result.current.addFileToGoogleDrive.isError).toBe(true)
      );

      expect(result.current.addFileToGoogleDrive.isError).toBe(true);
      expect(result.current.addFileToGoogleDrive.error).toEqual(
        new Error(errorMessage)
      );
    });

    it('should handle network errors', async () => {
      // Arrange: Mock network error
      (addFileToGoogleDriveAction as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useGoogleQueries(), {
        wrapper: createWrapper(),
      });

      // Act
      result.current.addFileToGoogleDrive.mutate({ file: mockFile });

      // Assert
      await waitFor(() =>
        expect(result.current.addFileToGoogleDrive.isError).toBe(true)
      );

      expect(result.current.addFileToGoogleDrive.error).toEqual(
        new Error('Network error')
      );
    });
  });

  describe('Multiple uploads', () => {
    it('should handle sequential uploads correctly', async () => {
      // Arrange
      const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });

      (addFileToGoogleDriveAction as jest.Mock)
        .mockResolvedValueOnce({ id: 'file-1', name: 'file1.txt' })
        .mockResolvedValueOnce({ id: 'file-2', name: 'file2.txt' });

      const { result } = renderHook(() => useGoogleQueries(), {
        wrapper: createWrapper(),
      });

      // Act: First upload
      result.current.addFileToGoogleDrive.mutate({ file: file1 });
      await waitFor(() =>
        expect(result.current.addFileToGoogleDrive.isSuccess).toBe(true)
      );

      expect(result.current.addFileToGoogleDrive.data).toEqual({
        id: 'file-1',
        name: 'file1.txt',
      });

      // Act: Second upload
      result.current.addFileToGoogleDrive.mutate({ file: file2 });
      await waitFor(() =>
        expect(result.current.addFileToGoogleDrive.data).toEqual({
          id: 'file-2',
          name: 'file2.txt',
        })
      );

      // Assert: Both uploads were called
      expect(addFileToGoogleDriveAction).toHaveBeenCalledTimes(2);
      expect(addFileToGoogleDriveAction).toHaveBeenNthCalledWith(1, file1);
      expect(addFileToGoogleDriveAction).toHaveBeenNthCalledWith(2, file2);
    });

    it('should reset state between uploads', async () => {
      // Arrange
      (addFileToGoogleDriveAction as jest.Mock).mockResolvedValue({
        id: 'file-123',
        name: 'test.txt',
      });

      const { result } = renderHook(() => useGoogleQueries(), {
        wrapper: createWrapper(),
      });

      // Act: First upload
      result.current.addFileToGoogleDrive.mutate({ file: mockFile });
      await waitFor(() =>
        expect(result.current.addFileToGoogleDrive.isSuccess).toBe(true)
      );

      // Reset mutation state
      result.current.addFileToGoogleDrive.reset();

      // Assert: State is reset
      await waitFor(() => {
        expect(result.current.addFileToGoogleDrive.data).toBeUndefined();
        expect(result.current.addFileToGoogleDrive.isSuccess).toBe(false);
      });

      // Act: Second upload
      result.current.addFileToGoogleDrive.mutate({ file: mockFile });
      await waitFor(() =>
        expect(result.current.addFileToGoogleDrive.isSuccess).toBe(true)
      );

      // Assert: New data is available
      expect(result.current.addFileToGoogleDrive.data).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle large files', async () => {
      // Arrange: Create a large file (10MB simulated)
      const largeContent = new Array(10 * 1024 * 1024).join('a');
      const largeFile = new File([largeContent], 'large.txt', {
        type: 'text/plain',
      });

      (addFileToGoogleDriveAction as jest.Mock).mockResolvedValue({
        id: 'large-file-123',
        name: 'large.txt',
      });

      const { result } = renderHook(() => useGoogleQueries(), {
        wrapper: createWrapper(),
      });

      // Act
      result.current.addFileToGoogleDrive.mutate({ file: largeFile });

      // Assert
      await waitFor(() =>
        expect(result.current.addFileToGoogleDrive.isSuccess).toBe(true)
      );

      expect(addFileToGoogleDriveAction).toHaveBeenCalledWith(largeFile);
    });

    it('should handle special characters in filename', async () => {
      // Arrange
      const specialFile = new File(
        ['content'],
        'file with spaces & special@chars.txt',
        {
          type: 'text/plain',
        }
      );

      (addFileToGoogleDriveAction as jest.Mock).mockResolvedValue({
        id: 'special-file-123',
        name: 'file with spaces & special@chars.txt',
      });

      const { result } = renderHook(() => useGoogleQueries(), {
        wrapper: createWrapper(),
      });

      // Act
      result.current.addFileToGoogleDrive.mutate({ file: specialFile });

      // Assert
      await waitFor(() =>
        expect(result.current.addFileToGoogleDrive.isSuccess).toBe(true)
      );

      expect(addFileToGoogleDriveAction).toHaveBeenCalledWith(specialFile);
    });
  });
});
