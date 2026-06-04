import { defineConfig, mergeConfig } from 'vitest/config';
import reactConfig from '@repo/config-vitest/react';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default mergeConfig(
  reactConfig,
  defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './'),
      },
    },
    test: {
      include: ['**/*.test.{ts,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/.next/**',
        '**/e2e/**', // E2E tests use Playwright
        // DB integration tests — require a live PostgreSQL instance; run via pnpm test:integration
        'app/actions/account-deletion.test.ts',
        'app/actions/email-change.test.ts',
        'app/actions/notification.test.ts',
        'app/actions/auth.test.ts',
      ],
      setupFiles: ['./vitest.setup.ts'],
      // Disable file-level parallelism for database integration tests
      // This ensures tests that use the same test database don't interfere
      fileParallelism: false,
      coverage: {
        include: [
          'lib/**/*.{ts,tsx}',
          'components/**/*.{ts,tsx}',
          'app/actions/**/*.{ts,tsx}',
          'app/api/**/*.{ts,tsx}',
        ],
        exclude: [
          '**/*.d.ts',
          '**/*.config.{js,ts}',
          '**/types/**',
          'app/(auth)/**',
          'app/(dashboard)/**',
          'app/(public)/**',
          // Test infrastructure — not production code
          'lib/test/**',
          // Framework setup / client config — tested via integration
          'lib/api-client.ts',
          'lib/query-client.ts',
          'lib/query-provider.tsx',
          // Presentation-only skeleton wrappers — no logic to test
          'components/skeletons/**',
          // Server actions that require a live database (integration-tested separately)
          'app/actions/account-deletion.ts',
          'app/actions/auth.ts',
          'app/actions/email-change.ts',
          'app/actions/notification.ts',
          'app/actions/user.ts',
          // Auth.js catch-all — framework glue, no testable logic
          'app/api/auth/**',
          // Framework wrappers — no logic to unit-test
          'components/theme-provider.tsx',
        ],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
    },
  })
);
