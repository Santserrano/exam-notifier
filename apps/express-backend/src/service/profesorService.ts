import { PrismaClient } from '@prisma/client';

interface Profesor {
    id: string;
    nombre: string;
    apellido: string;
    carreras: { id: string; nombre: string; }[];
    materias: { id: string; nombre: string; }[];
}

export class ProfesorService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async getAllProfesores(): Promise<Profesor[]> {
        try {
            console.log('Obteniendo profesores de la base de datos...');
            const profesores = await this.prisma.profesor.findMany({
                include: {
                    carreras: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    },
                    materias: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                }
            });
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
                where: { id },
                include: {
                    carreras: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    },
                    materias: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error al obtener profesor:', error);
            throw new Error('Error al obtener el profesor');
        }
    }

    async getProfesoresByCarrera(carreraId: string): Promise<Profesor[]> {
        try {
            return await this.prisma.profesor.findMany({
                where: {
                    carreras: {
                        some: {
                            id: carreraId
                        }
                    }
                },
                include: {
                    carreras: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    },
                    materias: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error al obtener profesores por carrera:', error);
            throw new Error('Error al obtener los profesores por carrera');
        }
    }

    async getProfesoresByMateria(materiaId: string): Promise<Profesor[]> {
        try {
            return await this.prisma.profesor.findMany({
                where: {
                    materias: {
                        some: {
                            id: materiaId
                        }
                    }
                },
                include: {
                    carreras: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    },
                    materias: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error al obtener profesores por materia:', error);
            throw new Error('Error al obtener los profesores por materia');
        }
    }
} 