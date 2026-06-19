import { healthCheck } from '@repo/database';
import { NextResponse } from 'next/server';

/**
 * Health check endpoint.
 *
 * Used by Docker Compose healthchecks, load balancers, and monitoring tools.
 * Returns 200 when the app and DB are reachable; 503 otherwise.
 */
export async function GET() {
  try {
    const dbOk = await healthCheck();

    if (!dbOk) {
      return NextResponse.json({ status: 'error', db: false }, { status: 503 });
    }

    return NextResponse.json(
      { status: 'ok', db: true },
      {
        status: 200,
        headers: {
          // Prevent CDNs from caching the health response
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch {
    return NextResponse.json({ status: 'error', db: false }, { status: 503 });
  }
}
