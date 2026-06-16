import type { UserRole } from '@repo/database';
import type { NextAuthConfig } from 'next-auth';

/**
 * Base Auth.js configuration
 * This config is used both on Edge and Node.js runtimes
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');

      if (isOnDashboard || isOnAdmin) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id ?? '';
        token.role = (user.role as UserRole) ?? 'USER';
        token.username = user.username ?? null;
      }

      // Update session
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = (token.id as string) ?? '';
        session.user.role = (token.role as UserRole) ?? 'USER';
        session.user.username = (token.username as string | null) ?? null;
      }

      return session;
    },
  },
  providers: [], // Providers are added in auth.ts
};
