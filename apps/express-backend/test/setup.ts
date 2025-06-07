import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración global para las pruebas
beforeAll(async () => {
    // Aquí puedes agregar configuración global que se ejecutará antes de todas las pruebas
});

afterAll(async () => {
    // Aquí puedes agregar limpieza global que se ejecutará después de todas las pruebas
});

// Configuración para cada prueba
beforeEach(async () => {
    // Aquí puedes agregar configuración que se ejecutará antes de cada prueba
});

afterEach(async () => {
    // Aquí puedes agregar limpieza que se ejecutará después de cada prueba
}); 