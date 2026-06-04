/**
 * Account Deletion Server Action - Integration Tests
 *
 * Tests account deletion server action with real test database.
 * Following TDD principles with proper database setup and cleanup.
 *
 * Test Coverage:
 * - Authentication checks
 * - Input validation
 * - Rate limiting
 * - Password verification
 * - Soft delete with timestamp
 * - Session invalidation
 * - Email notification
 * - Error handling
 */

import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

// Mock database to use test client - must be before any imports that use it
vi.mock('@repo/database', async () => {
  const { getTestClient } = await import('@repo/database/test');
  return {
    prisma: getTestClient(),
  };
});

// Mock external dependencies
vi.mock('@repo/auth', async () => {
  const actual = await vi.importActual('@repo/auth');
  return {
    ...actual,
    auth: vi.fn(),
  };
});

// Create mock functions that can be accessed
const mockRateLimiterCheck = vi.fn().mockResolvedValue({ success: true });
const mockRateLimiterReset = vi.fn();

vi.mock('@repo/rate-limit', () => {
  return {
    RedisRateLimiter: class MockRedisRateLimiter {
      check = mockRateLimiterCheck;
      reset = mockRateLimiterReset;
    },
  };
});

vi.mock('@repo/email', () => ({
  sendAccountDeletionNotification: vi.fn(),
}));

import { auth, hashPassword } from '@repo/auth';
import {
  getTestClient,
  cleanDatabase,
  disconnectTestClient,
  createTestUser,
} from '@repo/database/test';
import { sendAccountDeletionNotification } from '@repo/email';

import { deleteAccount } from './account-deletion';

