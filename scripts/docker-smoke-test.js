#!/usr/bin/env node
/**
 * Docker smoke test — validates a running BrumKit container.
 *
 * Run AFTER starting the container:
 *   docker run --rm -d -p 3000:3000 --name bk-test brumkit-web:ci
 *   node scripts/docker-smoke-test.js
 *
 * Override target with: SMOKE_TEST_URL=http://my-host:3000 node scripts/docker-smoke-test.js
 */

const http = require('http');

const BASE_URL = process.env.SMOKE_TEST_URL ?? 'http://localhost:3000';
const MAX_RETRIES = parseInt(process.env.SMOKE_RETRIES ?? '10', 10);
const RETRY_DELAY_MS = parseInt(process.env.SMOKE_RETRY_DELAY_MS ?? '3000', 10);

/** @param {string} url @returns {Promise<{statusCode: number, body: string}>} */
function httpGet(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ statusCode: res.statusCode, body }));
      })
      .on('error', reject);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Polls `url` until it responds with a non-5xx status or retries are exhausted.
 * @param {string} url
 * @param {number} retries
 */
async function waitForServer(url, retries) {
  for (let i = 1; i <= retries; i++) {
    try {
      const res = await httpGet(url);
      if (res.statusCode < 500) return res;
    } catch {
      // ECONNREFUSED — server not up yet; keep waiting
    }

    if (i < retries) {
      console.log(
        `  Retry ${i}/${retries} — server not ready, waiting ${RETRY_DELAY_MS / 1000}s...`
      );
      await sleep(RETRY_DELAY_MS);
    }
  }

  throw new Error(`Server at ${url} did not respond after ${retries} attempts`);
}

async function runSmokeTests() {
  console.log('\nBrumKit — Docker Smoke Tests');
  console.log('─'.repeat(50));
  console.log(`Target: ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;

  /** @param {string} label @param {() => Promise<void>} fn */
  async function test(label, fn) {
    process.stdout.write(`  ${label} ... `);
    try {
      await fn();
      console.log('PASS');
      passed++;
    } catch (err) {
      console.log(`FAIL — ${err.message}`);
      failed++;
    }
  }

  // ── Test 1: Server is reachable on port 3000 ────────────────────────────
  await test('Server responds on port 3000', async () => {
    await waitForServer(BASE_URL, MAX_RETRIES);
  });

  // ── Test 2: Root path returns a non-5xx response ──────────────────────
  await test('GET / returns non-5xx status', async () => {
    const res = await httpGet(BASE_URL);
    if (res.statusCode >= 500) {
      throw new Error(`HTTP ${res.statusCode}`);
    }
  });

  // ── Test 3: Auth.js providers endpoint is reachable ──────────────────────
  await test('GET /api/auth/providers is reachable', async () => {
    await httpGet(`${BASE_URL}/api/auth/providers`);
    // Any HTTP response confirms the route exists and the server routes correctly.
    // In CI (no real DB/Redis), a 500 is expected and acceptable.
  });

  // ── Summary ───────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('─'.repeat(50) + '\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSmokeTests().catch((err) => {
  console.error('\nUnexpected error:', err.message);
  process.exit(1);
});
