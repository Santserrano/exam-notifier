import { PrismaClient } from '@prisma/client';

interface Profesor {
    id: string;
    nombre: string;
    apellido: string;
    carreras: string[];
    materias: string[];
}

export class ProfesorService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async getAllProfesores(): Promise<Profesor[]> {
        try {
            console.log('Obteniendo profesores de la base de datos...');
            const profesores = await this.prisma.profesor.findMany();
            console.log('Profesores encontrados:', profesores);
            return profesores;
        } catch (error) {
            console.error('Error al obtener profesores:', error);
            throw new Error('Error al obtener los profesores');
        }
    }

    async getProfesorById(id: string): Promise<Profesor | null> {
        try {
            return await this.prisma.profesor.findUnique({
                where: { id }
            });
        } catch (error) {
            console.error('Error al obtener profesor:', error);
            throw new Error('Error al obtener el profesor');
        }
    }
} 