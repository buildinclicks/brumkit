/**
 * Edge-safe exports for use in Next.js proxy.ts (formerly middleware.ts).
 *
 * Import path: @repo/auth/edge
 *
 * // In proxy.ts
 * import { authProxy } from '@repo/auth/edge';
 */
export { auth, signIn, signOut, handlers } from './config/auth.edge';
export {
  authProxy,
  defaultProxyMatcher,
  /** @deprecated Use authProxy */
  authMiddleware,
  /** @deprecated Use defaultProxyMatcher */
  defaultMatcher,
} from './proxy';
export type { AuthProxyConfig, AuthMiddlewareConfig } from './proxy';
