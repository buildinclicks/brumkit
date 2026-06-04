import { describe, it, expect } from 'vitest';

import {
  createUserSchema,
  updateUserProfileSchema,
  updateUserSchema,
  deleteUserSchema,
} from '../../src/schemas/user.schema';

describe('User Validation Schemas', () => {
  describe('createUserSchema', () => {
    it('should accept valid user data with required email', () => {
      const result = createUserSchema.safeParse({
        email: 'user@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should accept full user data', () => {
      const result = createUserSchema.safeParse({
        name: 'Alice',
        email: 'alice@example.com',
        username: 'alice_dev',
        password: 'Password123!',
        bio: 'Developer',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = createUserSchema.safeParse({ email: 'not-email' });
      expect(result.success).toBe(false);
    });

    it('should reject missing email', () => {
      const result = createUserSchema.safeParse({ name: 'Test' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid image URL', () => {
      const result = createUserSchema.safeParse({
        email: 'user@example.com',
        image: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid image URL', () => {
      const result = createUserSchema.safeParse({
        email: 'user@example.com',
        image: 'https://example.com/avatar.png',
      });
      expect(result.success).toBe(true);
    });

    it('should reject bio longer than 500 characters', () => {
      const result = createUserSchema.safeParse({
        email: 'user@example.com',
        bio: 'x'.repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateUserProfileSchema', () => {
    it('should accept empty object (all fields optional)', () => {
      const result = updateUserProfileSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept valid profile update', () => {
      const result = updateUserProfileSchema.safeParse({
        name: 'Updated Name',
        bio: 'New bio',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty name when provided', () => {
      const result = updateUserProfileSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
    });

    it('should accept empty image (clears the image)', () => {
      const result = updateUserProfileSchema.safeParse({ image: '' });
      expect(result.success).toBe(true);
    });

    it('should accept valid image URL', () => {
      const result = updateUserProfileSchema.safeParse({
        image: 'https://cdn.example.com/photo.jpg',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid image URL when provided', () => {
      const result = updateUserProfileSchema.safeParse({
        image: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateUserSchema (admin)', () => {
    it('should accept email updates for admins', () => {
      const result = updateUserSchema.safeParse({
        email: 'newemail@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = updateUserSchema.safeParse({ email: 'bad-email' });
      expect(result.success).toBe(false);
    });
  });

  describe('deleteUserSchema', () => {
    it('should accept a valid CUID', () => {
      const result = deleteUserSchema.safeParse({
        id: 'clh1234567890abcdefghij',
      });
      expect(result.success).toBe(true);
    });

    it('should reject an invalid ID format', () => {
      const result = deleteUserSchema.safeParse({ id: 'invalid-id-format' });
      expect(result.success).toBe(false);
    });

    it('should reject missing ID', () => {
      const result = deleteUserSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
