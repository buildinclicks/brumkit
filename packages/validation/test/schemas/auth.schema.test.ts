import { describe, it, expect } from 'vitest';

import {
  loginSchema,
  registerSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
} from '../../src/schemas/auth.schema';

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should accept valid email and password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const result = loginSchema.safeParse({ password: 'password123' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com' });
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    const validData = {
      name: 'Test User',
      email: 'user@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };

    it('should accept valid registration data', () => {
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject when passwords do not match', () => {
      const result = registerSchema.safeParse({
        ...validData,
        confirmPassword: 'DifferentPassword!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const result = registerSchema.safeParse({ ...validData, name: '' });
      expect(result.success).toBe(false);
    });

    it('should reject missing email', () => {
      const { email: _, ...rest } = validData;
      const result = registerSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'weak',
        confirmPassword: 'weak',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordRequestSchema', () => {
    it('should accept valid email', () => {
      const result = resetPasswordRequestSchema.safeParse({
        email: 'user@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const result = resetPasswordRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = resetPasswordRequestSchema.safeParse({
        email: 'not-email',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    const validData = {
      token: 'abc123token',
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };

    it('should accept valid reset password data', () => {
      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing token', () => {
      const result = resetPasswordSchema.safeParse({
        ...validData,
        token: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const result = resetPasswordSchema.safeParse({
        ...validData,
        confirmPassword: 'DifferentPass!',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    const validData = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };

    it('should accept valid change password data', () => {
      const result = changePasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject when new passwords do not match', () => {
      const result = changePasswordSchema.safeParse({
        ...validData,
        confirmPassword: 'MismatchedPass!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject when new password is same as current', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'SamePassword123!',
        newPassword: 'SamePassword123!',
        confirmPassword: 'SamePassword123!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing current password', () => {
      const result = changePasswordSchema.safeParse({
        ...validData,
        currentPassword: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('verifyEmailSchema', () => {
    it('should accept a valid token', () => {
      const result = verifyEmailSchema.safeParse({ token: 'abc123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty token', () => {
      const result = verifyEmailSchema.safeParse({ token: '' });
      expect(result.success).toBe(false);
    });

    it('should reject missing token', () => {
      const result = verifyEmailSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
