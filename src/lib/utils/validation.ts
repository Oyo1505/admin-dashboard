import HttpStatus from '@/shared/constants/httpStatus';

/**
 * Result type for validation operations
 */
type ValidationResult =
  | { valid: true }
  | { valid: false; error: { status: number; message: string } };

/**
 * Validates that a required value is present and not empty
 * Works with strings (non-empty after trim) and other values (not null/undefined)
 *
 * @param value - The value to validate
 * @param fieldName - Human-readable field name for error messages
 * @returns Validation result with error details if invalid
 *
 * @example
 * ```typescript
 * const titleValidation = validateRequired(movie.title, 'Title');
 * if (!titleValidation.valid) {
 *   return titleValidation.error;
 * }
 * ```
 */
export function validateRequired<T>(
  value: T | undefined | null,
  fieldName: string
): ValidationResult {
  if (value === undefined || value === null) {
    return {
      valid: false,
      error: {
        status: HttpStatus.BAD_REQUEST,
        message: `${fieldName} is required`,
      },
    };
  }

  if (typeof value === 'string' && !value.trim()) {
    return {
      valid: false,
      error: {
        status: HttpStatus.BAD_REQUEST,
        message: `${fieldName} cannot be empty`,
      },
    };
  }

  return { valid: true };
}

/**
 * Validates that an array is present and has at least one element
 *
 * @param arr - The array to validate
 * @param fieldName - Human-readable field name for error messages
 * @returns Validation result with error details if invalid
 *
 * @example
 * ```typescript
 * const genresValidation = validateArrayNotEmpty(movie.genresIds, 'Genres');
 * if (!genresValidation.valid) {
 *   return genresValidation.error;
 * }
 * ```
 */
export function validateArrayNotEmpty<T>(
  arr: T[] | undefined | null,
  fieldName: string
): ValidationResult {
  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    return {
      valid: false,
      error: {
        status: HttpStatus.BAD_REQUEST,
        message: `At least one ${fieldName} is required`,
      },
    };
  }

  return { valid: true };
}

/**
 * Validates that a value is a positive number
 *
 * @param value - The value to validate
 * @param fieldName - Human-readable field name for error messages
 * @returns Validation result with error details if invalid
 */
export function validatePositiveNumber(
  value: number | undefined | null,
  fieldName: string
): ValidationResult {
  if (value === undefined || value === null) {
    return {
      valid: false,
      error: {
        status: HttpStatus.BAD_REQUEST,
        message: `${fieldName} is required`,
      },
    };
  }

  if (typeof value !== 'number' || value <= 0) {
    return {
      valid: false,
      error: {
        status: HttpStatus.BAD_REQUEST,
        message: `${fieldName} must be a positive number`,
      },
    };
  }

  return { valid: true };
}

/**
 * Validates that a string matches an email pattern
 *
 * @param email - The email string to validate
 * @returns Validation result with error details if invalid
 */
export function validateEmail(email: string | undefined | null): ValidationResult {
  const requiredCheck = validateRequired(email, 'Email');
  if (!requiredCheck.valid) {
    return requiredCheck;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email as string)) {
    return {
      valid: false,
      error: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid email format',
      },
    };
  }

  return { valid: true };
}
