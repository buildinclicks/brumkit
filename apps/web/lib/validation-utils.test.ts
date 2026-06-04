import { describe, it, expect } from 'vitest';
import { z } from 'zod';

import { mapZodErrorToKeys, formatFieldError } from './validation-utils';

describe('mapZodErrorToKeys', () => {
  it('should map zod errors to a field-name keyed object', () => {
    const schema = z.object({
      email: z.string().email('email.invalid'),
      name: z.string().min(1, 'common.required'),
    });

    const result = schema.safeParse({ email: 'not-an-email', name: '' });
    expect(result.success).toBe(false);

    if (!result.success) {
      const mapped = mapZodErrorToKeys(result.error);
      expect(mapped).toEqual({
        email: 'email.invalid',
        name: 'common.required',
      });
    }
  });

  it('should use dotted path for nested fields', () => {
    const schema = z.object({
      address: z.object({
        city: z.string().min(1, 'common.required'),
      }),
    });

    const result = schema.safeParse({ address: { city: '' } });
    expect(result.success).toBe(false);

    if (!result.success) {
      const mapped = mapZodErrorToKeys(result.error);
      expect(mapped['address.city']).toBe('common.required');
    }
  });

  it('should return empty object when no errors', () => {
    const schema = z.object({ name: z.string() });
    const result = schema.safeParse({ name: 'Alice' });
    expect(result.success).toBe(true);
  });
});

describe('formatFieldError', () => {
  it('should return the error message for the given field', () => {
    const errors = { email: 'email.invalid', name: 'common.required' };
    expect(formatFieldError('email', errors)).toBe('email.invalid');
  });

  it('should return undefined when field has no error', () => {
    const errors = { email: 'email.invalid' };
    expect(formatFieldError('name', errors)).toBeUndefined();
  });

  it('should return undefined for empty errors object', () => {
    expect(formatFieldError('email', {})).toBeUndefined();
  });
});
