/* eslint-disable no-unused-vars */
export enum ErrorCode {
  // Generic errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  BAD_REQUEST = 'BAD_REQUEST',

  // Database errors
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR = 'DATABASE_QUERY_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',

  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Movie specific errors
  MOVIE_NOT_FOUND = 'MOVIE_NOT_FOUND',
  MOVIE_ALREADY_EXISTS = 'MOVIE_ALREADY_EXISTS',
  INVALID_MOVIE_DATA = 'INVALID_MOVIE_DATA',

  // Genre specific errors
  GENRE_NOT_FOUND = 'GENRE_NOT_FOUND',
  GENRE_ALREADY_EXISTS = 'GENRE_ALREADY_EXISTS',

  // User specific errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_USER_ROLE = 'INVALID_USER_ROLE',

  // External API errors
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  GOOGLE_DRIVE_ERROR = 'GOOGLE_DRIVE_ERROR',
  MISTRAL_API_ERROR = 'MISTRAL_API_ERROR',
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  timestamp?: Date;
  path?: string;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: Date;
  public readonly path?: string;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: Record<string, unknown>,
    path?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
    this.path = path;

    Error.captureStackTrace(this, this.constructor);
  }

  toApiError(): ApiError {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      path: this.path,
    };
  }
}

export const createError = {
  notFound: (resource: string, id?: string) =>
    new AppError(
      ErrorCode.NOT_FOUND,
      `${resource} ${id ? `avec l'ID ${id}` : ''} introuvable`,
      404
    ),

  validation: (message: string, details?: Record<string, unknown>) =>
    new AppError(ErrorCode.VALIDATION_ERROR, message, 400, details),

  unauthorized: (message: string = 'Non autorisé') =>
    new AppError(ErrorCode.UNAUTHORIZED, message, 401),

  forbidden: (message: string = 'Accès interdit') =>
    new AppError(ErrorCode.FORBIDDEN, message, 403),

  badRequest: (message: string, details?: Record<string, unknown>) =>
    new AppError(ErrorCode.BAD_REQUEST, message, 400, details),

  internal: (
    message: string = 'Erreur interne du serveur',
    details?: Record<string, unknown>
  ) => new AppError(ErrorCode.INTERNAL_SERVER_ERROR, message, 500, details),

  database: (message: string, details?: Record<string, unknown>) =>
    new AppError(ErrorCode.DATABASE_QUERY_ERROR, message, 500, details),

  duplicate: (resource: string) =>
    new AppError(ErrorCode.DUPLICATE_ENTRY, `${resource} existe déjà`, 409),

  externalApi: (service: string, message: string) =>
    new AppError(
      ErrorCode.EXTERNAL_API_ERROR,
      `Erreur API ${service}: ${message}`,
      502
    ),
};

export function handlePrismaError(error: unknown, context?: string): AppError {
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: { target?: string[] } };

    switch (prismaError.code) {
      case 'P2002':
        return createError.duplicate(
          prismaError.meta?.target?.[0] || 'Ressource'
        );
      case 'P2025':
        return createError.notFound(context || 'Ressource');
      case 'P2003':
        return createError.validation('Contrainte de clé étrangère violée');
      case 'P1001':
        return new AppError(
          ErrorCode.DATABASE_CONNECTION_ERROR,
          'Impossible de se connecter à la base de données',
          503
        );
      default:
        return createError.database(
          `Erreur de base de données: ${prismaError.code}`
        );
    }
  }

  if (error instanceof Error) {
    return createError.internal(error.message);
  }

  return createError.internal('Erreur inconnue');
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}]` : '';

  if (isAppError(error)) {
    console.error(`${timestamp} ${contextStr} AppError [${error.code}]:`, {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      path: error.path,
      stack: error.stack,
    });
  } else if (error instanceof Error) {
    console.error(`${timestamp} ${contextStr} Error:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  } else {
    console.error(`${timestamp} ${contextStr} Unknown error:`, error);
  }
}
