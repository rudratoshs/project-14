import prisma from '../config/prisma.js';
import { CreateRoleData, UpdateRoleData } from '../types/role.js';

export class RoleService {
  async findAll() {
    return prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
  }

  async findById(id: string) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
  }

  async create(data: CreateRoleData) {
    const existingRole = await prisma.role.findUnique({
      where: { name: data.name }
    });

    if (existingRole) {
      throw new Error('Role name already exists');
    }

    return prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: {
          create: data.permissionIds.map(permissionId => ({
            permission: { connect: { id: permissionId } }
          }))
        }
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
  }

  async update(id: string, data: UpdateRoleData) {
    if (data.name) {
      const existingRole = await prisma.role.findFirst({
        where: {
          name: data.name,
          NOT: { id }
        }
      });

      if (existingRole) {
        throw new Error('Role name already exists');
      }
    }

    // Start a transaction to handle permission updates
    return prisma.$transaction(async (tx) => {
      // Update basic role information
      const role = await tx.role.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
        }
      });

      // Update permissions if provided
      if (data.permissionIds) {
        // Remove existing permissions
        await tx.rolePermission.deleteMany({
          where: { roleId: id }
        });

        // Add new permissions
        await tx.rolePermission.createMany({
          data: data.permissionIds.map(permissionId => ({
            roleId: id,
            permissionId
          }))
        });
      }

      // Return updated role with permissions
      return tx.role.findUnique({
        where: { id },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      });
    });
  }

  async delete(id: string) {
    // Check if role is in use
    const usersWithRole = await prisma.user.count({
      where: { roleId: id }
    });

    if (usersWithRole > 0) {
      throw new Error('Cannot delete role that is assigned to users');
    }

    return prisma.role.delete({
      where: { id }
    });
  }
}

export default new RoleService();