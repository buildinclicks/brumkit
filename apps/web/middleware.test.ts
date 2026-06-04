/**
 * @vitest-environment node
 *
 * Unit tests for apps/web/middleware.ts
 *
 * Strategy: mock @repo/auth/edge so that authMiddleware returns a
 * controllable innerMiddleware. This lets us test the outer wrapper's
 * admin-redirect logic in isolation and verify delegation for all other paths.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

// Hoist the inner-middleware mock so it is defined before vi.mock() factory runs.
const mockInnerMiddleware = vi.hoisted(() => vi.fn());

vi.mock('@repo/auth/edge', () => ({
  authMiddleware: vi.fn(() => mockInnerMiddleware),
}));

// Import AFTER mocking so the module captures the mocked authMiddleware.
const { default: middleware } = await import('./middleware');

function buildRequest(pathname: string): NextRequest {
  const url = `http://localhost:3000${pathname}`;
  return {
    nextUrl: new URL(url),
    url,
  } as unknown as NextRequest;
}

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInnerMiddleware.mockResolvedValue(NextResponse.next());
  });

  describe('Anonymous-route protection', () => {
    it('should redirect authenticated users on anonymous routes to /dashboard', async () => {
      const dashboardRedirect = NextResponse.redirect(
        new URL('/dashboard', 'http://localhost:3000')
      );
      mockInnerMiddleware.mockResolvedValue(dashboardRedirect);

      const req = buildRequest('/login');
      const res = await middleware(req);

      expect(mockInnerMiddleware).toHaveBeenCalledWith(req);
      expect(res.headers.get('location')).toContain('/dashboard');
    });
  });

  describe('Public-route access', () => {
    it('should allow unauthenticated users to access public routes', async () => {
      const nextRes = NextResponse.next();
      mockInnerMiddleware.mockResolvedValue(nextRes);

      const req = buildRequest('/');
      const res = await middleware(req);

      expect(mockInnerMiddleware).toHaveBeenCalledWith(req);
      expect(res.status).toBe(200);
    });
  });

  describe('Protected-route protection', () => {
    it('should redirect unauthenticated users on protected routes to /login with callbackUrl', async () => {
      const loginRedirect = NextResponse.redirect(
        new URL('/login?callbackUrl=%2Fdashboard', 'http://localhost:3000')
      );
      mockInnerMiddleware.mockResolvedValue(loginRedirect);

      const req = buildRequest('/dashboard');
      const res = await middleware(req);

      expect(mockInnerMiddleware).toHaveBeenCalledWith(req);
      const location = res.headers.get('location') ?? '';
      expect(location).toContain('/login');
      expect(location).toContain('callbackUrl');
    });
  });

  describe('Admin-route handling', () => {
    it('should redirect non-admin users on /admin/* to /unauthorized', async () => {
      const req = buildRequest('/admin/users');
      const res = await middleware(req);

      // The outer middleware handles /admin/* directly — innerMiddleware is never called.
      expect(mockInnerMiddleware).not.toHaveBeenCalled();
      expect(res.headers.get('location')).toContain('/unauthorized');
    });

    it('should redirect ADMIN role users on /admin/* to /unauthorized (admin not implemented in OSS release)', async () => {
      const req = buildRequest('/admin/dashboard');
      const res = await middleware(req);

      // Admin pages are not implemented in this OSS release; all /admin/* routes
      // are unconditionally redirected to /unauthorized to prevent silent 404s.
      expect(mockInnerMiddleware).not.toHaveBeenCalled();
      expect(res.headers.get('location')).toContain('/unauthorized');
    });

    it('should redirect SUPER_ADMIN role users on /admin/* to /unauthorized (admin not implemented in OSS release)', async () => {
      const req = buildRequest('/admin/settings');
      const res = await middleware(req);

      expect(mockInnerMiddleware).not.toHaveBeenCalled();
      expect(res.headers.get('location')).toContain('/unauthorized');
    });
  });

  describe('Static-file pass-through', () => {
    it('should allow access to static files (_next/static, _next/image, favicon.ico)', async () => {
      // The Next.js matcher excludes static files so middleware is never invoked
      // for them in production. If the function IS called with a static path,
      // it should not apply admin-redirect logic and should delegate to innerMiddleware.
      const staticPaths = [
        '/_next/static/chunks/main.js',
        '/_next/image?url=foo',
        '/favicon.ico',
      ];

      for (const pathname of staticPaths) {
        vi.clearAllMocks();
        mockInnerMiddleware.mockResolvedValue(NextResponse.next());

        const req = buildRequest(pathname);
        const res = await middleware(req);

        // Should delegate to innerMiddleware (not the admin redirect)
        expect(mockInnerMiddleware).toHaveBeenCalledWith(req);
        expect(res.status).toBe(200);
      }
    });
  });
});
