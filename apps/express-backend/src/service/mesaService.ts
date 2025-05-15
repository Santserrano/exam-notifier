import { PrismaClient, MesaDeExamen, Profesor } from '@prisma/client';

// Singleton para el cliente Prisma
const prisma = new PrismaClient();

export class MesaService {
    async getAllMesas(): Promise<MesaDeExamen[]> {
        try {
            return await prisma.mesaDeExamen.findMany({
                include: {
                    profesor: true,
                    vocal: true
                }
            });
        } catch (error) {
            console.error('Error al obtener todas las mesas:', error);
            throw new Error('Error al obtener las mesas');
        }
    }

    async getMesasByProfesorId(profesorId: string): Promise<MesaDeExamen[]> {
        try {
            return await prisma.mesaDeExamen.findMany({
                where: {
                    OR: [
                        { profesorId },
                        { vocalId: profesorId }
                    ]
                },
                include: {
                    profesor: true,
                    vocal: true
                }
            });
        } catch (error) {
            console.error(`Error al obtener mesas del profesor ${profesorId}:`, error);
            throw new Error('Error al obtener las mesas del profesor');
        }
    }

    async getMesaById(id: number): Promise<MesaDeExamen | null> {
        try {
            return await prisma.mesaDeExamen.findUnique({
                where: { id },
                include: {
                    profesor: true,
                    vocal: true
                }
            });
        } catch (error) {
            console.error(`Error al obtener mesa con id ${id}:`, error);
            throw new Error('Error al obtener la mesa');
        }
    }

    async createMesa(data: Omit<MesaDeExamen, "id" | "createdAt" | "updatedAt">): Promise<MesaDeExamen> {
        try {
            // Extraer los IDs y el resto de los datos
            const { profesor, vocal, ...rest } = data as any;
            return await prisma.mesaDeExamen.create({
                data: {
                    ...rest,
                    profesor: { connect: { id: profesor } },
                    vocal: { connect: { id: vocal } }
                },
                include: {
                    profesor: true,
                    vocal: true
                }
            });
        } catch (error) {
            console.error('Error al crear mesa:', error);
            throw new Error('Error al crear la mesa');
        }
    }

    async updateMesa(id: number, data: Partial<MesaDeExamen>): Promise<MesaDeExamen | null> {
        try {
            return await prisma.mesaDeExamen.update({
                where: { id },
                data,
                include: {
                    profesor: true,
                    vocal: true
                }
            });
        } catch (error) {
            console.error(`Error al actualizar mesa con id ${id}:`, error);
            throw new Error('Error al actualizar la mesa');
        }
    }

    async deleteMesa(id: number): Promise<MesaDeExamen | null> {
        try {
            return await prisma.mesaDeExamen.delete({
                where: { id },
                include: {
                    profesor: true,
                    vocal: true
                }
            });
        } catch (error) {
            console.error(`Error al eliminar mesa con id ${id}:`, error);
            throw new Error('Error al eliminar la mesa');
        }
    }
}

export const mesaService = new MesaService(); 