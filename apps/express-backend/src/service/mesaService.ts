import { PrismaClient, MesaDeExamen } from '@prisma/client';
import { MesaAdapter } from '../Adapters/MasaAdapter';

const prisma = new PrismaClient();

interface MesaCreateInput {
    profesor: string;
    vocal: string;
    carrera: string;
    materia: string;
    fecha: string;
    horaTexto?: string;
    descripcion?: string;
    cargo?: string;
    verification?: boolean;
    modalidad?: string;
    aula?: string;
    webexLink?: string;
}

type MesaWithRelations = MesaDeExamen & {
    profesor: {
        id: string;
        nombre: string;
        apellido: string;
        email: string;
        telefono: string | null;
    };
    vocal: {
        id: string;
        nombre: string;
        apellido: string;
        email: string;
        telefono: string | null;
    };
    materia: {
        id: string;
        nombre: string;
    };
    carrera: {
        id: string;
        nombre: string;
    };
};

type MesaDTO = ReturnType<typeof MesaAdapter.toDTO>;

interface MesaResponse {
    success: boolean;
    data?: MesaWithRelations;
    error?: string;
}

class MesaService {
    async getAllMesas(): Promise<MesaDTO[]> {
        const mesas = await prisma.mesaDeExamen.findMany({
            include: {
                profesor: true,
                vocal: true,
                materia: true,
                carrera: true
            }
        });
        return mesas.map(mesa => MesaAdapter.toDTO(mesa));
    }

    async getMesaById(id: number): Promise<MesaDTO | null> {
        const mesa = await prisma.mesaDeExamen.findUnique({
            where: { id },
            include: {
                profesor: true,
                vocal: true,
                materia: true,
                carrera: true
            }
        });
        return mesa ? MesaAdapter.toDTO(mesa) : null;
    }

    async getMesasByProfesorId(profesorId: string): Promise<MesaDTO[]> {
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
                materia: true,
                carrera: true
            }
        });
        return mesas.map(mesa => MesaAdapter.toDTO(mesa));
    }

    async createMesa(data: Omit<MesaDeExamen, 'id' | 'createdAt' | 'updatedAt'>): Promise<MesaDTO> {
        const mesa = await prisma.mesaDeExamen.create({
            data,
            include: {
                profesor: true,
                vocal: true,
                materia: true,
                carrera: true
            }
        });
        return MesaAdapter.toDTO(mesa);
    }

    async updateMesa(id: number, data: Partial<MesaDeExamen>): Promise<MesaDTO> {
        const mesa = await prisma.mesaDeExamen.update({
            where: { id },
            data,
            include: {
                profesor: true,
                vocal: true,
                materia: true,
                carrera: true
            }
        });
        return MesaAdapter.toDTO(mesa);
    }

    async deleteMesa(id: number): Promise<void> {
        await prisma.mesaDeExamen.delete({
            where: { id }
        });
    }
}

export const mesaService = new MesaService();
export type { MesaCreateInput, MesaResponse, MesaWithRelations };
export { MesaService }; 