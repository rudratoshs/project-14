import prisma from '../config/prisma.js';
import { Prisma } from '@prisma/client';

export class PermissionService {
  async findAll() {
    return prisma.permission.findMany({
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
  }

  async findById(id: string) {
    return prisma.permission.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
  }

  async create(data: Prisma.PermissionCreateInput) {
    return prisma.permission.create({
      data,
    });
  }

  async update(id: string, data: Prisma.PermissionUpdateInput) {
    return prisma.permission.update({
      where: { id },
      data,
    });
  }
}

export default new PermissionService();