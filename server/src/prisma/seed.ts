import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      description: 'Administrator with full access',
    },
  });

  const studentRole = await prisma.role.create({
    data: {
      name: 'student',
      description: 'Regular student user',
    },
  });

  // Create permissions
  const permissions = await prisma.permission.createMany({
    data: [
      { name: 'create_course', description: 'Can create new courses' },
      { name: 'edit_course', description: 'Can edit existing courses' },
      { name: 'delete_course', description: 'Can delete courses' },
      { name: 'view_course', description: 'Can view courses' },
      { name: 'manage_users', description: 'Can manage user accounts' },
      { name: 'manage_roles', description: 'Can manage roles and permissions' },
    ],
  });

  const allPermissions = await prisma.permission.findMany();

  // Assign all permissions to admin role
  await Promise.all(
    allPermissions.map((permission) =>
      prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      })
    )
  );

  // Assign view_course permission to student role
  const viewCoursePermission = allPermissions.find(
    (p) => p.name === 'view_course'
  );
  if (viewCoursePermission) {
    await prisma.rolePermission.create({
      data: {
        roleId: studentRole.id,
        permissionId: viewCoursePermission.id,
      },
    });
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });