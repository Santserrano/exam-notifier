import { PrismaClient, Materia } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export class MateriaService {
    async getAllMaterias(): Promise<Materia[]> {
        try {
            return await prisma.materia.findMany({
                include: {
                    carrera: true,
                },
            });
        } catch (error) {
            console.error('Error al obtener materias:', error);
            throw error;
        }
    }

    async getMateriaById(id: string): Promise<Materia | null> {
        try {
            return await prisma.materia.findUnique({
                where: { id },
                include: {
                    carrera: true,
                },
            });
        } catch (error) {
            console.error('Error al obtener materia:', error);
            throw error;
        }
    }
} 