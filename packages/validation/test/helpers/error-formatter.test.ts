import { describe, it, expect } from 'vitest';
import { z } from 'zod';

import {
  formatZodError,
  getFieldError,
  getFieldErrors,
  zodErrorToObject,
  hasFieldError,
} from '../../src/helpers/error-formatter';

function getZodError(schema: z.ZodSchema, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) return result.error;
  throw new Error('Expected validation to fail');
}

describe('error-formatter helpers', () => {
  const schema = z.object({
    email: z.string().email('Invalid email'),
    name: z.string().min(1, 'Name required'),
  });

  describe('formatZodError', () => {
    it('should return array of formatted errors', () => {
      const error = getZodError(schema, { email: 'bad', name: '' });
      const formatted = formatZodError(error);

      expect(Array.isArray(formatted)).toBe(true);
      expect(formatted.length).toBeGreaterThan(0);
      expect(formatted[0]).toHaveProperty('field');
      expect(formatted[0]).toHaveProperty('message');
      expect(formatted[0]).toHaveProperty('code');
    });

    it('should use dot notation for nested fields', () => {
      const nestedSchema = z.object({
        address: z.object({
          city: z.string().min(1, 'City required'),
        }),
      });
      const error = getZodError(nestedSchema, { address: { city: '' } });
      const formatted = formatZodError(error);

      expect(formatted[0]!.field).toBe('address.city');
    });
  });

  describe('getFieldError', () => {
    it('should return error message for the given field', () => {
      const error = getZodError(schema, { email: 'bad', name: '' });
      const message = getFieldError(error, 'email');
      expect(typeof message).toBe('string');
      expect(message!.length).toBeGreaterThan(0);
    });

    it('should return undefined for a field without error', () => {
      const partialSchema = z.object({
        email: z.string().email('Invalid email'),
        name: z.string().min(1, 'Name required'),
      });
      const error = getZodError(partialSchema, {
        email: 'bad-email',
        name: 'Alice',
      });
      expect(getFieldError(error, 'name')).toBeUndefined();
    });
  });

  describe('getFieldErrors', () => {
    it('should return array of error messages for a field', () => {
      const error = getZodError(schema, { email: 'bad', name: '' });
      const messages = getFieldErrors(error, 'email');
      expect(Array.isArray(messages)).toBe(true);
    });

    it('should return empty array for a field with no errors', () => {
      const error = getZodError(schema, { email: 'bad', name: '' });
      const messages = getFieldErrors(error, 'nonexistent');
      expect(messages).toEqual([]);
    });
  });

  describe('zodErrorToObject', () => {
    it('should convert zod errors to an object keyed by field name', () => {
      const error = getZodError(schema, { email: 'bad', name: '' });
      const obj = zodErrorToObject(error);

      expect(typeof obj).toBe('object');
      expect(obj).toHaveProperty('email');
      expect(obj).toHaveProperty('name');
    });

    it('should only store the first error per field', () => {
      const multiErrorSchema = z.object({
        value: z.string().min(5, 'too short').max(3, 'too long'),
      });
      const error = getZodError(multiErrorSchema, { value: 'abcd' });
      const obj = zodErrorToObject(error);

      expect(typeof obj['value']).toBe('string');
    });
  });

  describe('hasFieldError', () => {
    it('should return true when field has an error', () => {
      const error = getZodError(schema, { email: 'bad', name: '' });
      expect(hasFieldError(error, 'email')).toBe(true);
    });

    it('should return false when field has no error', () => {
      const error = getZodError(schema, { email: 'bad', name: '' });
      expect(hasFieldError(error, 'phone')).toBe(false);
    });
  });
});
