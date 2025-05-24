import { PrismaClient, MesaDeExamen } from '@prisma/client';
import { sendPushToProfesor } from './SendPushNotification';
import { notificacionService } from './NotificationService';
import { enviarEmailNotificacion } from './emailService';
import { enviarWhatsapp } from './whatsappService';

export class MesaService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async getAllMesas(): Promise<MesaDeExamen[]> {
        try {
            return await this.prisma.mesaDeExamen.findMany({
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
            throw new Error('Error al obtener las mesas');
        }
    }

    async getMesasByProfesorId(profesorId: string): Promise<MesaDeExamen[]> {
        try {
            const mesas = await this.prisma.mesaDeExamen.findMany({
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
            throw new Error('Error al obtener las mesas del profesor');
        }
    }

    async getMesaById(id: number): Promise<MesaDeExamen | null> {
        try {
            return await this.prisma.mesaDeExamen.findUnique({
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

    async createMesa(mesaData: any): Promise<MesaDeExamen> {
        try {
            // Verificar que la materia existe
            const materia = await this.prisma.materia.findUnique({
                where: {
                    id: mesaData.materia
                }
            });

            if (!materia) {
                throw new Error('Materia no encontrada');
            }

            const nuevaMesa = await this.prisma.mesaDeExamen.create({
                data: {
                    profesorId: mesaData.profesor,
                    vocalId: mesaData.vocal,
                    carreraId: mesaData.carrera,
                    materiaId: mesaData.materia,
                    fecha: mesaData.fecha,
                    descripcion: mesaData.descripcion || 'Mesa de examen',
                    cargo: mesaData.cargo || 'Titular',
                    verification: mesaData.verification || true,
                    modalidad: mesaData.modalidad,
                    aula: mesaData.aula,
                    webexLink: mesaData.webexLink
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

            const config = await notificacionService.getConfigByProfesor(mesaData.profesor);
            if (config?.webPushEnabled) {
                const fechaFormateada = new Date(mesaData.fecha).toLocaleDateString();
                await sendPushToProfesor(
                    mesaData.profesor,
                    'Nueva mesa asignada',
                    `Se te asignó una mesa de ${nuevaMesa.materia.nombre} (${nuevaMesa.carrera.nombre}) para el ${fechaFormateada} en modalidad ${nuevaMesa.modalidad || 'Presencial'}`
                );
            }

            // Enviar notificación al vocal
            const configVocal = await notificacionService.getConfigByProfesor(mesaData.vocal);
            if (configVocal?.webPushEnabled) {
                const fechaFormateada = new Date(mesaData.fecha).toLocaleDateString();
                await sendPushToProfesor(
                    mesaData.vocal,
                    'Nueva mesa asignada',
                    `Se te asignó como vocal en una mesa de ${nuevaMesa.materia.nombre} (${nuevaMesa.carrera.nombre}) para el ${fechaFormateada} en modalidad ${nuevaMesa.modalidad || 'Presencial'}`
                );
            }

            const profesorData = await this.prisma.profesor.findUnique({ where: { id: mesaData.profesor } });
            if (profesorData) {
                const fechaObj = new Date(mesaData.fecha);
                const fechaFormateada = fechaObj.toLocaleDateString();
                const horaFormateada = fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const contenido = `Hola ${profesorData.nombre}, se te ha asignado una nueva mesa: ${nuevaMesa.materia.nombre} el ${fechaFormateada} a las ${horaFormateada}`;
                if (profesorData.email) {
                    await enviarEmailNotificacion(profesorData.email, contenido);
                }
                if (profesorData.telefono) {
                    await enviarWhatsapp(profesorData.telefono, contenido);
                }
            }

            return nuevaMesa;
        } catch (error) {
            throw new Error('Error al crear la mesa');
        }
    }

    async updateMesa(id: number, mesaData: any): Promise<MesaDeExamen | null> {
        try {
            // Verificar que la materia existe
            const materia = await this.prisma.materia.findUnique({
                where: {
                    id: mesaData.materia
                }
            });

            if (!materia) {
                throw new Error('Materia no encontrada');
            }

            return await this.prisma.mesaDeExamen.update({
                where: { id },
                data: {
                    profesorId: mesaData.profesor,
                    vocalId: mesaData.vocal,
                    carreraId: mesaData.carrera,
                    materiaId: mesaData.materia,
                    fecha: mesaData.fecha,
                    descripcion: mesaData.descripcion || 'Mesa de examen',
                    cargo: mesaData.cargo || 'Titular',
                    verification: mesaData.verification || true,
                    modalidad: mesaData.modalidad,
                    aula: mesaData.aula,
                    webexLink: mesaData.webexLink
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
        } catch (error) {
            throw new Error('Error al actualizar la mesa');
        }
    }

    async deleteMesa(id: number): Promise<MesaDeExamen | null> {
        try {
            return await this.prisma.mesaDeExamen.delete({
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
            throw new Error('Error al eliminar la mesa');
        }
    }
}

export const mesaService = new MesaService(); 