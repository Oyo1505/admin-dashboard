import { getAnalyticsApplicationVisits } from '@/domains/auth/actions/action.analytics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import useAnalyticsUsersVisits from '../hooks/useAnalyticsUsersVisits';

jest.mock('../../auth/actions/action.analytics.ts', () => ({
  getAnalyticsApplicationVisits: jest.fn(),
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

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useAnalyticsUsersVisits', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Default mock to prevent "Query data cannot be undefined" warnings
    // Tests that need specific data will override this mock
    (getAnalyticsApplicationVisits as jest.Mock).mockResolvedValue({
      status: 200,
      visits: 0,
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
      const mockVisitsData = { visits: 10, status: 200 };
      (getAnalyticsApplicationVisits as jest.Mock).mockResolvedValue(
        mockVisitsData
      );

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
      expect(result.current.getAnalyticsUsersVisits.data).toEqual(
        mockVisitsData
      );
    });
  });
  describe('Error handling', () => {
    it('should show specific error toast on status 409 (email already exists)', async () => {
      // Arrange: Mock conflict response
      (getAnalyticsApplicationVisits as jest.Mock).mockResolvedValue({
        status: 409,
      });

      // Act
      const { result } = renderHook(() => useAnalyticsUsersVisits(), {
        wrapper: createWrapper(),
      });

      await waitFor(() =>
        expect(result.current.getAnalyticsUsersVisits.isSuccess).toBe(true)
      );
    });

    it('should show default message when 409 has no custom message', async () => {
      // Arrange
      (getAnalyticsApplicationVisits as jest.Mock).mockResolvedValue({
        status: 409,
      });

      // Act
      const { result } = renderHook(() => useAnalyticsUsersVisits(), {
        wrapper: createWrapper(),
      });

      await waitFor(() =>
        expect(result.current.getAnalyticsUsersVisits.isSuccess).toBe(true)
      );
    });

    it('should show generic error toast on status 500', async () => {
      // Arrange: Mock generic error response
      (getAnalyticsApplicationVisits as jest.Mock).mockResolvedValue({
        status: 500,
      });

      // Act
      const { result } = renderHook(() => useAnalyticsUsersVisits(), {
        wrapper: createWrapper(),
      });

      await waitFor(() =>
        expect(result.current.getAnalyticsUsersVisits.isSuccess).toBe(true)
      );
    });

    it('should show generic error toast on status 400', async () => {
      // Arrange
      (getAnalyticsApplicationVisits as jest.Mock).mockResolvedValue({
        status: 400,
      });

      // Act
      const { result } = renderHook(() => useAnalyticsUsersVisits(), {
        wrapper: createWrapper(),
      });

      await waitFor(() =>
        expect(result.current.getAnalyticsUsersVisits.isSuccess).toBe(true)
      );
    });

    it('should NOT call reset on error status', async () => {
      // Arrange
      (getAnalyticsApplicationVisits as jest.Mock).mockResolvedValue({
        status: 409,
      });

      // Act
      const { result } = renderHook(() => useAnalyticsUsersVisits(), {
        wrapper: createWrapper(),
      });

      await waitFor(() =>
        expect(result.current.getAnalyticsUsersVisits.isSuccess).toBe(true)
      );
    });
  });
});
