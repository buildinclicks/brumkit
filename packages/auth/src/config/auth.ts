import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@repo/database';
import NextAuth from 'next-auth';

import { authConfig } from './auth.config';
import { providers } from './providers';

import type { UserRole } from '@repo/database';
import type { NextAuthConfig } from 'next-auth';

const isDev = process.env.NODE_ENV === 'development';

const config = {
  ...authConfig,
  // Type assertion needed due to minor version mismatch in @auth/core dependency
  // between next-auth and @auth/prisma-adapter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers,
  callbacks: {
    ...authConfig.callbacks,
    /**
     * Override the base session callback to add a lightweight deleted-user check.
     * Because we use JWT strategy, DB sessions cannot be revoked server-side; this
     * DB re-check on every auth() call ensures soft-deleted accounts are rejected
     * immediately on the next page load rather than at JWT expiry.
     */
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = (token.id as string) ?? '';
        session.user.role = (token.role as UserRole) ?? 'USER';
        session.user.username = (token.username as string | null) ?? null;
      }

      if (session.user?.id) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { isDeleted: true, role: true, username: true },
          });
          // Invalidate sessions for soft-deleted users
          if (!user || user.isDeleted) {
            return { expires: session.expires };
          }
          // Sync role/username in case they changed since token was issued
          if (user.role !== session.user.role) {
            session.user.role = user.role as UserRole;
          }
        } catch {
          // Fail-open: if DB is unavailable, allow existing session to continue
        }
      }

      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (isDev) console.log('✅ User created:', user.email);
    },
    async signIn({ user, isNewUser }) {
      if (isDev)
        console.log('✅ User signed in:', user.email, isNewUser ? '(new)' : '');
    },
    async signOut(params) {
      if (isDev) {
        const token = 'token' in params ? params.token : null;
        console.log('👋 User signed out:', token?.email);
      }
    },
  },
  debug: isDev,
} satisfies NextAuthConfig;

const nextAuth = NextAuth(config);

export const handlers = nextAuth.handlers;
export const auth = nextAuth.auth;
export const signIn: typeof nextAuth.signIn = nextAuth.signIn;
export const signOut: typeof nextAuth.signOut = nextAuth.signOut;
