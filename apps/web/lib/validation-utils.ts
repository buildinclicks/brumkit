import type { ZodError } from 'zod';

/**
 * Map Zod error to translated message key
 *
 * The message from Zod schema is the i18n key (e.g., 'validation.email.invalid')
 * This function extracts and returns those keys for translation
 */
export function mapZodErrorToKeys(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  error.issues.forEach((err) => {
    const fieldName = err.path.join('.');
    // The message IS the i18n key
    fieldErrors[fieldName] = err.message;
  });

  return fieldErrors;
}

/**
 * Format a field error for display
 */
export function formatFieldError(
  fieldName: string,
  errors: Record<string, string>
): string | undefined {
  return errors[fieldName];
}
