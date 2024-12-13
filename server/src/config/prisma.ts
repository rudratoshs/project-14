import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query']
});
prisma.$use(async (params, next) => {
    console.log('Prisma Query:', params.action, params.model, params.args);
    const result = await next(params);
    return result;
});
export default prisma;