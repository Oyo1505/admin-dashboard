export type DALErrorType = 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND';

export class DALError extends Error {
  constructor(
    public type: DALErrorType,
    message: string
  ) {
    super(message);
    this.name = 'DALError';
  }

  toHTTPStatus(): number {
    switch (this.type) {
      case 'UNAUTHORIZED':
        return 401;
      case 'FORBIDDEN':
        return 403;
      case 'NOT_FOUND':
        return 404;
      default:
        return 500;
    }
  }
}

/**
 * Converts a DALError into a JSON Response for API routes.
 * Returns null for any other error so the caller can handle it.
 */
export function toDALErrorResponse(error: unknown): Response | null {
  if (!(error instanceof DALError)) return null;
  return Response.json(
    { error: error.message },
    { status: error.toHTTPStatus() }
  );
}
