import { createUser } from '../src/lib/auth';
import { prisma } from '../src/lib/prisma';

async function main() {
  const email = 'admin@paperbot.com';
  const password = 'Qwer@3134';
  const name = 'Admin User';
  const role = 'ADMIN' as const;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('User already exists:', email);
      return;
    }

    // Create admin user
    const user = await createUser(email, password, name, role);
    console.log('Admin user created successfully:');
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Role:', user.role);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

