import { UserRole } from '@repo/database';

import { auth } from '../config/auth';

import { createAbility } from './abilities';

import type { UserContext, AppAbility, Action, Subject } from './abilities';

/**
 * Get the current authenticated user from the session
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Require specific role - throws if user doesn't have role
 */
export async function requireRole(role: UserRole) {
  const user = await requireAuth();
  if (user.role !== role && user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Forbidden');
  }
  return user;
}

/**
 * Check if user can perform an action on a subject
 */
export async function canUser(
  user: Awaited<ReturnType<typeof getCurrentUser>>,
  action: Action,
  subject: Subject
) {
  if (!user) return false;
  const ability = createAbility({
    id: user.id ?? '',
    role: user.role ?? 'USER',
    email: user.email ?? '',
  });
  return ability.can(action, subject);
}

/**
 * Check if a user can perform an action on a subject
 */
export function can(
  user: UserContext,
  action: Action,
  subject: Subject
): boolean {
  const ability = createAbility(user);
  return ability.can(action, subject);
}

/**
 * Check if a user cannot perform an action on a subject
 */
export function cannot(
  user: UserContext,
  action: Action,
  subject: Subject
): boolean {
  const ability = createAbility(user);
  return ability.cannot(action, subject);
}

/**
 * Check if a user can perform an action on a specific resource instance
 */
export function canAccess<T extends Record<string, unknown>>(
  user: UserContext,
  action: Action,
  subject: Subject,
  resource: T
): boolean {
  const ability = createAbility(user);
  // Type assertion needed as CASL typing is complex with conditional types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ability.can(action, subject as any, resource as any);
}

/**
 * Throw an error if user cannot perform an action
 */
export function assertCan(
  user: UserContext,
  action: Action,
  subject: Subject
): void {
  if (!can(user, action, subject)) {
    throw new Error(`Permission denied: Cannot ${action} ${subject}`);
  }
}

/**
 * Throw an error if user cannot access a specific resource
 */
export function assertCanAccess<T extends Record<string, unknown>>(
  user: UserContext,
  action: Action,
  subject: Subject,
  resource: T
): void {
  if (!canAccess(user, action, subject, resource)) {
    const resourceId = 'id' in resource ? String(resource.id) : 'unknown';
    throw new Error(
      `Permission denied: Cannot ${action} ${subject} with id ${resourceId}`
    );
  }
}

/**
 * Filter a list of resources based on user permissions
 */
export function filterByPermission<T extends Record<string, unknown>>(
  user: UserContext,
  action: Action,
  subject: Subject,
  resources: T[]
): T[] {
  const ability = createAbility(user);
  return resources.filter((resource) =>
    // Type assertion needed as CASL typing is complex with conditional types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ability.can(action, subject as any, resource as any)
  );
}

/**
 * Get ability instance for a user (for use in React components)
 */
export function getAbility(user: UserContext): AppAbility {
  return createAbility(user);
}
