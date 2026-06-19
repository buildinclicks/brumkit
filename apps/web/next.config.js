import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Required for Docker production image ───────────────────────────────
  // Produces a self-contained server in .next/standalone with all necessary
  // node_modules inlined — gives the smallest possible runtime image.
  output: 'standalone',

  transpilePackages: [
    '@repo/ui',
    '@repo/auth',
    '@repo/validation',
    '@repo/email',
  ],
  experimental: {
    optimizePackageImports: ['@repo/ui'],
  },

  // ─── Pass NEXT_PUBLIC_* vars into the client bundle at build time ───────
  // When building inside Docker, supply these as --build-arg in docker-compose
  // or as ARG/ENV in the Dockerfile if you need them baked in.
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? '',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? '',
  },

  // ─── Security headers ────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Block MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Prevent XSS via Referrer-Policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable browser features not used by the app
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // HSTS — only active in production; HTTPS required
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },
    ];
  },

  eslint: {
    // Only run ESLint on specific directories during build
    dirs: ['app', 'components', 'lib'],
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default withNextIntl(nextConfig);
