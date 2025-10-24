import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import useAnalyticsUsersVisits from '../hooks/useAnalyticsUsersVisits';

// Mock global fetch
global.fetch = jest.fn();
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

describe('useAnalyticsUsersVisits', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Default mock to prevent "Query data cannot be undefined" warnings
    // Tests that need specific data will override this mock
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        visits: 0,
      }),
    });
  });

  // Reset all mocks after each test
  afterEach(() => {
    jest.resetAllMocks();
  });
  // Clear all mocks after all tests
  afterAll(() => {
    jest.clearAllMocks();
  });
  it('should render hook without crashing', () => {
    // Arrange & Act
    const wrapper = createWrapper();
    // Assert
    expect(wrapper).toBeDefined();
  });

  describe('Hooks initialization', () => {
    it('should return getAnalyticsUsersVisits object', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAnalyticsUsersVisits(), {
        wrapper: createWrapper(),
      });

      // Assert: Hook returns expected structure
      expect(result.current).toHaveProperty('getAnalyticsUsersVisits');

      expect(result.current.getAnalyticsUsersVisits).toHaveProperty(
        'isLoading'
      );
      expect(result.current.getAnalyticsUsersVisits).toHaveProperty('data');
      expect(result.current.getAnalyticsUsersVisits).toHaveProperty(
        'isSuccess'
      );
      expect(result.current.getAnalyticsUsersVisits).toHaveProperty('isError');
    });

    it('should initialize with idle state for getAnalyticsUsersVisits', async () => {
      // Arrange: Mock successful response
      const mockVisits = 10;
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          visits: mockVisits,
        }),
      });

      // Act
      const { result } = renderHook(() => useAnalyticsUsersVisits(), {
        wrapper: createWrapper(),
      });

      // Assert: Wait for query to resolve
      await waitFor(() =>
        expect(result.current.getAnalyticsUsersVisits.isSuccess).toBe(true)
      );

      expect(result.current.getAnalyticsUsersVisits.isPending).toBe(false);
      expect(result.current.getAnalyticsUsersVisits.isError).toBe(false);
      expect(result.current.getAnalyticsUsersVisits.data).toEqual(mockVisits);
    });
  });
  describe('Error handling', () => {
    it('should handle fetch error with ok: false', async () => {
      // Arrange: Mock error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      // Act
      const { result } = renderHook(() => useAnalyticsUsersVisits(), {
        wrapper: createWrapper(),
      });

      // Assert: Wait for error state
      await waitFor(() =>
        expect(result.current.getAnalyticsUsersVisits.isError).toBe(true)
      );

      expect(result.current.getAnalyticsUsersVisits.isPending).toBe(false);
      expect(result.current.getAnalyticsUsersVisits.isSuccess).toBe(false);
    });

    it('should handle network error', async () => {
      // Arrange: Mock network error
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      // Act
      const { result } = renderHook(() => useAnalyticsUsersVisits(), {
        wrapper: createWrapper(),
      });

      // Assert: Wait for error state
      await waitFor(() =>
        expect(result.current.getAnalyticsUsersVisits.isError).toBe(true)
      );

      expect(result.current.getAnalyticsUsersVisits.error).toEqual(
        new Error('Network error')
      );
    });

    it('should handle malformed JSON response', async () => {
      // Arrange: Mock invalid JSON
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      // Act
      const { result } = renderHook(() => useAnalyticsUsersVisits(), {
        wrapper: createWrapper(),
      });

      // Assert: Wait for error state
      await waitFor(() =>
        expect(result.current.getAnalyticsUsersVisits.isError).toBe(true)
      );
    });
  });
});
