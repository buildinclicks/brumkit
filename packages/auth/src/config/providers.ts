import { prisma } from '@repo/database';
import { loginSchema } from '@repo/validation';
import Credentials from 'next-auth/providers/credentials';

import { verifyPassword } from '../utils/password';

import type { NextAuthConfig } from 'next-auth';

/**
 * Auth.js Providers Configuration
 */
export const providers: NextAuthConfig['providers'] = [
  /**
   * Credentials Provider (Email/Password)
   * Used for email/password authentication
   */
  Credentials({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      try {
        // Validate credentials
        const { email, password } = loginSchema.parse(credentials);

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        // Reject soft-deleted accounts — they cannot sign in regardless of password
        if (user.isDeleted || user.deletedAt) {
          return null;
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
          return null;
        }

        // Return user object
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          username: user.username,
        };
      } catch (error) {
        console.error('Authorization error:', error);
        return null;
      }
    },
  }),
];
