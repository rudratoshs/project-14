import prisma from '../config/prisma.js';

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
}

export default new PermissionService();