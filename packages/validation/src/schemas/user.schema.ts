import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { emailRule } from '../rules/email.rules';
import { usernameSchema } from '../rules/username.rules';
import { passwordSchema } from '../rules/password.rules';
import { ValidationMessages } from '../messages';

// ============================================
// CREATE USER (Registration/Admin)
// ============================================

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, ValidationMessages.USER_NAME_REQUIRED)
    .max(255, ValidationMessages.USER_NAME_TOO_LONG)
    .optional(),
  email: emailRule.required,
  username: usernameSchema.optional(),
  password: passwordSchema.optional(), // Optional for OAuth-only users
  bio: z.string().max(500, ValidationMessages.USER_BIO_TOO_LONG).optional(),
  image: z.string().url(ValidationMessages.USER_IMAGE_INVALID).optional(),
  role: z.nativeEnum(UserRole).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// ============================================
// UPDATE USER PROFILE (Self)
// ============================================

export const updateUserProfileSchema = z.object({
  name: z
    .string()
    .min(1, ValidationMessages.USER_NAME_REQUIRED)
    .max(255, ValidationMessages.USER_NAME_TOO_LONG)
    .optional(),
  username: usernameSchema.optional(),
  bio: z.string().max(500, ValidationMessages.USER_BIO_TOO_LONG).optional(),
  image: z
    .string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: ValidationMessages.USER_IMAGE_INVALID,
    }),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;

// ============================================
// UPDATE USER (Admin)
// ============================================

export const updateUserSchema = updateUserProfileSchema.extend({
  email: emailRule.optional,
  role: z.nativeEnum(UserRole).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ============================================
// DELETE USER
// ============================================

export const deleteUserSchema = z.object({
  id: z.string().cuid(ValidationMessages.CUID_INVALID),
});

export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
