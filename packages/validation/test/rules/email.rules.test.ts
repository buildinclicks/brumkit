import { describe, it, expect } from 'vitest';
import { emailSchema, emailRule } from '../../src/rules/email.rules.js';

describe('emailSchema', () => {
  describe('valid emails', () => {
    it('should accept valid email address', () => {
      const result = emailSchema.safeParse('user@example.com');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('user@example.com');
      }
    });

    it('should accept email with subdomain', () => {
      const result = emailSchema.safeParse('user@mail.example.com');
      expect(result.success).toBe(true);
    });

    it('should accept email with plus sign', () => {
      const result = emailSchema.safeParse('user+tag@example.com');
      expect(result.success).toBe(true);
    });

    it('should accept email with dots', () => {
      const result = emailSchema.safeParse('user.name@example.com');
      expect(result.success).toBe(true);
    });

    it('should accept email with numbers', () => {
      const result = emailSchema.safeParse('user123@example.com');
      expect(result.success).toBe(true);
    });

    it('should trim whitespace', () => {
      const result = emailSchema.safeParse('  user@example.com  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('user@example.com');
      }
    });

    it('should convert to lowercase', () => {
      const result = emailSchema.safeParse('User@Example.COM');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('user@example.com');
      }
    });
  });

  describe('invalid emails', () => {
    it('should reject email without @', () => {
      const result = emailSchema.safeParse('userexample.com');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('email.invalid');
      }
    });

    it('should reject email without domain', () => {
      const result = emailSchema.safeParse('user@');
      expect(result.success).toBe(false);
    });

    it('should reject email without local part', () => {
      const result = emailSchema.safeParse('@example.com');
      expect(result.success).toBe(false);
    });

    it('should reject email with spaces', () => {
      const result = emailSchema.safeParse('user name@example.com');
      expect(result.success).toBe(false);
    });

    it('should reject too short email', () => {
      const result = emailSchema.safeParse('a@b');
      expect(result.success).toBe(false);
      if (!result.success) {
        // Could be either too_short or invalid format, depends on Zod validation order
        const message = result.error.issues[0].message;
        expect(
          message.includes('email.too_short') ||
            message.includes('email.invalid')
        ).toBe(true);
      }
    });

    it('should reject too long email (>255 chars)', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = emailSchema.safeParse(longEmail);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('email.too_long');
      }
    });

    it('should reject empty string', () => {
      const result = emailSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });
});

describe('emailRule', () => {
  describe('required', () => {
    it('should reject undefined', () => {
      const result = emailRule.required.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it('should accept valid email', () => {
      const result = emailRule.required.safeParse('user@example.com');
      expect(result.success).toBe(true);
    });
  });

  describe('optional', () => {
    it('should accept undefined', () => {
      const result = emailRule.optional.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it('should accept valid email', () => {
      const result = emailRule.optional.safeParse('user@example.com');
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = emailRule.optional.safeParse('not-an-email');
      expect(result.success).toBe(false);
    });
  });
});
