import { describe, it, expect } from 'vitest';
import {
  passwordSchema,
  passwordRule,
} from '../../src/rules/password.rules.js';

describe('passwordSchema', () => {
  describe('valid passwords', () => {
    it('should accept valid password with all requirements', () => {
      const result = passwordSchema.safeParse('Password123');
      expect(result.success).toBe(true);
    });

    it('should accept password with special characters', () => {
      const result = passwordSchema.safeParse('Pass@word123!');
      expect(result.success).toBe(true);
    });

    it('should accept minimum length password', () => {
      const result = passwordSchema.safeParse('Pass1234');
      expect(result.success).toBe(true);
    });

    it('should accept maximum length password', () => {
      const longPassword = 'P1' + 'a'.repeat(126);
      const result = passwordSchema.safeParse(longPassword);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid passwords', () => {
    it('should reject password without uppercase', () => {
      const result = passwordSchema.safeParse('password123');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('password.no_uppercase');
      }
    });

    it('should reject password without lowercase', () => {
      const result = passwordSchema.safeParse('PASSWORD123');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('password.no_lowercase');
      }
    });

    it('should reject password without number', () => {
      const result = passwordSchema.safeParse('Password');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('password.no_number');
      }
    });

    it('should reject too short password', () => {
      const result = passwordSchema.safeParse('Pass12');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('password.too_short');
      }
    });

    it('should reject too long password', () => {
      const longPassword = 'P1' + 'a'.repeat(127);
      const result = passwordSchema.safeParse(longPassword);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('password.too_long');
      }
    });

    it('should reject empty string', () => {
      const result = passwordSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });
});

describe('passwordRule', () => {
  describe('required', () => {
    it('should reject undefined', () => {
      const result = passwordRule.required.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it('should accept valid password', () => {
      const result = passwordRule.required.safeParse('Password123');
      expect(result.success).toBe(true);
    });
  });

  describe('optional', () => {
    it('should accept undefined', () => {
      const result = passwordRule.optional.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it('should accept valid password', () => {
      const result = passwordRule.optional.safeParse('Password123');
      expect(result.success).toBe(true);
    });

    it('should reject invalid password', () => {
      const result = passwordRule.optional.safeParse('weak');
      expect(result.success).toBe(false);
    });
  });
});
