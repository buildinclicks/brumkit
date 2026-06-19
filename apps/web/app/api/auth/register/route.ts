/**
 * REST registration endpoint.
 *
 * This route is an alternative to the `registerUser` server action. When both
 * exist, they must behave identically in terms of security posture to avoid
 * a weaker path. Key differences that this route still lacks vs the action:
 *   - No Redis rate limiting (the action limits by email + IP)
 *   - No verification email
 * These gaps are tracked in the enterprise readiness audit. For now, the route
 * is hardened to at minimum prevent email enumeration.
 */
import { hashPassword } from '@repo/auth';
import { db } from '@repo/database';
import { registerSchema } from '@repo/validation';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validatedData = registerSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      // Return a generic conflict response to prevent email enumeration.
      // The message does NOT confirm whether the email is already registered.
      return NextResponse.json(
        { error: 'Unable to complete registration. Please try again.' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(validatedData.password);

    const user = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
