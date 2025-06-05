import { MesaDeExamen, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { notificationFactory } from '../core/notifications/NotificationFactory.js';
import { notificacionService } from './NotificationService.js';

interface MesaData {
    id: number;
    profesor: string;
    vocal: string;
    carrera: string;
    materia: string;
    fecha: Date;
    descripcion: string;
    cargo: string;
    verification: number;
    createdAt: Date;
    modalidad?: string | null;
    aula?: string | null;
    webexLink?: string | null;
}

interface MesaResponse {
    success: boolean;
    data?: Omit<MesaData, 'verification'> & { verification: boolean };
    error?: string;
}

type MesaWithRelations = Prisma.MesaDeExamenGetPayload<{
    include: {
        profesor: true;
        vocal: true;
        materia: {
            include: {
                carrera: true;
            };
        };
        carrera: true;
    };
}>;

class MesaService {
    async getAllMesas(): Promise<MesaWithRelations[]> {
        try {
            const mesas = await prisma.mesaDeExamen.findMany({
                include: {
                    profesor: true,
                    vocal: true,
                    materia: {
                        include: {
                            carrera: true
                        }
                    },
                    carrera: true
                }
            });
            return mesas;
        } catch (error) {
            console.error('Error en getAllMesas:', error);
            throw new Error('Error al obtener las mesas');
        }
    }

    async getMesasByProfesorId(profesorId: string): Promise<MesaDeExamen[]> {
        try {
            const mesas = await prisma.mesaDeExamen.findMany({
                where: {
                    OR: [
                        { profesorId },
                        { vocalId: profesorId }
                    ]
                },
                include: {
                    profesor: true,
                    vocal: true,
                    materia: {
                        include: {
                            carrera: true
                        }
                    },
                    carrera: true
                }
            });
            return mesas;
        } catch (error) {
            console.error('Error en getMesasByProfesorId:', error);
            throw new Error('Error al obtener las mesas del profesor');
        }
    }

    async getMesaById(id: number): Promise<MesaDeExamen | null> {
        try {
            return await prisma.mesaDeExamen.findUnique({
                where: { id },
                include: {
                    profesor: true,
                    vocal: true,
                    materia: {
                        include: {
                            carrera: true
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error('Error al obtener la mesa');
        }
    }

    async createMesa(data: Omit<MesaData, 'id' | 'createdAt'>): Promise<MesaResponse> {
        try {
            console.log('Datos recibidos en createMesa:', data);

            // Validar datos requeridos
            if (!data.profesor || !data.vocal || !data.carrera || !data.materia || !data.fecha) {
                throw new Error('Faltan datos requeridos');
            }

            // Verificar que la materia existe
            const materia = await prisma.materia.findUnique({
                where: {
                    id: data.materia
                }
            });

            if (!materia) {
                throw new Error('Materia no encontrada');
            }

            // Verificar que los profesores existen
            const [profesor, vocal] = await Promise.all([
                prisma.profesor.findUnique({ where: { id: data.profesor } }),
                prisma.profesor.findUnique({ where: { id: data.vocal } })
            ]);

            if (!profesor || !vocal) {
                throw new Error('Uno o ambos profesores no existen');
            }

            // Verificar que la carrera existe
            const carrera = await prisma.carrera.findUnique({
                where: { id: data.carrera }
            });

            if (!carrera) {
                throw new Error('Carrera no encontrada');
            }

            console.log('Creando nueva mesa con datos:', {
                profesorId: data.profesor,
                vocalId: data.vocal,
                carreraId: data.carrera,
                materiaId: data.materia,
                fecha: new Date(data.fecha),
                descripcion: data.descripcion || 'Mesa de examen',
                cargo: data.cargo || 'Titular',
                verification: 1,
                modalidad: data.modalidad,
                aula: data.aula,
                webexLink: data.webexLink
            });

            const nuevaMesa = await prisma.mesaDeExamen.create({
                data: {
                    profesorId: data.profesor,
                    vocalId: data.vocal,
                    carreraId: data.carrera,
                    materiaId: data.materia,
                    fecha: new Date(data.fecha),
                    descripcion: data.descripcion || 'Mesa de examen',
                    cargo: data.cargo || 'Titular',
                    verification: 1,
                    modalidad: data.modalidad,
                    aula: data.aula,
                    webexLink: data.webexLink
                },
                include: {
                    profesor: true,
                    vocal: true,
                    materia: {
                        include: {
                            carrera: true
                        }
                    },
                    carrera: true
                }
            });

            console.log('Mesa creada exitosamente:', nuevaMesa);

            return {
                success: true,
                data: {
                    id: nuevaMesa.id,
                    profesor: nuevaMesa.profesorId,
                    vocal: nuevaMesa.vocalId,
                    carrera: nuevaMesa.carreraId,
                    materia: nuevaMesa.materiaId,
                    fecha: nuevaMesa.fecha,
                    descripcion: nuevaMesa.descripcion,
                    cargo: nuevaMesa.cargo,
                    verification: nuevaMesa.verification === 1,
                    createdAt: nuevaMesa.createdAt,
                    modalidad: nuevaMesa.modalidad,
                    aula: nuevaMesa.aula,
                    webexLink: nuevaMesa.webexLink
                }
            };
        } catch (error) {
            console.error('Error en createMesa:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error al crear la mesa'
            };
        }
    }

    async updateMesa(id: number, data: Partial<MesaData>): Promise<MesaResponse> {
        try {
            const mesaActualizada = await prisma.mesaDeExamen.update({
                where: { id },
                data: {
                    profesorId: data.profesor,
                    vocalId: data.vocal,
                    carreraId: data.carrera,
                    materiaId: data.materia,
                    fecha: data.fecha,
                    descripcion: data.descripcion,
                    cargo: data.cargo,
                    verification: data.verification,
                    modalidad: data.modalidad,
                    aula: data.aula,
                    webexLink: data.webexLink
                },
                include: {
                    profesor: true,
                    vocal: true,
                    materia: {
                        include: {
                            carrera: true
                        }
                    },
                    carrera: true
                }
            });

            return {
                success: true,
                data: {
                    id: mesaActualizada.id,
                    profesor: mesaActualizada.profesorId,
                    vocal: mesaActualizada.vocalId,
                    carrera: mesaActualizada.carreraId,
                    materia: mesaActualizada.materiaId,
                    fecha: mesaActualizada.fecha,
                    descripcion: mesaActualizada.descripcion,
                    cargo: mesaActualizada.cargo,
                    verification: mesaActualizada.verification,
                    createdAt: mesaActualizada.createdAt,
                    modalidad: mesaActualizada.modalidad,
                    aula: mesaActualizada.aula,
                    webexLink: mesaActualizada.webexLink
                }
            };
        } catch (error) {
            console.error('Error en updateMesa:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error al actualizar la mesa'
            };
        }
    }

    async deleteMesa(id: number): Promise<MesaDeExamen | null> {
        try {
            return await prisma.mesaDeExamen.delete({
                where: { id }
            });
        } catch (error) {
            console.error('Error en deleteMesa:', error);
            throw new Error('Error al eliminar la mesa');
        }
    }
}

export const mesaService = new MesaService(); 