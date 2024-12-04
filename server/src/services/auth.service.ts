import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';
import { generateToken } from '../utils/jwt.js';
import { LoginCredentials, RegisterData } from '../types/auth.js';

export class AuthService {
  async login(credentials: LoginCredentials) {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      include: { role: true }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken({
      userId: user.id,
      roleId: user.roleId
    });

    return { user, token };
  }

  async register(data: RegisterData) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const studentRole = await prisma.role.findFirst({
      where: { name: 'student' }
    });

    if (!studentRole) {
      throw new Error('Student role not found');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        roleId: studentRole.id
      },
      include: { role: true }
    });

    const token = generateToken({
      userId: user.id,
      roleId: user.roleId
    });

    return { user, token };
  }
}

export default new AuthService();