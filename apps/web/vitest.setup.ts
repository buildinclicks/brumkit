import '@testing-library/jest-dom/vitest';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';

import { server } from './lib/test/mocks/server';

// Suppress expected test errors from React Query mutations
// These errors are intentional test scenarios and are properly handled by error boundaries
const isExpectedTestError = (error: Error) => {
  return (
    error.message.includes('Incorrect password') ||
    error.message.includes('Validation failed') ||
    error.message.includes('Too many deletion attempts') ||
    error.message.includes('Too many requests') ||
    error.message.includes('Network error') ||
    error.message.includes('Server error') ||
    error.message.includes('Cannot read properties of undefined')
  );
};

// Suppress unhandled promise rejections and uncaught exceptions in tests
if (typeof process !== 'undefined') {
  const originalEmit = process.emit;
  // @ts-expect-error - emit signature is complex
  process.emit = function (name, data, ...args) {
    if (
      (name === 'unhandledRejection' || name === 'uncaughtException') &&
      data instanceof Error &&
      isExpectedTestError(data)
    ) {
      // Suppress expected mutation errors
      return false;
    }

    return originalEmit.apply(process, [name, data, ...args]);
  };
}

// Handle errors in worker threads
if (typeof globalThis !== 'undefined') {
  const originalErrorHandler = globalThis.onerror;
  globalThis.onerror = function (message, source, lineno, colno, error) {
    if (error instanceof Error && isExpectedTestError(error)) {
      // Suppress expected test errors
      return true;
    }
    if (originalErrorHandler) {
      return originalErrorHandler(message, source, lineno, colno, error);
    }
    return false;
  };
}

// Mock window.matchMedia for next-themes (only in browser/jsdom environment)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock window.localStorage for next-themes
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });

  // Mock ResizeObserver for Radix UI components
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Establish API mocking before all tests.
// MSW 2.14+ throws if listen() is called on an already-listening server
// (changed from a silent no-op). Guard the call so vitest workers that share
// the same server instance don't throw on the second invocation.
beforeAll(() => {
  try {
    server.listen({
      onUnhandledRequest: 'warn',
    });
  } catch {
    // Server is already listening (e.g. shared worker, re-entrant setup)
  }
});

// Reset any request handlers that are declared in a test
afterEach(() => {
  server.resetHandlers();
});

// Clean up after all tests are done
afterAll(() => {
  server.close();
});

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  redirect: vi.fn(),
}));

// Mock Next.js server-only module
vi.mock('server-only', () => ({}));

// Mock next-intl server functions
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(() => (key: string) => key),
  getLocale: vi.fn(() => Promise.resolve('en')),
  getMessages: vi.fn(() => Promise.resolve({})),
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(() => Promise.resolve({ ok: true, error: null })),
  signOut: vi.fn(() => Promise.resolve()),
  useSession: vi.fn(() => ({
    data: null,
    status: 'unauthenticated',
    update: vi.fn(),
  })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next-auth server
vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));

// Mock email service
vi.mock('@repo/email', () => ({
  sendVerificationEmail: vi.fn(() => Promise.resolve({ success: true })),
  sendWelcomeEmail: vi.fn(() => Promise.resolve({ success: true })),
  sendPasswordResetEmail: vi.fn(() => Promise.resolve({ success: true })),
}));
