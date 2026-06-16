import type { Action, Subject } from './abilities';
import type { UserRole } from '@repo/database';

/**
 * Permission rules by role
 * This is a human-readable representation for documentation
 */
export const permissionRules: Record<
  UserRole,
  Array<{
    action: Action | Action[];
    subject: Subject | Subject[];
    conditions?: Record<string, unknown>;
    description: string;
  }>
> = {
  SUPER_ADMIN: [
    {
      action: 'manage',
      subject: 'all',
      description: 'Full system access - can do everything',
    },
  ],

  ADMIN: [
    {
      action: 'manage',
      subject: ['User', 'Notification'],
      description: 'Full management of users and notifications',
    },
    {
      action: 'read',
      subject: 'all',
      description: 'Can read all content',
    },
  ],

  MODERATOR: [
    {
      action: 'read',
      subject: 'all',
      description: 'Can read all content',
    },
    {
      action: 'update',
      subject: 'Notification',
      conditions: { recipientId: '<userId>' },
      description: 'Can manage own notifications',
    },
  ],

  USER: [
    {
      action: 'read',
      subject: 'User',
      description: 'Can read all users (basic info)',
    },
    {
      action: ['read', 'update'],
      subject: 'User',
      conditions: { id: '<userId>' },
      description: 'Can view and edit own profile',
    },
    {
      action: ['read', 'update'],
      subject: 'Notification',
      conditions: { recipientId: '<userId>' },
      description: 'Can read and mark own notifications as read',
    },
  ],
};

/**
 * Get permission rules for a specific role
 */
export function getRolePermissions(role: UserRole) {
  return permissionRules[role] || [];
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(
  role: UserRole,
  action: Action,
  subject: Subject
): boolean {
  const rules = permissionRules[role];

  // Check for 'manage all' permission
  if (
    rules.some((rule) => rule.action === 'manage' && rule.subject === 'all')
  ) {
    return true;
  }

  // Check for specific permission
  return rules.some((rule) => {
    const actions = Array.isArray(rule.action) ? rule.action : [rule.action];
    const subjects = Array.isArray(rule.subject)
      ? rule.subject
      : [rule.subject];

    return (
      actions.includes(action) &&
      (subjects.includes(subject) || subjects.includes('all'))
    );
  });
}