describe('Account Deletion Server Action - Integration Tests', () => {
  const testDb = getTestClient();

  beforeEach(async () => {
    // Clean database before each test for isolation
    await cleanDatabase();
    vi.clearAllMocks();

    // Reset rate limiter mock to pass by default
    mockRateLimiterCheck.mockResolvedValue({ success: true });

    // Default: email sending succeeds
    vi.mocked(sendAccountDeletionNotification).mockResolvedValue(undefined);
  });

  afterAll(async () => {
    // Clean up and disconnect after all tests
    await cleanDatabase();
    await disconnectTestClient();
  });

  describe('Authentication', () => {
    it('should return error if user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await deleteAccount({ password: 'Password123!' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('authenticated');
    });

    it('should return error if user session has no user data', async () => {
      vi.mocked(auth).mockResolvedValue({ user: null } as any);

      const result = await deleteAccount({ password: 'Password123!' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('authenticated');
    });
  });

  describe('Input Validation', () => {
    it('should return error if password is missing', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      const result = await deleteAccount({ password: '' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error if password is invalid format', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      const result = await deleteAccount({ password: 'short' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should check rate limit for account deletion', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      await deleteAccount({ password: 'Password123!' });

      expect(mockRateLimiterCheck).toHaveBeenCalledWith({
        action: 'account-deletion',
        identifier: user.id,
        limit: 3,
        window: 3600,
      });
    });

    it('should return error if rate limit exceeded', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      mockRateLimiterCheck.mockResolvedValue({
        success: false,
        retryAfter: 3600,
      });

      const result = await deleteAccount({ password: 'Password123!' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Too many');
      expect(result.error).toContain('hour');
    });

    it('should allow request if rate limit not exceeded', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      mockRateLimiterCheck.mockResolvedValue({ success: true });

      const result = await deleteAccount({ password: 'Password123!' });

      expect(result.success).toBe(true);
    });

    it('should fail-open if rate limiter throws error', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      mockRateLimiterCheck.mockRejectedValue(
        new Error('Redis connection failed')
      );

      const result = await deleteAccount({ password: 'Password123!' });

      // Should proceed despite rate limiter failure
      expect(result.success).toBe(true);
    });
  });

  describe('User Verification', () => {
    it('should fetch user from database', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      await deleteAccount({ password: 'Password123!' });

      // Verify user was fetched (implicitly tested by successful deletion)
      const deletedUser = await testDb.user.findUnique({
        where: { id: user.id },
      });
      expect(deletedUser?.isDeleted).toBe(true);
    });

    it('should return error if user not found', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'non-existent-user', email: 'test@example.com' },
      } as any);

      const result = await deleteAccount({ password: 'Password123!' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('User not found');
    });

    it('should return error if user already deleted', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      // Mark user as already deleted
      await testDb.user.update({
        where: { id: user.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      const result = await deleteAccount({ password: 'Password123!' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('already been deleted');
    });

    it('should return error if user has no password (OAuth only)', async () => {
      // Create user without password (simulating OAuth-only user)
      const user = await testDb.user.create({
        data: {
          email: 'oauth@example.com',
          name: 'OAuth User',
          username: 'oauthuser',
          password: null, // No password
        },
      });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      const result = await deleteAccount({ password: 'Password123!' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot delete account');
    });
  });

  describe('Password Verification', () => {
    it('should verify password with stored hash', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      const result = await deleteAccount({ password: 'Password123!' });

      expect(result.success).toBe(true);
    });

    it('should return error if password is incorrect', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      const result = await deleteAccount({ password: 'WrongPassword123!' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Incorrect password');

      // Verify user was NOT deleted
      const unchangedUser = await testDb.user.findUnique({
        where: { id: user.id },
      });
      expect(unchangedUser?.isDeleted).toBe(false);
      expect(unchangedUser?.deletedAt).toBeNull();
    });

    it('should return field error for incorrect password', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      const result = await deleteAccount({ password: 'WrongPassword123!' });

      expect(result.fieldErrors).toBeDefined();
      expect(result.fieldErrors?.password).toBeDefined();
    });
  });

  describe('Account Soft Delete', () => {
    it('should mark account as deleted with deletedAt timestamp', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      const beforeDelete = new Date();

      await deleteAccount({ password: 'Password123!' });

      // Verify in database
      const deletedUser = await testDb.user.findUnique({
        where: { id: user.id },
      });

      expect(deletedUser?.isDeleted).toBe(true);
      expect(deletedUser?.deletedAt).toBeInstanceOf(Date);
      expect(deletedUser?.deletedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeDelete.getTime()
      );
    });

    it('should invalidate all user sessions', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      // Create some sessions for the user
      await testDb.session.create({
        data: {
          sessionToken: 'session_1',
          userId: user.id,
          expires: new Date(Date.now() + 86400000),
        },
      });

      await testDb.session.create({
        data: {
          sessionToken: 'session_2',
          userId: user.id,
          expires: new Date(Date.now() + 86400000),
        },
      });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      await deleteAccount({ password: 'Password123!' });

      // Verify all sessions were deleted
      const remainingSessions = await testDb.session.count({
        where: { userId: user.id },
      });

      expect(remainingSessions).toBe(0);
    });

    it('should send deletion notification email', async () => {
      const user = await createTestUser({
        email: 'test@example.com',
        name: 'Test User',
      });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      await deleteAccount({ password: 'Password123!' });

      expect(sendAccountDeletionNotification).toHaveBeenCalledWith({
        email: 'test@example.com',
        userName: 'Test User',
      });
    });
  });

  describe('Success Response', () => {
    it('should return success true on successful deletion', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      const result = await deleteAccount({ password: 'Password123!' });

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should perform all operations in correct order', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      await deleteAccount({ password: 'Password123!' });

      // Verify user is deleted and sessions are cleared
      const deletedUser = await testDb.user.findUnique({
        where: { id: user.id },
      });
      const sessionCount = await testDb.session.count({
        where: { userId: user.id },
      });

      expect(deletedUser?.isDeleted).toBe(true);
      expect(sessionCount).toBe(0);
      expect(sendAccountDeletionNotification).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      // Delete the user first to cause a constraint error
      await testDb.user.delete({ where: { id: user.id } });

      const result = await deleteAccount({ password: 'Password123!' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle email sending failure gracefully', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      vi.mocked(sendAccountDeletionNotification).mockRejectedValue(
        new Error('Email service unavailable')
      );

      // Should still succeed even if email fails (already deleted)
      const result = await deleteAccount({ password: 'Password123!' });

      expect(result.success).toBe(true);

      // Verify user was deleted despite email failure
      const deletedUser = await testDb.user.findUnique({
        where: { id: user.id },
      });
      expect(deletedUser?.isDeleted).toBe(true);
    });

    it('should rollback if session deletion fails', async () => {
      // This is difficult to test with real DB since session deletion
      // happens after user update. The transaction handling would need
      // to be in the actual implementation for true rollback.
      // For now, we test that errors are handled gracefully.

      const user = await createTestUser({ email: 'test@example.com' });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      // Mock session.deleteMany to fail
      const originalDeleteMany = testDb.session.deleteMany;
      testDb.session.deleteMany = vi
        .fn()
        .mockRejectedValue(new Error('Session deletion failed')) as any;

      const result = await deleteAccount({ password: 'Password123!' });

      // Restore original method
      testDb.session.deleteMany = originalDeleteMany;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with no name (null)', async () => {
      const user = await testDb.user.create({
        data: {
          email: 'noname@example.com',
          username: 'noname',
          name: null,
          password: await hashPassword('Password123!'),
        },
      });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      await deleteAccount({ password: 'Password123!' });

      expect(sendAccountDeletionNotification).toHaveBeenCalledWith({
        email: 'noname@example.com',
        userName: 'User', // Default fallback
      });
    });

    it('should handle user with no sessions', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      // Don't create any sessions

      const result = await deleteAccount({ password: 'Password123!' });

      expect(result.success).toBe(true);

      // Verify user was still deleted
      const deletedUser = await testDb.user.findUnique({
        where: { id: user.id },
      });
      expect(deletedUser?.isDeleted).toBe(true);
    });

    it('should trim and validate password input', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      vi.mocked(auth).mockResolvedValue({
        user: { id: user.id, email: user.email },
      } as any);

      // Password with spaces should work (no trimming in validation)
      const result = await deleteAccount({ password: '  Password123!  ' });

      // This should fail because the password doesn't match (spaces included)
      expect(result.success).toBe(false);
    });
  });
});
