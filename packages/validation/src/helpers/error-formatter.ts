import { ZodError, type ZodIssue } from 'zod';

/**
 * Formatted validation error
 */
export interface FormattedValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Format Zod errors into a more user-friendly structure
 *
 * @param error - ZodError from validation
 * @returns Array of formatted errors
 */
export function formatZodError(error: ZodError): FormattedValidationError[] {
  return error.issues.map((err: ZodIssue) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}

/**
 * Get error message for a specific field
 *
 * @param error - ZodError from validation
 * @param field - Field name (supports dot notation for nested fields)
 * @returns Error message or undefined if field has no error
 */
export function getFieldError(
  error: ZodError,
  field: string
): string | undefined {
  return error.issues.find((err) => err.path.join('.') === field)?.message;
}

/**
 * Get all error messages for a specific field (for fields with multiple errors)
 *
 * @param error - ZodError from validation
 * @param field - Field name (supports dot notation for nested fields)
 * @returns Array of error messages
 */
export function getFieldErrors(error: ZodError, field: string): string[] {
  return error.issues
    .filter((err) => err.path.join('.') === field)
    .map((err) => err.message);
}

/**
 * Convert Zod errors to an object keyed by field name
 *
 * @param error - ZodError from validation
 * @returns Object with field names as keys and error messages as values
 */
export function zodErrorToObject(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  error.issues.forEach((err) => {
    const field = err.path.join('.');
    if (!errors[field]) {
      errors[field] = err.message;
    }
  });

  return errors;
}

/**
 * Check if a specific field has an error
 *
 * @param error - ZodError from validation
 * @param field - Field name (supports dot notation for nested fields)
 * @returns true if field has error, false otherwise
 */
export function hasFieldError(error: ZodError, field: string): boolean {
  return error.issues.some((err) => err.path.join('.') === field);
}
