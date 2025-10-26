import { ApiResponse } from '@/lib/api-wrapper';
import {
  ClientErrorOptions,
  handleApiResponse,
  handleClientError,
} from '@/lib/client-errors';
import { useState } from 'react';

interface UseErrorHandlerOptions extends ClientErrorOptions {
  // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  onError?: (error: unknown) => void; // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  resetOnSuccess?: boolean;
}

interface UseErrorHandlerReturn {
  error: string | null;
  isError: boolean;
  clearError: () => void;
  handleError: (error: unknown, options?: ClientErrorOptions) => void; // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  handleApiResponse: <T>(
    response: ApiResponse<T>, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
    options?: ClientErrorOptions // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  ) => T | null;
  executeWithErrorHandling: <T>(
    operation: () => Promise<T>, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
    options?: ClientErrorOptions // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  ) => Promise<T | null>;
}

export function useErrorHandler(
  globalOptions: UseErrorHandlerOptions = {}
): UseErrorHandlerReturn {
  const [error, setError] = useState<string | null>(null);

  const clearError = () => {
    setError(null);
  };

  const handleErrorCallback = (
    err: unknown,
    options: ClientErrorOptions = {}
  ) => {
    const mergedOptions = { ...globalOptions, ...options };
    const errorMessage = handleClientError(err, mergedOptions);

    setError(errorMessage);

    if (globalOptions.onError) {
      globalOptions.onError(err);
    }
  };

  const handleApiResponseCallback = <T>(
    response: ApiResponse<T>,
    options: ClientErrorOptions = {}
  ): T | null => {
    if (response.success && response.data !== undefined) {
      if (globalOptions.resetOnSuccess) {
        clearError();
      }
      return response.data;
    }

    const mergedOptions = { ...globalOptions, ...options };
    const result = handleApiResponse(response, mergedOptions);

    if (response.error) {
      setError(response.error.message);

      if (globalOptions.onError) {
        globalOptions.onError(response.error);
      }
    }

    return result;
  };
  const executeWithErrorHandling = async <T>(
    operation: () => Promise<T>,
    options: ClientErrorOptions = {}
  ): Promise<T | null> => {
    try {
      const result = await operation();

      if (globalOptions.resetOnSuccess) {
        clearError();
      }

      return result;
    } catch (err) {
      handleErrorCallback(err, options);
      return null;
    }
  };
  return {
    error,
    isError: error !== null,
    clearError,
    handleError: handleErrorCallback,
    handleApiResponse: handleApiResponseCallback,
    executeWithErrorHandling,
  };
}

export function useApiCall<TArgs extends unknown[], TReturn>(
  apiFunction: (...args: TArgs) => Promise<ApiResponse<TReturn>>, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  options: UseErrorHandlerOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<TReturn | null>(null);
  const errorHandler = useErrorHandler(options);

  const execute = async (...args: TArgs): Promise<TReturn | null> => {
    setIsLoading(true);

    try {
      const response = await apiFunction(...args);
      const result = errorHandler.handleApiResponse(response);

      if (result !== null) {
        setData(result);
      }

      return result;
    } catch (err) {
      errorHandler.handleError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setIsLoading(false);
    errorHandler.clearError();
  };

  return {
    data,
    isLoading,
    execute,
    reset,
    ...errorHandler,
  };
}

export function useAsyncOperation<T>(options: UseErrorHandlerOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const errorHandler = useErrorHandler(options);

  const execute = async (operation: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);

    const result = await errorHandler.executeWithErrorHandling(operation);

    if (result !== null) {
      setData(result);
    }

    setIsLoading(false);
    return result;
  };

  const reset = () => {
    setData(null);
    setIsLoading(false);
    errorHandler.clearError();
  };

  return {
    data,
    isLoading,
    execute,
    reset,
    ...errorHandler,
  };
}

export function useToastErrorHandler() {
  return useErrorHandler({
    showToast: true,
    duration: 5000,
  });
}
