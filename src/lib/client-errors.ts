import { toast } from 'react-toastify';
import { ApiResponse } from './api-wrapper';
import { logError } from './errors';

export interface ClientErrorOptions {
  showToast?: boolean;
  customMessage?: string;
  duration?: number;
}

export function handleClientError(
  error: unknown,
  options: ClientErrorOptions = {}
): string {
  const { showToast = false, customMessage, duration = 5000 } = options;

  let message = "Une erreur inattendue s'est produite";

  if (error && typeof error === 'object' && 'message' in error) {
    message = (error as { message: string }).message;
  } else if (typeof error === 'string') {
    message = error;
  }

  const displayMessage = customMessage || message;

  if (showToast) {
    toast.error(displayMessage, { autoClose: duration });
  }
  logError(error, 'handleClientError');
  return displayMessage;
}

export function handleApiResponse<T>(
  response: ApiResponse<T>,
  options: ClientErrorOptions = {}
): T | null {
  if (response.success && response.data !== undefined) {
    return response.data;
  }

  if (response.error) {
    const errorMessage = getErrorMessage(
      response.error.code,
      response.error.message
    );
    handleClientError(errorMessage, options);
    return null;
  }

  handleClientError('Réponse API invalide', options);
  return null;
}

export function getErrorMessage(code: string, defaultMessage: string): string {
  const errorMessages: Record<string, string> = {
    // Generic errors
    INTERNAL_SERVER_ERROR:
      'Erreur interne du serveur. Veuillez réessayer plus tard.',
    VALIDATION_ERROR: 'Données invalides. Veuillez vérifier vos informations.',
    NOT_FOUND: 'Ressource introuvable.',
    UNAUTHORIZED: 'Vous devez vous connecter pour effectuer cette action.',
    FORBIDDEN: "Vous n'avez pas les permissions nécessaires.",
    BAD_REQUEST: 'Requête invalide. Veuillez vérifier vos données.',

    // Database errors
    DATABASE_CONNECTION_ERROR:
      'Impossible de se connecter à la base de données.',
    DATABASE_QUERY_ERROR: "Erreur lors de l'accès aux données.",
    DUPLICATE_ENTRY: 'Cette entrée existe déjà.',

    // Authentication errors
    INVALID_CREDENTIALS: 'Identifiants invalides.',
    TOKEN_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',

    // Movie specific errors
    MOVIE_NOT_FOUND: 'Film introuvable.',
    MOVIE_ALREADY_EXISTS: 'Ce film existe déjà.',
    INVALID_MOVIE_DATA: 'Données du film invalides.',

    // Genre specific errors
    GENRE_NOT_FOUND: 'Genre introuvable.',
    GENRE_ALREADY_EXISTS: 'Ce genre existe déjà.',

    // User specific errors
    USER_NOT_FOUND: 'Utilisateur introuvable.',
    USER_ALREADY_EXISTS: 'Cet utilisateur existe déjà.',
    INVALID_USER_ROLE: 'Rôle utilisateur invalide.',

    // External API errors
    EXTERNAL_API_ERROR: 'Erreur avec un service externe.',
    GOOGLE_DRIVE_ERROR: 'Erreur avec Google Drive.',
    MISTRAL_API_ERROR: "Erreur avec l'IA Mistral.",
  };

  return errorMessages[code] || defaultMessage;
}

export class ClientErrorHandler {
  private static instance: ClientErrorHandler;
  private errorCallbacks: Map<string, (error: unknown) => void> = new Map(); // eslint-disable-line no-unused-vars

  static getInstance(): ClientErrorHandler {
    if (!ClientErrorHandler.instance) {
      ClientErrorHandler.instance = new ClientErrorHandler();
    }
    return ClientErrorHandler.instance;
  }
  onError(
    errorCode: string,
    callback: (error: unknown) => void // eslint-disable-line no-unused-vars
  ): void {
    this.errorCallbacks.set(errorCode, callback);
  }

  handleError(error: unknown, code?: string): void {
    if (code && this.errorCallbacks.has(code)) {
      const callback = this.errorCallbacks.get(code)!;
      callback(error);
      return;
    }

    handleClientError(error, { showToast: true });
  }

  removeErrorHandler(errorCode: string): void {
    this.errorCallbacks.delete(errorCode);
  }

  clearAllHandlers(): void {
    this.errorCallbacks.clear();
  }
}

export function withClientErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>, // eslint-disable-line no-unused-vars
  options: ClientErrorOptions = {}
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleClientError(error, { showToast: true, ...options });
      return null;
    }
  };
}

export function isApiError(response: unknown): response is ApiResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    'status' in response
  );
}

export async function safeApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: ClientErrorOptions = {}
): Promise<T | null> {
  try {
    const response = await apiCall();
    return handleApiResponse(response, options);
  } catch (error) {
    handleClientError(error, { showToast: true, ...options });
    return null;
  }
}

export function createRetryableApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  maxRetries: number = 3,
  delay: number = 1000
) {
  return async (options: ClientErrorOptions = {}): Promise<T | null> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await apiCall();

        if (response.success) {
          return handleApiResponse(response, options);
        }

        if (attempt === maxRetries) {
          return handleApiResponse(response, options);
        }

        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      } catch (error) {
        if (attempt === maxRetries) {
          handleClientError(error, { showToast: true, ...options });
          return null;
        }

        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }

    return null;
  };
}
