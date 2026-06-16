#!/usr/bin/env tsx
/**
 * Setup Test Database
 *
 * Creates and migrates the test database.
 * Run this before running database tests.
 */

import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageDir = join(__dirname, '..');

const TEST_DB_NAME = process.env.TEST_DB_NAME || 'broom_kit_test';
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://postgres:postgres@127.0.0.1:5433/broom_kit_test';

console.log('🔧 Setting up test database...');
console.log(`Database: ${TEST_DB_NAME}`);

try {
  // Try to create the database using Docker psql (will fail if it exists, which is fine)
  try {
    console.log('\n📦 Creating test database via Docker...');
    execSync(
      `docker exec postgres psql -U postgres -c "CREATE DATABASE ${TEST_DB_NAME};"`,
      { stdio: 'inherit' }
    );
    console.log('✅ Test database created');
  } catch (error: unknown) {
    const err = error as { message: string; stderr?: Buffer };
    if (
      err.message.includes('already exists') ||
      err.stderr?.toString().includes('already exists')
    ) {
      console.log('ℹ️  Test database already exists');
    } else {
      console.warn(
        '⚠️  Could not create database via Docker, trying to continue...'
      );
    }
  }

  // Run migrations from package root directory
  console.log('\n🔄 Running migrations...');
  execSync(`DATABASE_URL=${TEST_DATABASE_URL} prisma db push`, {
    stdio: 'inherit',
    cwd: packageDir,
  });
  console.log('✅ Migrations applied');

  console.log('\n✨ Test database setup complete!');
  console.log(`\nTo run tests: pnpm test`);
} catch (error) {
  console.error('\n❌ Failed to setup test database:', error);
  process.exit(1);
}
