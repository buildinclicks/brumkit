# @repo/auth

Authentication and authorization package for BrumKit. Built with Auth.js v5, CASL, and bcryptjs.

## Features

- 🔐 **Email/Password Authentication**: Secure credentials-based authentication
- 🔑 **JWT Sessions**: Secure, stateless authentication
- 🛡️ **CASL Authorization**: Role-based and attribute-based access control (RBAC + ABAC)
- 🔒 **Password Security**: bcryptjs hashing with strength validation
- 🎫 **Magic Link Tokens**: Secure, time-limited authentication tokens
- 🚪 **Route Protection**: Next.js 16 proxy for optimistic redirects; primary enforcement in Server layouts and actions
- ✅ **Full Test Coverage**: Comprehensive unit tests for all utilities

## Installation

This package is part of the monorepo and is automatically available to other packages.

```bash
# Install dependencies (run from monorepo root)
pnpm install
```

## Usage

### 1. Authentication Configuration

#### Auth.js Setup

The package exports a pre-configured Auth.js instance:

```typescript
import { auth, signIn, signOut, handlers } from '@repo/auth';

// In your Next.js app's route handler (app/api/auth/[...nextauth]/route.ts)
export const { GET, POST } = handlers;

// Get current session
const session = await auth();
console.log(session?.user); // { id, email, role, username }

// Sign in with credentials
await signIn('credentials', { email, password });

// Sign out
await signOut();
```

#### Environment Variables

Create `apps/web/.env.local` (copied from the root `.env.development.example`):

```env
# Auth.js
NEXTAUTH_URL=http://localhost:4000
NEXTAUTH_SECRET=your-secret-key-here

# Email
FROM_EMAIL=noreply@yourdomain.com

# Database (Prisma)
DATABASE_URL=postgresql://user:password@localhost:5433/broom_kit
```

### 2. Route Protection (Next.js 16 Proxy)

In Next.js 16, `middleware.ts` is renamed to `proxy.ts`. The proxy handles
**optimistic redirects only** — primary auth enforcement lives in Server layouts
and server actions.

#### proxy.ts setup

Create a `proxy.ts` file in your Next.js app:

```typescript
import { authProxy } from '@repo/auth/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const innerProxy = authProxy({
  publicRoutes: ['/', '/verify-email', '/reset-password'],
  anonymousRoutes: ['/login', '/register', '/forgot-password'],
  protectedRoutes: ['/dashboard/*', '/profile/*'],
});

export default async function proxy(request: NextRequest) {
  return innerProxy(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

#### Server-side enforcement (required for defense-in-depth)

The proxy performs cookie-based optimistic redirects but is **not** the security
boundary. Enforce auth at the data layer in Server layouts and server actions:

```typescript
// app/(dashboard)/layout.tsx
import { auth } from '@repo/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }) {
  const session = await auth();
  if (!session) redirect('/login');
  return <>{children}</>;
}

// app/actions/example.ts
'use server';
import { getCurrentUser } from '@repo/auth';

export async function myAction() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  // ...
}
```

### 3. Authorization with CASL

#### Defining Abilities

```typescript
import { defineAbilitiesFor, type UserContext } from '@repo/auth';

const user: UserContext = {
  id: 'user-123',
  role: 'USER',
  email: 'user@example.com',
};

const ability = defineAbilitiesFor(user);

// Check permissions
if (ability.can('create', 'Article')) {
  console.log('User can create articles');
}

// Check with conditions
const article = { authorId: 'user-123', published: false };
if (ability.can('update', 'Article', article)) {
  console.log('User can update their own article');
}
```

#### Using in Server Components

```typescript
import { getCurrentUser } from '@repo/auth/permissions/guards';
import { defineAbilitiesFor } from '@repo/auth';

export default async function MyPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  const ability = defineAbilitiesFor(user);

  return (
    <div>
      {ability.can('create', 'Article') && (
        <button>Create Article</button>
      )}
    </div>
  );
}
```

#### Using in API Routes

```typescript
import { requireAuth, requireRole } from '@repo/auth/permissions/guards';
import { defineAbilitiesFor } from '@repo/auth';

