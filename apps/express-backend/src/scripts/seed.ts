import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // Verificar si el profesor existe
        const profesorExistente = await prisma.profesor.findUnique({
            where: {
                id: 'user_2x67Qpd7I2Cqxu750sdG61wEflV'
            }
        });

        if (profesorExistente) {
            console.log('Profesor ya existe:', profesorExistente);
        } else {
            // Crear un profesor de prueba
            const profesor = await prisma.profesor.create({
                data: {
                    id: 'user_2x67Qpd7I2Cqxu750sdG61wEflV', // ID de Clerk
                    nombre: 'Santiago',
                    apellido: 'Serrano',
                    carreras: ['Ingeniería en Sistemas', 'Licenciatura en Nutrición'],
                    materias: ['Redes', 'Programación Estructurada']
                }
            });
            console.log('Profesor creado:', profesor);
        }

        // Listar todos los profesores
        const profesores = await prisma.profesor.findMany();
        console.log('Todos los profesores:', profesores);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main(); 