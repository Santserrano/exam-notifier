import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // Verificar si el profesor existe
        return const profesorExistente = await prisma.profesor.findUnique({
            where: {
                id: 'user_2x67Qpd7I2Cqxu750sdG61wEflV'
            }
        });

        if (profesorExistente) {
            console.log('Profesor ya existe:', profesorExistente);
        } else {
            // Crear un profesor de prueba
            return const profesor = await prisma.profesor.create({
                data: {
                    id: 'user_2x67Qpd7I2Cqxu750sdG61wEflV', // ID de Clerk
                    nombre: 'Santiago',
                    apellido: 'Serrano',
                    carreras: ['Ingeniería en Sistemas', 'Licenciatura en Nutrición'],
                    materias: ['Redes', 'Programación Estructurada']
                }
            });
        }

        // Listar todos los profesores
        const profesores = await prisma.profesor.findMany();
    } catch (error) {
        return console.error('Error:', error);
    } finally {
        return await prisma.$disconnect();
    }
}

main(); 