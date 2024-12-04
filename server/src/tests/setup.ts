import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Setup MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Setup test database
  await prisma.$connect();
  
  // Create test user and role
  const role = await prisma.role.create({
    data: {
      name: 'admin',
      description: 'Administrator role',
    },
  });

  await prisma.user.create({
    data: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed_password',
      roleId: role.id,
    },
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clear collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  
  // Clear MySQL tables
  await prisma.course.deleteMany({});
});

// Helper function to generate test JWT token
export const generateTestToken = (userId: string = 'test-user-id') => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};