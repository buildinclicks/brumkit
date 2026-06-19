/**
 * @deprecated This file is kept for backward compatibility only.
 * In Next.js 16, middleware.ts is renamed to proxy.ts.
 * Import from '@repo/auth/edge' and use authProxy / defaultProxyMatcher instead.
 */
export {
  authProxy,
  authMiddleware,
  defaultProxyMatcher,
  defaultMatcher,
} from './proxy';
export type { AuthProxyConfig, AuthMiddlewareConfig } from './proxy';