export async function POST(request: Request) {
  // Require authentication
  const user = await requireAuth();

  // Or require specific role
  const admin = await requireRole('ADMIN');

  // Check abilities
  const ability = defineAbilitiesFor(user);
  if (!ability.can('create', 'Article')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ... handle request
}
```

#### Permission Roles

The package defines four user roles with different permissions:

##### SUPER_ADMIN

- Full control over all resources
- Can manage all users, articles, comments, tags

##### ADMIN

- Manage users, articles, tags
- Moderate comments
- Read all resources

##### MODERATOR

- Read all resources
- Moderate articles and comments
- Update published articles (for moderation)
- Delete comments
- Manage tags

##### USER

- Read public content (published articles, comments, tags, user profiles)
- Create articles
- Update/delete own articles (can only delete unpublished)
- Publish/unpublish own articles
- Create comments
- Update/delete own comments
- Manage own profile
- Manage social interactions (follows, bookmarks, reactions)
- Read own notifications

#### Using the `subject` Helper

For testing or manual subject creation:

```typescript
import { subject } from '@repo/auth';

const article = subject('Article', {
  id: 'article-123',
  authorId: 'user-123',
  published: false,
});

// Now you can check permissions on this subject
if (ability.can('delete', article)) {
  console.log('Can delete this article');
}
```

### 4. Password Utilities

#### Hashing Passwords

```typescript
import { hashPassword } from '@repo/auth/utils/password';

const hashedPassword = await hashPassword('MyPassword123!');
// Save to database
```

#### Verifying Passwords

```typescript
import { verifyPassword } from '@repo/auth/utils/password';

const isValid = await verifyPassword('MyPassword123!', hashedPassword);
if (isValid) {
  console.log('Password is correct');
}
```

#### Password Strength Validation

```typescript
import { validatePasswordStrength } from '@repo/auth/utils/password';

const { isValid, errors } = validatePasswordStrength('weak');
if (!isValid) {
  console.error('Password validation failed:', errors);
  // errors: [
  //   'Password must be at least 8 characters long',
  //   'Password must contain at least one uppercase letter',
  //   'Password must contain at least one number'
  // ]
}
```

**Password Requirements:**

- Minimum 8 characters
- Maximum 128 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### 5. Magic Link Tokens

#### Generating Tokens

```typescript
import { generateMagicLinkToken } from '@repo/auth/utils/token';

const token = await generateMagicLinkToken('user@example.com');

// Send token via email
const magicLink = `https://yourdomain.com/auth/verify?token=${token}`;
await sendEmail({
  to: 'user@example.com',
  subject: 'Your Magic Link',
  body: `Click here to sign in: ${magicLink}`,
});
```

#### Verifying Tokens

```typescript
import { verifyMagicLinkToken } from '@repo/auth/utils/token';

const email = await verifyMagicLinkToken(token);

if (email) {
  // Token is valid, sign in the user
  const user = await db.user.findUnique({ where: { email } });
  // ... create session
} else {
  // Token is invalid or expired
  return { error: 'Invalid or expired token' };
}
```

**Token Properties:**

- Expires after 1 hour
- One-time use (deleted after verification)
- Stored in database (VerificationToken model)

### 6. Session Utilities

#### Get Current Session

```typescript
import { getSession } from '@repo/auth/utils/session';

const session = await getSession();
if (session) {
  console.log(session.user); // { id, email, name, image, role, username }
}
```

#### Get Current User

```typescript
import { getCurrentUser } from '@repo/auth/utils/session';

const user = await getCurrentUser();
if (user) {
  console.log(user.id, user.role, user.email);
}
```

#### Get User with Abilities

```typescript
import { getUserWithAbilities } from '@repo/auth/utils/session';

const { user, ability } = await getUserWithAbilities();

if (user && ability.can('create', 'Article')) {
  // User is authenticated and can create articles
}
```

## API Reference

### Types

#### `UserContext`

```typescript
interface UserContext {
  id: string;
  role: UserRole; // 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'USER'
  email: string;
}
```

#### `Action`

```typescript
type Action =
  | 'manage' // Full control (all actions)
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'publish'
  | 'unpublish'
  | 'moderate';
```

#### `Subject`

```typescript
type Subject =
  | 'User'
  | 'Article'
  | 'Comment'
  | 'Tag'
  | 'Notification'
  | 'Follow'
  | 'Bookmark'
  | 'Reaction'
  | 'all'; // Special subject for all resources
```

#### `AppAbility`

```typescript
type AppAbility = MongoAbility<[Action, SubjectType]>;
```

### Functions

#### `defineAbilitiesFor(user: UserContext): AppAbility`

Defines and returns CASL abilities for a user based on their role.

#### `createAbility(user: UserContext): AppAbility`

Alias for `defineAbilitiesFor`.

#### `subject<T extends Subject>(type: T, object: any): SubjectType`

Creates a typed subject for permission checking.

#### `hashPassword(password: string): Promise<string>`

Hashes a password using bcryptjs with 10 salt rounds.

#### `verifyPassword(password: string, hashedPassword: string): Promise<boolean>`

Verifies a password against a bcrypt hash.

#### `validatePasswordStrength(password: string): { isValid: boolean; errors: string[] }`

Validates password strength against requirements.

#### `generateMagicLinkToken(email: string): Promise<string>`

Generates a magic link token for an email address. Expires after 1 hour.

#### `verifyMagicLinkToken(token: string): Promise<string | null>`

Verifies a magic link token and returns the email if valid, or null if invalid/expired.

#### `getSession(): Promise<Session | null>`

Returns the current Auth.js session.

#### `getCurrentUser(): Promise<User | null>`

Returns the current authenticated user or null.

#### `getUserWithAbilities(): Promise<{ user: User | null; ability: AppAbility }>`

Returns the current user with their CASL abilities.

#### `requireAuth(): Promise<User>`

Ensures a user is authenticated. Throws an error if not.

#### `requireRole(role: UserRole): Promise<User>`

Ensures a user has a specific role. Throws an error if not.

#### `canUser(user: User | null, action: Action, subject: SubjectType): boolean`

Checks if a user can perform an action on a subject.

## Testing

Run the test suite:

```bash
# From the auth package directory
pnpm test

# From the monorepo root
pnpm --filter @repo/auth test
```

### Test Coverage

- ✅ Password utilities (hashing, verification, strength validation)
- ✅ Magic link tokens (generation, verification, expiration)
- ✅ CASL abilities for all roles (SUPER_ADMIN, ADMIN, MODERATOR, USER, GUEST)
- ✅ Attribute-based permissions (own resources vs others)

## Package Structure

```
packages/auth/
├── src/
│   ├── config/
│   │   ├── auth.config.ts      # Auth.js configuration
│   │   ├── auth.edge.ts        # Edge-safe Auth.js instance (no DB adapter)
│   │   ├── auth.ts             # Auth.js instance (full, with Prisma adapter)
│   │   └── providers.ts        # Auth providers
│   ├── permissions/
│   │   ├── abilities.ts        # CASL ability definitions
│   │   ├── guards.ts           # Server-side permission guards
│   │   └── rules.ts            # Permission rules (deprecated)
│   ├── utils/
│   │   ├── password.ts         # Password utilities
│   │   ├── session.ts          # Session utilities
│   │   └── token.ts            # Magic link token utilities
│   ├── proxy.ts                # authProxy factory for Next.js 16 proxy.ts
│   ├── edge.ts                 # Re-exports for proxy/edge runtime (@repo/auth/edge)
│   ├── middleware.ts           # Backward-compat shim → proxy.ts (deprecated)
│   ├── types.ts                # TypeScript type extensions
│   └── index.ts                # Package exports
├── test/
│   ├── abilities.test.ts       # CASL abilities tests
│   ├── password.test.ts        # Password utilities tests
│   └── token.test.ts           # Token utilities tests
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Dependencies

- `next-auth` - Authentication library
- `@auth/prisma-adapter` - Prisma adapter for Auth.js
- `@casl/ability` - Authorization library
- `@casl/react` - React integration for CASL
- `@prisma/client` - Database client
- `bcryptjs` - Password hashing
- `zod` - Schema validation (via `@repo/validation`)
- `uuid` - UUID generation for tokens

## Best Practices

### 1. Always Hash Passwords

Never store plain-text passwords:

```typescript
// ✅ Good
const hashedPassword = await hashPassword(password);
await db.user.create({ data: { email, password: hashedPassword } });

// ❌ Bad
await db.user.create({ data: { email, password } });
```

### 2. Check Permissions on Both Client and Server

Client-side checks for UX, server-side for security:

```typescript
// Client (for UI)
if (ability.can('delete', article)) {
  return <button>Delete</button>;
}

// Server (for security)
export async function DELETE(request: Request) {
  const user = await requireAuth();
  const ability = defineAbilitiesFor(user);

  if (!ability.can('delete', 'Article', article)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ... delete article
}
```

### 3. Use Type-Safe Subjects

Always use the `subject` helper for type-safe permission checks:

```typescript
// ✅ Good
const article = subject('Article', dbArticle);
ability.can('update', article);

// ❌ Bad (type-unsafe)
ability.can('update', dbArticle);
```

### 4. Validate Input with Zod

Use `@repo/validation` schemas for consistent validation:

```typescript
import { loginSchema } from '@repo/validation';

const result = loginSchema.safeParse({ email, password });
if (!result.success) {
  return { errors: result.error.flatten() };
}
```

### 5. Handle Session Expiry

Auth.js automatically handles JWT expiry. Configure in `auth.config.ts`:

```typescript
export const authConfig = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // ...
};
```

## Troubleshooting

### "Cannot find module 'bcrypt'"

If you encounter native module issues with bcrypt, the package automatically uses `bcryptjs` which is a pure JavaScript implementation.

### "Unauthorized" errors

Ensure your Auth.js environment variables are set correctly in `apps/web/.env.local`:

```bash
NEXTAUTH_URL=http://localhost:4000
NEXTAUTH_SECRET=your-secret-key
```

### Permission checks not working

Make sure you're using the `subject` helper and passing the correct user context:

```typescript
// Ensure user has correct structure
const user: UserContext = {
  id: session.user.id,
  role: session.user.role,
  email: session.user.email,
};

const ability = defineAbilitiesFor(user);
const article = subject('Article', { authorId: user.id });

// Now this should work
ability.can('update', article); // true for own articles
```

## Contributing

When adding new features to this package:

1. **Add tests** - All new utilities must have tests
2. **Update types** - Extend TypeScript types as needed
3. **Document API** - Update this README with usage examples
4. **Follow conventions** - Use the established patterns

## License

MIT
