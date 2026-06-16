import { z } from 'zod';
import { ValidationMessages } from '../messages';

/**
 * Username validation schema
 * - Min length: 3 characters
 * - Max length: 20 characters
 * - Only alphanumeric, underscores, and hyphens
 * - Cannot start with a number
 * - Automatically trimmed and lowercased
 */
export const usernameSchema = z
  .string({ error: ValidationMessages.USERNAME_REQUIRED })
  .trim()
  .min(3, ValidationMessages.USERNAME_TOO_SHORT)
  .max(20, ValidationMessages.USERNAME_TOO_LONG)
  .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, ValidationMessages.USERNAME_INVALID)
  .toLowerCase();

/**
 * Username validation rules with required and optional variants
 */
export const usernameRule = {
  required: usernameSchema,
  optional: usernameSchema.optional(),
} as const;
