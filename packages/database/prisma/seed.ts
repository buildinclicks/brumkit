import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  UserRole,
  NotificationType,
} from '../src/generated/prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// Seed configuration
const SEED_CONFIG = {
  users: 10,
  notificationsPerUser: 5,
};

// Helper: Hash password
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Helper: Random array element
function randomElement<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error('Cannot get random element from empty array');
  }
  return arr[Math.floor(Math.random() * arr.length)]!;
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...');
  await prisma.notification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Existing data cleared\n');

  // Create users
  console.log(`👥 Creating ${SEED_CONFIG.users} users...`);
  const users = [];

  // Create Super Admin
  const superAdminPassword = await hashPassword('SuperAdmin123!');
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@brumkit.com',
      name: 'Super Admin',
      username: 'superadmin',
      password: superAdminPassword,
      emailVerified: new Date(),
      role: UserRole.SUPER_ADMIN,
      bio: 'Super Administrator of Broom Kit',
      image: faker.image.avatar(),
    },
  });
  users.push(superAdmin);
  console.log(`  ✅ Super Admin: ${superAdmin.email}`);

  // Create Admin
  const adminPassword = await hashPassword('Admin123!');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@brumkit.com',
      name: 'Admin User',
      username: 'admin',
      password: adminPassword,
      emailVerified: new Date(),
      role: UserRole.ADMIN,
      bio: 'Administrator of Broom Kit',
      image: faker.image.avatar(),
    },
  });
  users.push(admin);
  console.log(`  ✅ Admin: ${admin.email}`);

  // Create Moderator
  const moderatorPassword = await hashPassword('Moderator123!');
  const moderator = await prisma.user.create({
    data: {
      email: 'moderator@brumkit.com',
      name: 'Moderator User',
      username: 'moderator',
      password: moderatorPassword,
      emailVerified: new Date(),
      role: UserRole.MODERATOR,
      bio: 'Content Moderator',
      image: faker.image.avatar(),
    },
  });
  users.push(moderator);
  console.log(`  ✅ Moderator: ${moderator.email}`);

  // Create Example User
  const exampleUserPassword = await hashPassword('User123!');
  const exampleUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Example User',
      username: 'example',
      password: exampleUserPassword,
      emailVerified: new Date(),
      role: UserRole.USER,
      bio: 'Regular Example User',
      image: faker.image.avatar(),
    },
  });
  users.push(exampleUser);
  console.log(`  ✅ Example User: ${exampleUser.email}`);

  // Create regular users
  const defaultPassword = await hashPassword('User123!');
  for (let i = 0; i < SEED_CONFIG.users - 4; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet
      .username({ firstName, lastName })
      .toLowerCase()
      .slice(0, 20);

    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        name: `${firstName} ${lastName}`,
        username,
        password: defaultPassword,
        emailVerified: faker.datatype.boolean(0.8) ? new Date() : null,
        role: UserRole.USER,
        bio: faker.lorem.sentence(),
        image: faker.image.avatar(),
      },
    });
    users.push(user);
  }
  console.log(`✅ Created ${users.length} users\n`);

  // Create notifications
  console.log(
    `📬 Creating notifications (${SEED_CONFIG.notificationsPerUser} per user)...`
  );
  let notificationCount = 0;

  const notificationTypes = [
    NotificationType.SYSTEM,
    NotificationType.ACCOUNT,
    NotificationType.SECURITY,
  ];

  for (const user of users) {
    const notificationsForUser = [];
    for (let i = 0; i < SEED_CONFIG.notificationsPerUser; i++) {
      const type = randomElement(notificationTypes);
      let title = '';
      let message = '';
      let link = null;

      switch (type) {
        case NotificationType.SYSTEM:
          title = 'System Update';
          message = 'A new system update has been released.';
          link = '/updates';
          break;
        case NotificationType.ACCOUNT:
          title = 'Account Update';
          message = 'Your account settings have been updated successfully.';
          link = '/profile';
          break;
        case NotificationType.SECURITY:
          title = 'Security Alert';
          message = 'A new login was detected from a different device.';
          link = '/security';
          break;
      }

      const notification = await prisma.notification.create({
        data: {
          recipientId: user.id,
          type,
          title,
          message,
          link,
          readAt: faker.datatype.boolean(0.5) ? faker.date.recent() : null,
        },
      });
      notificationsForUser.push(notification);
    }
    notificationCount += notificationsForUser.length;
  }
  console.log(`✅ Created ${notificationCount} notifications\n`);

  // Summary
  console.log('🎉 Database seeding completed!\n');
  console.log('📊 Summary:');
  console.log(`  • Users: ${users.length}`);
  console.log(`  • Notifications: ${notificationCount}`);
  console.log('\n🔐 Test Credentials:');
  console.log(`  Super Admin: superadmin@brumkit.com / SuperAdmin123!`);
  console.log(`  Admin: admin@brumkit.com / Admin123!`);
  console.log(`  Moderator: moderator@brumkit.com / Moderator123!`);
  console.log(`  Example User: user@example.com / User123!`);
  console.log(`  Regular Users: User123!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
