import {
  AppError,
  createError,
  handlePrismaError,
  isAppError,
  logError,
} from './errors';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    statusCode: number;
    details?: Record<string, unknown>;
  };
  status: number;
}

export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): ApiResponse<T> {
  return {
    success: true,
    data,
    status,
  };
}

export function createErrorResponse<T = unknown>(
  error: AppError,
  status?: number
): ApiResponse<T> {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      statusCode: status || error.statusCode,
      details: error.details,
    },
    status: status || error.statusCode,
  };
}

export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  context?: string
) {
  return async (...args: T): Promise<ApiResponse<R>> => {
    try {
      const result = await fn(...args);
      return createSuccessResponse(result);
    } catch (error) {
      logError(error, context);

      if (isAppError(error)) {
        return createErrorResponse<R>(error);
      }

      const appError = handlePrismaError(error, context);
      return createErrorResponse<R>(appError);
    }
  };
}

export function withValidation<T extends unknown[], R>(
  //@ts-ignore no-unused-vars
  fn: (...args: T) => Promise<R>, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  validationFn: (...args: T) => void | Promise<void>, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  context?: string
) {
  return async (...args: T): Promise<ApiResponse<R>> => {
    try {
      await validationFn(...args);
      const result = await fn(...args);
      return createSuccessResponse(result);
    } catch (error) {
      logError(error, context);

      if (isAppError(error)) {
        return createErrorResponse<R>(error);
      }

      const appError = handlePrismaError(error, context);
      return createErrorResponse<R>(appError);
    }
  };
}

export async function safeExecute<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<ApiResponse<T>> {
  try {
    const result = await operation();
    return createSuccessResponse(result);
  } catch (error) {
    logError(error, context);

    if (isAppError(error)) {
      return createErrorResponse<T>(error);
    }

    const appError = handlePrismaError(error, context);
    return createErrorResponse<T>(appError);
  }
}

export function validateRequired<T>(
  value: T | null | undefined,
  fieldName: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw createError.validation(`Le champ ${fieldName} est requis`);
  }
}

export function validateString(
  value: unknown,
  fieldName: string,
  options?: { minLength?: number; maxLength?: number }
): asserts value is string {
  if (typeof value !== 'string') {
    throw createError.validation(`Le champ ${fieldName} doit être une chaîne`);
  }

  if (options?.minLength && value.length < options.minLength) {
    throw createError.validation(
      `Le champ ${fieldName} doit contenir au moins ${options.minLength} caractères`
    );
  }

  if (options?.maxLength && value.length > options.maxLength) {
    throw createError.validation(
      `Le champ ${fieldName} ne peut pas dépasser ${options.maxLength} caractères`
    );
  }
}

export function validateEmail(email: unknown): asserts email is string {
  validateString(email, 'email');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createError.validation("Format d'email invalide");
  }
}

export function validateId(id: unknown): asserts id is string {
  validateString(id, 'id');
  if (id.trim().length === 0) {
    throw createError.validation('ID ne peut pas être vide');
  }
}

export class ApiResponseBuilder<T = unknown> {
  private _data?: T;
  private _error?: AppError;
  private _status: number = 200;

  static success<T>(data: T, status: number = 200): ApiResponseBuilder<T> {
    const builder = new ApiResponseBuilder<T>();
    builder._data = data;
    builder._status = status;
    return builder;
  }

  static error<T = unknown>(error: AppError): ApiResponseBuilder<T> {
    const builder = new ApiResponseBuilder<T>();
    builder._error = error;
    builder._status = error.statusCode;
    return builder;
  }

  build(): ApiResponse<T> {
    if (this._error) {
      return createErrorResponse<T>(this._error, this._status);
    }

    return createSuccessResponse(this._data as T, this._status);
  }
}
