// Third party imports
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Cargar variables de entorno para pruebas
dotenv.config({ path: '.env.test' });

// Configuración global para las pruebas
process.env.INTERNAL_API_KEY = 'test-api-key';
process.env.NODE_ENV = 'test';

// Cliente de Prisma para pruebas
export const prisma = new PrismaClient();

// Funciones de utilidad para tests
export const setupTestEnvironment = async () => {
    // Implementar cuando se necesiten tests
};

export const teardownTestEnvironment = async () => {
    // Implementar cuando se necesiten tests
}; 