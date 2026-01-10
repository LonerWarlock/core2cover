import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  // Explicitly pass the connection URL from the environment variable
  return new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });
};

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;