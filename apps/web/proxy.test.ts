/**
 * @vitest-environment node
 *
 * Unit tests for apps/web/proxy.ts
 *
 * Strategy: mock @repo/auth/edge so that authProxy returns a
 * controllable innerProxy. This lets us test the outer wrapper's
 * admin-redirect logic in isolation and verify delegation for all other paths.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

// Hoist the inner-proxy mock so it is defined before vi.mock() factory runs.
const mockInnerProxy = vi.hoisted(() => vi.fn());

vi.mock('@repo/auth/edge', () => ({
  authProxy: vi.fn(() => mockInnerProxy),
}));

// Import AFTER mocking so the module captures the mocked authProxy.
const { default: proxy } = await import('./proxy');

function buildRequest(pathname: string): NextRequest {
  const url = `http://localhost:4000${pathname}`;
  return {
    nextUrl: new URL(url),
    url,
  } as unknown as NextRequest;
}

describe('proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInnerProxy.mockResolvedValue(NextResponse.next());
  });

  describe('Anonymous-route protection', () => {
    it('should redirect authenticated users on anonymous routes to /dashboard', async () => {
      const dashboardRedirect = NextResponse.redirect(
        new URL('/dashboard', 'http://localhost:4000')
      );
      mockInnerProxy.mockResolvedValue(dashboardRedirect);

      const req = buildRequest('/login');
      const res = await proxy(req);

      expect(mockInnerProxy).toHaveBeenCalledWith(req);
      expect(res.headers.get('location')).toContain('/dashboard');
    });
  });

  describe('Public-route access', () => {
    it('should allow unauthenticated users to access public routes', async () => {
      const nextRes = NextResponse.next();
      mockInnerProxy.mockResolvedValue(nextRes);

      const req = buildRequest('/');
      const res = await proxy(req);

      expect(mockInnerProxy).toHaveBeenCalledWith(req);
      expect(res.status).toBe(200);
    });
  });

  describe('Protected-route protection', () => {
    it('should redirect unauthenticated users on protected routes to /login with callbackUrl', async () => {
      const loginRedirect = NextResponse.redirect(
        new URL('/login?callbackUrl=%2Fdashboard', 'http://localhost:4000')
      );
      mockInnerProxy.mockResolvedValue(loginRedirect);

      const req = buildRequest('/dashboard');
      const res = await proxy(req);

      expect(mockInnerProxy).toHaveBeenCalledWith(req);
      const location = res.headers.get('location') ?? '';
      expect(location).toContain('/login');
      expect(location).toContain('callbackUrl');
    });
  });

  describe('Admin-route handling', () => {
    it('should redirect non-admin users on /admin/* to /unauthorized', async () => {
      const req = buildRequest('/admin/users');
      const res = await proxy(req);

      // The outer proxy handles /admin/* directly — innerProxy is never called.
      expect(mockInnerProxy).not.toHaveBeenCalled();
      expect(res.headers.get('location')).toContain('/unauthorized');
    });

    it('should redirect ADMIN role users on /admin/* to /unauthorized (admin not implemented in OSS release)', async () => {
      const req = buildRequest('/admin/dashboard');
      const res = await proxy(req);

      // Admin pages are not implemented in this OSS release; all /admin/* routes
      // are unconditionally redirected to /unauthorized to prevent silent 404s.
      expect(mockInnerProxy).not.toHaveBeenCalled();
      expect(res.headers.get('location')).toContain('/unauthorized');
    });

    it('should redirect SUPER_ADMIN role users on /admin/* to /unauthorized (admin not implemented in OSS release)', async () => {
      const req = buildRequest('/admin/settings');
      const res = await proxy(req);

      expect(mockInnerProxy).not.toHaveBeenCalled();
      expect(res.headers.get('location')).toContain('/unauthorized');
    });
  });

  describe('Static-file pass-through', () => {
    it('should allow access to static files (_next/static, _next/image, favicon.ico)', async () => {
      // The Next.js matcher excludes static files so proxy is never invoked
      // for them in production. If the function IS called with a static path,
      // it should not apply admin-redirect logic and should delegate to innerProxy.
      const staticPaths = [
        '/_next/static/chunks/main.js',
        '/_next/image?url=foo',
        '/favicon.ico',
      ];

      for (const pathname of staticPaths) {
        vi.clearAllMocks();
        mockInnerProxy.mockResolvedValue(NextResponse.next());

        const req = buildRequest(pathname);
        const res = await proxy(req);

        // Should delegate to innerProxy (not the admin redirect)
        expect(mockInnerProxy).toHaveBeenCalledWith(req);
        expect(res.status).toBe(200);
      }
    });
  });
});
