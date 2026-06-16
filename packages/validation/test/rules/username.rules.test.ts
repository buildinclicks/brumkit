import { describe, it, expect } from 'vitest';
import {
  usernameSchema,
  usernameRule,
} from '../../src/rules/username.rules.js';

describe('usernameSchema', () => {
  describe('valid usernames', () => {
    it('should accept valid username', () => {
      const result = usernameSchema.safeParse('johndoe');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('johndoe');
      }
    });

    it('should accept username with numbers', () => {
      const result = usernameSchema.safeParse('user123');
      expect(result.success).toBe(true);
    });

    it('should accept username with underscores', () => {
      const result = usernameSchema.safeParse('john_doe');
      expect(result.success).toBe(true);
    });

    it('should accept username with hyphens', () => {
      const result = usernameSchema.safeParse('john-doe');
      expect(result.success).toBe(true);
    });

    it('should accept minimum length username', () => {
      const result = usernameSchema.safeParse('abc');
      expect(result.success).toBe(true);
    });

    it('should accept maximum length username', () => {
      const result = usernameSchema.safeParse('a'.repeat(20));
      expect(result.success).toBe(true);
    });

    it('should convert to lowercase', () => {
      const result = usernameSchema.safeParse('JohnDoe');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('johndoe');
      }
    });

    it('should trim whitespace', () => {
      const result = usernameSchema.safeParse('  johndoe  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('johndoe');
      }
    });
  });

  describe('invalid usernames', () => {
    it('should reject username with spaces', () => {
      const result = usernameSchema.safeParse('john doe');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('username.invalid_format');
      }
    });

    it('should reject username with special characters', () => {
      const result = usernameSchema.safeParse('john@doe');
      expect(result.success).toBe(false);
    });

    it('should reject too short username', () => {
      const result = usernameSchema.safeParse('ab');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('username.too_short');
      }
    });

    it('should reject too long username', () => {
      const result = usernameSchema.safeParse('a'.repeat(21));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('username.too_long');
      }
    });

    it('should reject empty string', () => {
      const result = usernameSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject username starting with number', () => {
      const result = usernameSchema.safeParse('123user');
      expect(result.success).toBe(false);
    });
  });
});

describe('usernameRule', () => {
  describe('required', () => {
    it('should reject undefined', () => {
      const result = usernameRule.required.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it('should accept valid username', () => {
      const result = usernameRule.required.safeParse('johndoe');
      expect(result.success).toBe(true);
    });
  });

  describe('optional', () => {
    it('should accept undefined', () => {
      const result = usernameRule.optional.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it('should accept valid username', () => {
      const result = usernameRule.optional.safeParse('johndoe');
      expect(result.success).toBe(true);
    });

    it('should reject invalid username', () => {
      const result = usernameRule.optional.safeParse('invalid username');
      expect(result.success).toBe(false);
    });
  });
});
