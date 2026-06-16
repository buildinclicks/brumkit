import { describe, it, expect } from 'vitest';
import { slugSchema, slugRule } from '../../src/rules/slug.rules.js';

describe('slugSchema', () => {
  describe('valid slugs', () => {
    it('should accept valid slug', () => {
      const result = slugSchema.safeParse('hello-world');
      expect(result.success).toBe(true);
    });

    it('should accept slug with numbers', () => {
      const result = slugSchema.safeParse('article-123');
      expect(result.success).toBe(true);
    });

    it('should accept slug with multiple hyphens', () => {
      const result = slugSchema.safeParse('this-is-a-slug');
      expect(result.success).toBe(true);
    });

    it('should accept minimum length slug', () => {
      const result = slugSchema.safeParse('abc');
      expect(result.success).toBe(true);
    });

    it('should accept maximum length slug', () => {
      const result = slugSchema.safeParse('a'.repeat(255));
      expect(result.success).toBe(true);
    });
  });

  describe('invalid slugs', () => {
    it('should reject slug with spaces', () => {
      const result = slugSchema.safeParse('hello world');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('slug.invalid_format');
      }
    });

    it('should reject slug with uppercase letters', () => {
      const result = slugSchema.safeParse('Hello-World');
      expect(result.success).toBe(false);
    });

    it('should reject slug with special characters', () => {
      const result = slugSchema.safeParse('hello@world');
      expect(result.success).toBe(false);
    });

    it('should reject slug with underscores', () => {
      const result = slugSchema.safeParse('hello_world');
      expect(result.success).toBe(false);
    });

    it('should reject slug starting with hyphen', () => {
      const result = slugSchema.safeParse('-hello');
      expect(result.success).toBe(false);
    });

    it('should reject slug ending with hyphen', () => {
      const result = slugSchema.safeParse('hello-');
      expect(result.success).toBe(false);
    });

    it('should reject slug with consecutive hyphens', () => {
      const result = slugSchema.safeParse('hello--world');
      expect(result.success).toBe(false);
    });

    it('should reject too short slug', () => {
      const result = slugSchema.safeParse('ab');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('slug.too_short');
      }
    });

    it('should reject too long slug', () => {
      const result = slugSchema.safeParse('a'.repeat(256));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('slug.too_long');
      }
    });

    it('should reject empty string', () => {
      const result = slugSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });
});

describe('slugRule', () => {
  describe('required', () => {
    it('should reject undefined', () => {
      const result = slugRule.required.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it('should accept valid slug', () => {
      const result = slugRule.required.safeParse('hello-world');
      expect(result.success).toBe(true);
    });
  });

  describe('optional', () => {
    it('should accept undefined', () => {
      const result = slugRule.optional.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it('should accept valid slug', () => {
      const result = slugRule.optional.safeParse('hello-world');
      expect(result.success).toBe(true);
    });

    it('should reject invalid slug', () => {
      const result = slugRule.optional.safeParse('Invalid Slug');
      expect(result.success).toBe(false);
    });
  });
});
