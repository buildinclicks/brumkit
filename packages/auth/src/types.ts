import type { UserRole } from '@repo/database';
import type { DefaultSession } from 'next-auth';
import 'next-auth/jwt';

/**
 * Extend Next Auth types with custom properties
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      username: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    role: UserRole;
    username: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    username: string | null;
  }
}
