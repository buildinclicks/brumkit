import { describe, it, expect } from 'vitest';

import { deleteAccountSchema } from '../../src/schemas/account-deletion.schema';

describe('Account Deletion Schema', () => {
  describe('deleteAccountSchema', () => {
    it('should accept a valid password', () => {
      const result = deleteAccountSchema.safeParse({
        password: 'MyPassword123!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty password', () => {
      const result = deleteAccountSchema.safeParse({ password: '' });
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const result = deleteAccountSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should provide field errors on failure', () => {
      const result = deleteAccountSchema.safeParse({ password: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });
});
