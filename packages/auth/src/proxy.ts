import { NextResponse } from 'next/server';

import { auth } from './config/auth.edge';

import type { NextRequest } from 'next/server';

export interface AuthProxyConfig {
  /**
   * Public routes that don't require authentication
   * @example ['/about', '/']
   */
  publicRoutes?: string[];

  /**
   * Routes for guest users only (e.g., login, register)
   * Logged-in users will be redirected to the dashboard.
   * @example ['/login', '/register']
   */
  anonymousRoutes?: string[];

  /**
   * Routes that require authentication
   * @example ['/dashboard', '/profile']
   */
  protectedRoutes?: string[];

  /**
   * Routes that require admin role
   * @example ['/admin']
   */
  adminRoutes?: string[];

  /**
   * Routes that require moderator role or higher
   * @example ['/moderate']
   */
  moderatorRoutes?: string[];

  /**
   * Redirect path for unauthenticated users
   * @default '/login'
   */
  loginPath?: string;

  /**
   * Redirect path for unauthorized users (insufficient permissions)
   * @default '/unauthorized'
   */
  unauthorizedPath?: string;

  /**
   * Callback URL parameter name
   * @default 'callbackUrl'
   */
  callbackUrlParam?: string;
}

/** @deprecated Use AuthProxyConfig instead */
export type AuthMiddlewareConfig = AuthProxyConfig;

const defaultConfig: Required<AuthProxyConfig> = {
  publicRoutes: ['/'],
  anonymousRoutes: ['/login', '/register'],
  protectedRoutes: ['/dashboard/*'],
  adminRoutes: ['/admin/*'],
  moderatorRoutes: ['/moderate/*'],
  loginPath: '/login',
  unauthorizedPath: '/unauthorized',
  callbackUrlParam: 'callbackUrl',
};

/**
 * Check if a path matches a route pattern
 */
function matchesRoute(path: string, route: string): boolean {
  if (path === route) return true;

  if (route.endsWith('/*')) {
    const base = route.slice(0, -2);
    return path.startsWith(base);
  }

  if (path.startsWith(route + '/')) return true;

  return false;
}

/**
 * Check if a path is in a list of routes
 */
function isInRoutes(path: string, routes: string[]): boolean {
  return routes.some((route) => matchesRoute(path, route));
}

/**
 * Create an Auth.js proxy handler for Next.js 16+.
 *
 * Use in proxy.ts (Next.js 16) for lightweight, optimistic redirects.
 * Primary auth enforcement belongs in Server Components, layouts, and server actions.
 *
 * @example
 * ```ts
 * // proxy.ts
 * import { authProxy } from '@repo/auth/edge';
 *
 * const innerProxy = authProxy({ ... });
 *
 * export default function proxy(request: Request) {
 *   return innerProxy(request);
 * }
 *
 * export const config = {
 *   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
 * };
 * ```
 */
export function authProxy(config: AuthProxyConfig = {}) {
  const cfg = { ...defaultConfig, ...config };

  return async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    const session = await auth();
    const isAuthenticated = !!session?.user;

    if (isAuthenticated && isInRoutes(path, cfg.anonymousRoutes)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (
      isInRoutes(path, cfg.publicRoutes) ||
      isInRoutes(path, cfg.anonymousRoutes)
    ) {
      return NextResponse.next();
    }

    if (
      isInRoutes(path, cfg.protectedRoutes) ||
      isInRoutes(path, cfg.adminRoutes) ||
      isInRoutes(path, cfg.moderatorRoutes)
    ) {
      if (!isAuthenticated) {
        const loginUrl = new URL(cfg.loginPath, request.url);
        loginUrl.searchParams.set(cfg.callbackUrlParam, path);
        return NextResponse.redirect(loginUrl);
      }

      if (isInRoutes(path, cfg.adminRoutes)) {
        const role = session.user.role;
        if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
          return NextResponse.redirect(
            new URL(cfg.unauthorizedPath, request.url)
          );
        }
      }

      if (isInRoutes(path, cfg.moderatorRoutes)) {
        const role = session.user.role;
        if (
          role !== 'MODERATOR' &&
          role !== 'ADMIN' &&
          role !== 'SUPER_ADMIN'
        ) {
          return NextResponse.redirect(
            new URL(cfg.unauthorizedPath, request.url)
          );
        }
      }
    }

    return NextResponse.next();
  };
}

/**
 * @deprecated Use authProxy instead (Next.js 16 renamed middleware to proxy)
 */
export const authMiddleware = authProxy;

/**
 * Recommended matcher for proxy.ts — excludes all API routes, static assets,
 * images, and favicon so the proxy only runs on page navigations.
 *
 * Add to your proxy.ts:
 * ```ts
 * export const config = defaultProxyMatcher;
 * ```
 */
export const defaultProxyMatcher = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

/** @deprecated Use defaultProxyMatcher instead */
export const defaultMatcher = defaultProxyMatcher;
