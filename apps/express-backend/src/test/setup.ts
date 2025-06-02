// Third party imports
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Cargar variables de entorno para los tests
dotenv.config();

// Mock de las variables de entorno necesarias
process.env.RESEND_API_KEY = 'test_resend_key';
process.env.VAPID_PUBLIC_KEY = 'test_vapid_public';
process.env.VAPID_PRIVATE_KEY = 'test_vapid_private';
process.env.INTERNAL_API_KEY = 'test_api_key';

// Configuración global para las pruebas
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