import { z } from 'zod';
import { ValidationMessages } from '../messages';

/**
 * Email validation schema
 * - Must be valid email format
 * - Min length: 5 characters (a@b.c)
 * - Max length: 255 characters
 * - Automatically trimmed and lowercased
 */
export const emailSchema = z
  .string({ error: ValidationMessages.EMAIL_REQUIRED })
  .trim() // Trim FIRST, before validation
  .email(ValidationMessages.EMAIL_INVALID)
  .min(5, ValidationMessages.EMAIL_TOO_SHORT)
  .max(255, ValidationMessages.EMAIL_TOO_LONG)
  .toLowerCase();

/**
 * Email validation rules with required and optional variants
 */
export const emailRule = {
  required: emailSchema,
  optional: emailSchema.optional(),
} as const;
