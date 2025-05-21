import dotenv from 'dotenv';

// Cargar variables de entorno para pruebas
dotenv.config({ path: '.env.test' });

// Configuración global para las pruebas
process.env.INTERNAL_API_KEY = 'test-api-key';
process.env.NODE_ENV = 'test'; 