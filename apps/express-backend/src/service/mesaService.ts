import { MesaDeExamen, Prisma, Profesor, Carrera, Materia } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { notificationFactory } from '../core/notifications/NotificationFactory.js';
import { notificacionService } from './NotificationService.js';

type MesaCreateInput = {
    profesor: string;
    vocal: string;
    carrera: string;
    materia: string;
    fecha: string;
    descripcion?: string;
    cargo?: string;
    verification?: boolean;
    modalidad?: string;
    aula?: string;
    webexLink?: string;
};

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

interface MesaResponse {
    success: boolean;
    data?: MesaWithRelations;
    error?: string;
}

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

    async createMesa(data: MesaCreateInput): Promise<MesaResponse> {
        try {
            console.log("Datos recibidos en createMesa:", data);

            // Validar datos requeridos
            if (!data.profesor || !data.vocal || !data.carrera || !data.materia || !data.fecha) {
                throw new Error("Faltan datos requeridos");
            }

            // Verificar que el profesor existe
            const profesor = await prisma.profesor.findUnique({
                where: { id: data.profesor },
            });
            if (!profesor) {
                throw new Error("Profesor no encontrado");
            }

            // Verificar que el vocal existe
            const vocal = await prisma.profesor.findUnique({
                where: { id: data.vocal },
            });
            if (!vocal) {
                throw new Error("Vocal no encontrado");
            }

            // Verificar que la carrera existe
            const carrera = await prisma.carrera.findUnique({
                where: { id: data.carrera },
            });
            if (!carrera) {
                throw new Error("Carrera no encontrada");
            }

            // Verificar que la materia existe
            const materia = await prisma.materia.findUnique({
                where: { id: data.materia },
                include: { carrera: true },
            });
            if (!materia) {
                throw new Error("Materia no encontrada");
            }

            console.log("Creando nueva mesa de examen...");
            const mesa = await prisma.mesaDeExamen.create({
                data: {
                    profesor: { connect: { id: data.profesor } },
                    vocal: { connect: { id: data.vocal } },
                    carrera: { connect: { id: data.carrera } },
                    materia: { connect: { id: data.materia } },
                    fecha: new Date(data.fecha),
                    descripcion: data.descripcion || "Mesa de examen",
                    cargo: data.cargo || "Titular",
                    verification: data.verification ?? false,
                    modalidad: data.modalidad || "Presencial",
                    aula: data.modalidad === "Presencial" ? data.aula : undefined,
                    webexLink: data.modalidad === "Virtual" ? data.webexLink : undefined,
                },
                include: {
                    profesor: true,
                    vocal: true,
                    materia: {
                        include: {
                            carrera: true,
                        },
                    },
                    carrera: true,
                },
            });

            console.log("Mesa creada exitosamente:", mesa);

            return {
                success: true,
                data: mesa,
            };
        } catch (error) {
            console.error("Error al crear mesa:", error);
            throw error;
        }
    }

    async updateMesa(id: number, data: Partial<MesaCreateInput>): Promise<MesaResponse> {
        try {
            const mesaActualizada = await prisma.mesaDeExamen.update({
                where: { id },
                data: {
                    profesorId: data.profesor,
                    vocalId: data.vocal,
                    carreraId: data.carrera,
                    materiaId: data.materia,
                    fecha: data.fecha ? new Date(data.fecha) : undefined,
                    descripcion: data.descripcion,
                    cargo: data.cargo,
                    verification: data.verification,
                    modalidad: data.modalidad,
                    aula: data.modalidad === "Presencial" ? data.aula : undefined,
                    webexLink: data.modalidad === "Virtual" ? data.webexLink : undefined,
                },
                include: {
                    profesor: true,
                    vocal: true,
                    materia: {
                        include: {
                            carrera: true,
                        },
                    },
                    carrera: true,
                },
            });

            return {
                success: true,
                data: mesaActualizada,
            };
        } catch (error) {
            console.error("Error al actualizar mesa:", error);
            throw error;
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