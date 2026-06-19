import { authProxy } from '@repo/auth/edge';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

const innerProxy = authProxy({
  publicRoutes: [
    '/',
    '/verify-email',
    '/verify-email-change',
    '/reset-password',
  ],
  anonymousRoutes: ['/login', '/register', '/forgot-password', '/login-demo'],
  protectedRoutes: [
    '/dashboard/*',
    '/profile/*',
    '/notifications/*',
    '/logout',
  ],
});

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin pages are not implemented in this OSS release.
  // Redirect all /admin/* requests to /unauthorized to avoid silent 404s.
  if (pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return innerProxy(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - api/*           (all API routes handle their own auth)
     * - _next/static    (static assets)
     * - _next/image     (image optimisation)
     * - favicon.ico     (browser favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
