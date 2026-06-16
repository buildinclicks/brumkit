import { z } from 'zod';
import { ValidationMessages } from '../messages';

/**
 * Slug validation schema
 * - Min length: 3 characters
 * - Max length: 255 characters
 * - Only lowercase letters, numbers, and hyphens
 * - Cannot start or end with hyphen
 * - Cannot have consecutive hyphens
 */
export const slugSchema = z
  .string({ error: ValidationMessages.SLUG_INVALID })
  .min(3, ValidationMessages.SLUG_TOO_SHORT)
  .max(255, ValidationMessages.SLUG_TOO_LONG)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, ValidationMessages.SLUG_INVALID);

/**
 * Slug validation rules with required and optional variants
 */
export const slugRule = {
  required: slugSchema,
  optional: slugSchema.optional(),
} as const;
