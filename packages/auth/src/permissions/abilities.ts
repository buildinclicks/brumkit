import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
  subject as detectSubjectType,
} from '@casl/ability';

import type { UserRole } from '@repo/database';

/**
 * Actions that can be performed on resources
 */
export type Action =
  | 'manage' // Full control (all actions)
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'publish'
  | 'unpublish'
  | 'moderate';

/**
 * Subjects (resource types)
 */
export type Subject = 'User' | 'Notification' | 'all'; // Special subject for all resources

/**
 * Subject instances with properties for CASL conditions
 */
export type UserSubject = { id: string };
export type NotificationSubject = { recipientId: string };

/**
 * Subject with instances - for type checking with CASL
 */
export type SubjectType =
  | Subject
  | UserSubject
  | NotificationSubject
  | { __typename: Subject; [key: string]: unknown };

/**
 * Ability type definition
 */
export type AppAbility = MongoAbility<[Action, SubjectType]>;

/**
 * User context for permission checking
 */
export interface UserContext {
  id: string;
  role: UserRole;
  email: string;
}

/**
 * Permission Summary:
 *
 * SUPER_ADMIN:
 * - Can manage all resources (full control)
 *
 * ADMIN:
 * - Can manage all Users
 * - Can manage all Notifications
 * - Can read all resources
 *
 * MODERATOR:
 * - Can read all Users
 * - Can read all Notifications
 * - Can update own Notifications
 *
 * USER:
 * - Can read all Users (basic info)
 * - Can update own User profile
 * - Can read own Notifications
 * - Can update own Notifications (mark as read)
 */
export function defineAbilitiesFor(user: UserContext): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  switch (user.role) {
    case 'SUPER_ADMIN':
      // Super Admin can do everything
      can('manage', 'all');
      break;

    case 'ADMIN':
      // Admin can manage users and notifications
      can('manage', 'User');
      can('manage', 'Notification');

      // Can read everything
      can('read', 'all');
      break;

    case 'MODERATOR':
      // Moderator can read everything
      can('read', 'all');

      // Can manage own notifications
      can('update', 'Notification', {
        recipientId: user.id,
      } as NotificationSubject);
      break;

    case 'USER':
      // Users can read public users
      can('read', 'User');

      // Users can manage their own profile
      can('update', 'User', { id: user.id } as UserSubject);
      can('read', 'User', { id: user.id } as UserSubject); // Can read own full profile

      // Users can read their own notifications
      can('read', 'Notification', {
        recipientId: user.id,
      } as NotificationSubject);
      can('update', 'Notification', {
        recipientId: user.id,
      } as NotificationSubject); // Mark as read
      break;

    default:
      // No permissions for unknown roles
      break;
  }

  return build();
}

/**
 * Create ability instance for a user
 */
export function createAbility(user: UserContext): AppAbility {
  return defineAbilitiesFor(user);
}

/**
 * Helper to create a subject for testing
 */
export function subject<T extends Subject>(
  type: T,
  object: Record<string, unknown>
) {
  return detectSubjectType(type, object);
}
