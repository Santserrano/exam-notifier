import { afterAll, beforeAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import dotenv from 'dotenv';


dotenv.config({ path: '.env.test' });

// Mock de las variables de entorno necesarias
process.env.RESEND_API_KEY = 'test_resend_key';
process.env.VAPID_PUBLIC_KEY = 'test_vapid_public';
process.env.VAPID_PRIVATE_KEY = 'test_vapid_private';
process.env.INTERNAL_API_KEY = 'test_api_key';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./test.db';
process.env.NODE_ENV = 'test';


const prisma = new PrismaClient();


const resetTestDatabase = () => {
  if (process.env.NODE_ENV === 'test') {
    try {
      execSync('npx prisma migrate reset --force --skip-seed', {
        stdio: 'inherit',
      });
    } catch (error) {
      console.error('Error resetting test database:', error);
      throw error;
    }
  }
};


beforeAll(async () => {
  // Aplicar migraciones a la base de datos de prueba
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    await prisma.$connect();
  } catch (error) {
    console.error('Error during test database setup:', error);
    throw error;
  }
});

beforeEach(() => {
  // Limpiar datos antes de cada test
  jest.clearAllMocks();
});

afterAll(async () => {
  // Desconectar Prisma y limpiar recursos
  await prisma.$disconnect();
});


export const testUtils = {
  prisma,
  resetTestDatabase,
  seedTestData: async (data: Record<string, unknown[]>) => {
    await Promise.all(
      Object.entries(data).map(async ([model, records]) => {
        // @ts-expect-error - Dynamic access to prisma models
        await prisma[model].createMany({ data: records });
      })
    );
  },
};

// Exportaciones
export { prisma };
export * from './test-utils.js';

// Mock implementation
global.fetch = jest.fn();