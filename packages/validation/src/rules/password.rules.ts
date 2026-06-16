import { z } from 'zod';
import { ValidationMessages } from '../messages';

/**
 * Password validation schema
 * - Min length: 8 characters
 * - Max length: 128 characters
 * - Must contain at least one uppercase letter
 * - Must contain at least one lowercase letter
 * - Must contain at least one number
 */
export const passwordSchema = z
  .string({ error: ValidationMessages.PASSWORD_REQUIRED })
  .min(8, ValidationMessages.PASSWORD_TOO_SHORT)
  .max(128, ValidationMessages.PASSWORD_TOO_LONG)
  .regex(/[A-Z]/, ValidationMessages.PASSWORD_NO_UPPERCASE)
  .regex(/[a-z]/, ValidationMessages.PASSWORD_NO_LOWERCASE)
  .regex(/[0-9]/, ValidationMessages.PASSWORD_NO_NUMBER);

/**
 * Password validation rules with required and optional variants
 */
export const passwordRule = {
  required: passwordSchema,
  optional: passwordSchema.optional(),
} as const;
