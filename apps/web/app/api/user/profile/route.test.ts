/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PATCH } from './route';

vi.mock('@repo/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@repo/database', () => ({
  db: {
    user: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const buildRequest = (body: unknown) =>
  new Request('http://localhost:3000/api/user/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('PATCH /api/user/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 for unauthenticated PATCH', async () => {
    const { auth } = await import('@repo/auth');
    vi.mocked(auth).mockResolvedValue(null as any);

    const res = await PATCH(buildRequest({ name: 'Alice' }));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should update profile with valid data', async () => {
    const { auth } = await import('@repo/auth');
    const { db } = await import('@repo/database');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user_1', email: 'u@example.com' },
    } as any);

    vi.mocked(db.user.findFirst).mockResolvedValue(null);
    vi.mocked(db.user.update).mockResolvedValue({
      id: 'user_1',
      name: 'Alice Updated',
      email: 'u@example.com',
      username: null,
      bio: null,
      image: null,
      role: 'USER',
    } as any);

    const res = await PATCH(
      buildRequest({ name: 'Alice Updated', username: 'alice', bio: '' })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe('Profile updated successfully');
    expect(db.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user_1' },
        data: expect.objectContaining({ name: 'Alice Updated' }),
      })
    );
  });

  it('should return 400 for invalid data (Zod parse failure)', async () => {
    const { auth } = await import('@repo/auth');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user_1', email: 'u@example.com' },
    } as any);

    // Username with invalid chars triggers Zod error
    const res = await PATCH(buildRequest({ username: 'invalid username!' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 400 when username is already taken', async () => {
    const { auth } = await import('@repo/auth');
    const { db } = await import('@repo/database');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user_1', email: 'u@example.com' },
    } as any);

    vi.mocked(db.user.findFirst).mockResolvedValue({
      id: 'user_2',
      username: 'takenname',
    } as any);

    const res = await PATCH(buildRequest({ username: 'takenname' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/already taken/i);
  });
});
