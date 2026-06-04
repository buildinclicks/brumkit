import { authMiddleware } from '@repo/auth/edge';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

const innerMiddleware = authMiddleware({
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

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin pages are not implemented in this OSS release.
  // Redirect all /admin/* requests to /unauthorized to avoid silent 404s.
  if (pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return innerMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
