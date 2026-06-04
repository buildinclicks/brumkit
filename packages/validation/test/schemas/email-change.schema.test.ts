import { describe, it, expect } from 'vitest';

import {
  requestEmailChangeSchema,
  verifyEmailChangeSchema,
} from '../../src/schemas/email-change.schema';

describe('Email Change Validation Schemas', () => {
  describe('requestEmailChangeSchema', () => {
    it('should accept valid email and password', () => {
      const result = requestEmailChangeSchema.safeParse({
        newEmail: 'newemail@example.com',
        password: 'MyPassword123!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = requestEmailChangeSchema.safeParse({
        newEmail: 'not-an-email',
        password: 'MyPassword123!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing email', () => {
      const result = requestEmailChangeSchema.safeParse({
        password: 'MyPassword123!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const result = requestEmailChangeSchema.safeParse({
        newEmail: 'newemail@example.com',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const result = requestEmailChangeSchema.safeParse({
        newEmail: 'newemail@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('verifyEmailChangeSchema', () => {
    it('should accept a valid token', () => {
      const result = verifyEmailChangeSchema.safeParse({ token: 'abc123xyz' });
      expect(result.success).toBe(true);
    });

    it('should reject empty token', () => {
      const result = verifyEmailChangeSchema.safeParse({ token: '' });
      expect(result.success).toBe(false);
    });

    it('should reject missing token', () => {
      const result = verifyEmailChangeSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
