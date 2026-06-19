/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { POST } from './route';

vi.mock('@repo/auth', () => ({
  hashPassword: vi.fn(async (p: string) => `hashed:${p}`),
}));

vi.mock('@repo/database', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const buildRequest = (body: unknown) =>
  new Request('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const validPayload = {
  name: 'Alice Smith',
  email: 'alice@example.com',
  password: 'Password123!',
  confirmPassword: 'Password123!',
};

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create user and return 201', async () => {
    const { db } = await import('@repo/database');

    vi.mocked(db.user.findUnique).mockResolvedValue(null);
    vi.mocked(db.user.create).mockResolvedValue({
      id: 'new_user',
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'USER',
      createdAt: new Date(),
    } as any);

    const res = await POST(buildRequest(validPayload));
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.message).toBe('User created successfully');
    expect(data.user.email).toBe('alice@example.com');
  });

  it('should return 409 for duplicate email without leaking enumeration info', async () => {
    const { db } = await import('@repo/database');

    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: 'existing_user',
      email: 'alice@example.com',
    } as any);

    const res = await POST(buildRequest(validPayload));
    const data = await res.json();

    // 409 Conflict — generic message prevents email enumeration
    expect(res.status).toBe(409);
    expect(data.error).not.toMatch(/already exists/i);
    expect(data.error).toBeDefined();
    expect(db.user.create).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid schema (missing email)', async () => {
    const res = await POST(
      buildRequest({
        password: 'Password123!',
        confirmPassword: 'Password123!',
      })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 400 for weak password', async () => {
    const { db } = await import('@repo/database');
    vi.mocked(db.user.findUnique).mockResolvedValue(null);

    const res = await POST(
      buildRequest({
        name: 'Bob',
        email: 'bob@example.com',
        password: 'weak',
        confirmPassword: 'weak',
      })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should hash the password before storing', async () => {
    const { db } = await import('@repo/database');
    const { hashPassword } = await import('@repo/auth');

    vi.mocked(db.user.findUnique).mockResolvedValue(null);
    vi.mocked(db.user.create).mockResolvedValue({
      id: 'u1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'USER',
      createdAt: new Date(),
    } as any);

    await POST(buildRequest(validPayload));

    expect(hashPassword).toHaveBeenCalledWith('Password123!');
    expect(db.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          password: 'hashed:Password123!',
        }),
      })
    );
  });
});
