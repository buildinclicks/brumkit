import { auth } from '../config/auth';
import { createAbility } from '../permissions/abilities';
import {
  can,
  cannot,
  canAccess,
  assertCan,
  assertCanAccess,
} from '../permissions/guards';

import type { UserContext, Action, Subject } from '../permissions/abilities';
import type { UserRole } from '@repo/database';

/**
 * Get the current authenticated session
 * Returns null if not authenticated
 */
export async function getSession() {
  return auth();
}

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

/**
 * Get the current user with ability context
 * Throws if not authenticated
 */
export async function getCurrentUserContext(): Promise<UserContext> {
  const user = await getCurrentUser();

  if (!user || !user.id || !user.role || !user.email) {
    throw new Error('Not authenticated');
  }

  return {
    id: user.id,
    role: user.role as UserRole,
    email: user.email,
  };
}

/**
 * Check if the current request is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

/**
 * Require a specific role - throws if insufficient permissions
 */
export async function requireRole(role: UserRole | UserRole[]) {
  const user = await requireAuth();
  const roles = Array.isArray(role) ? role : [role];

  if (!user.role || !roles.includes(user.role as UserRole)) {
    throw new Error(
      `Insufficient permissions. Required role: ${roles.join(' or ')}`
    );
  }

  return user;
}

/**
 * Check if current user can perform an action
 */
export async function canUser(
  action: Action,
  subject: Subject
): Promise<boolean> {
  const user = await getCurrentUserContext();
  return can(user, action, subject);
}

/**
 * Check if current user cannot perform an action
 */
export async function cannotUser(
  action: Action,
  subject: Subject
): Promise<boolean> {
  const user = await getCurrentUserContext();
  return cannot(user, action, subject);
}

/**
 * Check if current user can access a specific resource
 */
export async function canUserAccess<T extends Record<string, unknown>>(
  action: Action,
  subject: Subject,
  resource: T
): Promise<boolean> {
  const user = await getCurrentUserContext();
  return canAccess(user, action, subject, resource);
}

/**
 * Assert that current user can perform an action (throws if not)
 */
export async function assertUserCan(
  action: Action,
  subject: Subject
): Promise<void> {
  const user = await getCurrentUserContext();
  assertCan(user, action, subject);
}

/**
 * Assert that current user can access a resource (throws if not)
 */
export async function assertUserCanAccess<T extends Record<string, unknown>>(
  action: Action,
  subject: Subject,
  resource: T
): Promise<void> {
  const user = await getCurrentUserContext();
  assertCanAccess(user, action, subject, resource);
}

/**
 * Get user ID from session
 */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

/**
 * Get user role from session
 */
export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  return (user?.role as UserRole) || null;
}

/**
 * Check if current user is an admin (ADMIN or SUPER_ADMIN)
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

/**
 * Check if current user is a super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'SUPER_ADMIN';
}

/**
 * Get the current user with their CASL abilities
 */
export async function getUserWithAbilities() {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      ability: createAbility({ id: '', role: 'USER' as UserRole, email: '' }),
    };
  }

  const ability = createAbility({
    id: user.id ?? '',
    role: (user.role as UserRole) ?? 'USER',
    email: user.email ?? '',
  });

  return { user, ability };
}

/**
 * Check if current user is a moderator (or higher)
 */
export async function isModerator(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'MODERATOR' || role === 'ADMIN' || role === 'SUPER_ADMIN';
}
