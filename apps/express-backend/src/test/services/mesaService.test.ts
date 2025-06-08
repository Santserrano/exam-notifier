// Minimal MesaDeExamen type for testing
type MesaDeExamen = { 
    id: number; 
    nombre: string; 
    fecha: Date; 
    hora: string; 
    lugar: string; 
    materiaId: string; 
    createdAt: Date; 
    updatedAt: Date; 
};

// Mock global de prisma
jest.mock('../../lib/prisma', () => ({
    prisma: {
        mesaDeExamen: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        profesor: {
            findUnique: jest.fn(),
        },
        carrera: {
            findUnique: jest.fn(),
        },
        materia: {
            findUnique: jest.fn(),
        },
    },
}));

// Mock de notificacionService
jest.mock('../../../src/service/NotificationService', () => ({
    notificacionService: {
        getConfigByProfesor: jest.fn()
    }
}));

import { mesaService } from '../../service/mesaService';
const { prisma } = require('../../lib/prisma');

// No need to instantiate mesaService if it's already an instance
beforeEach(() => {
    jest.clearAllMocks();
});

describe('getMesasByProfesorId', () => {
    it('should return mesas for given profesorId', async () => {
        const mockMesas = [
            {
                id: 1,
                nombre: 'Mesa 1',
                profesorId: 'prof1',
                vocalId: 'prof2',
                fecha: new Date(),
                hora: '10:00',
                lugar: 'Aula 1',
                materiaId: '1',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ] as unknown as MesaDeExamen[];

        (prisma.mesaDeExamen.findMany as jest.Mock).mockResolvedValue(mockMesas);

        const result = await mesaService.getMesasByProfesorId('prof1');
        expect(result).toEqual(mockMesas);
        expect(prisma.mesaDeExamen.findMany).toHaveBeenCalledWith({
            where: {
                OR: [
                    { profesorId: 'prof1' },
                    { vocalId: 'prof1' }
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
    });

    it('should throw error when getting mesas by profesor fails', async () => {
        const error = new Error('Database error');
        (prisma.mesaDeExamen.findMany as jest.Mock).mockRejectedValue(error);

        await expect(mesaService.getMesasByProfesorId('prof1')).rejects.toThrow('Error al obtener las mesas del profesor');
    });
});

describe('createMesa - validation', () => {
    it('should return error if required fields are missing', async () => {
        const result = await mesaService.createMesa({
            profesor: '',
            vocal: '',
            carrera: '',
            materia: '',
            fecha: ''
        });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Faltan datos requeridos');
    });
});

describe('createMesa - profesor/vocal/carrera/materia validation', () => {
    beforeEach(() => {
        (prisma.profesor.findUnique as jest.Mock).mockReset();
        (prisma.carrera.findUnique as jest.Mock).mockReset();
        (prisma.materia.findUnique as jest.Mock).mockReset();
    });

    it('should return error if profesor not found', async () => {
        (prisma.profesor.findUnique as jest.Mock).mockResolvedValue(null);

        const result = await mesaService.createMesa({
            profesor: 'prof1',
            vocal: 'prof2',
            carrera: 'car1',
            materia: 'mat1',
            fecha: '2025-06-08T01:07:25.772Z'
        });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Profesor no encontrado');
    });

    it('should return error if vocal not found', async () => {
        (prisma.profesor.findUnique as jest.Mock)
            .mockResolvedValueOnce({ id: 'prof1' }) // profesor
            .mockResolvedValueOnce(null); // vocal

        const result = await mesaService.createMesa({
            profesor: 'prof1',
            vocal: 'prof2',
            carrera: 'car1',
            materia: 'mat1',
            fecha: '2025-06-08T01:07:25.772Z'
        });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Vocal no encontrado');
    });

    it('should return error if carrera not found', async () => {
        (prisma.profesor.findUnique as jest.Mock)
            .mockResolvedValueOnce({ id: 'prof1' }) // profesor
            .mockResolvedValueOnce({ id: 'prof2' }); // vocal
        (prisma.carrera.findUnique as jest.Mock).mockResolvedValue(null);

        const result = await mesaService.createMesa({
            profesor: 'prof1',
            vocal: 'prof2',
            carrera: 'car1',
            materia: 'mat1',
            fecha: '2025-06-08T01:07:25.772Z'
        });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Carrera no encontrada');
    });

    it('should return error if materia not found', async () => {
        (prisma.profesor.findUnique as jest.Mock)
            .mockResolvedValueOnce({ id: 'prof1' }) // profesor
            .mockResolvedValueOnce({ id: 'prof2' }); // vocal
        (prisma.carrera.findUnique as jest.Mock).mockResolvedValue({ id: 'car1' });
        (prisma.materia.findUnique as jest.Mock).mockResolvedValue(null);

        const result = await mesaService.createMesa({
            profesor: 'prof1',
            vocal: 'prof2',
            carrera: 'car1',
            materia: 'mat1',
            fecha: '2025-06-08T01:07:25.772Z'
        });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Materia no encontrada');
    });
});

describe('MesaService', () => {
    describe('getAllMesas', () => {
        it('should return all mesas', async () => {
            const mockMesas = [
                {
                    id: 1,
                    nombre: 'Mesa 1',
                    fecha: new Date('2025-06-08T01:07:25.735Z'),
                    hora: '10:00',
                    lugar: 'Aula 1',
                    materiaId: '1',
                    createdAt: new Date('2025-06-08T01:07:25.735Z'),
                    updatedAt: new Date('2025-06-08T01:07:25.735Z')
                }
            ] as unknown as MesaDeExamen[];

            (prisma.mesaDeExamen.findMany as jest.Mock).mockResolvedValue(mockMesas);

            const result = await mesaService.getAllMesas();
            expect(result).toEqual(mockMesas);
            expect(prisma.mesaDeExamen.findMany).toHaveBeenCalled();
        });

        it('should throw error when getting mesas fails', async () => {
            const error = new Error('Database error');
            (prisma.mesaDeExamen.findMany as jest.Mock).mockRejectedValue(error);

            await expect(mesaService.getAllMesas()).rejects.toThrow('Error al obtener las mesas');
        });
    });

    describe('getMesaById', () => {
        it('should return mesa by id', async () => {
            const mockMesa = {
                id: 1,
                nombre: 'Mesa 1',
                fecha: new Date('2025-06-08T01:07:25.764Z'),
                hora: '10:00',
                lugar: 'Aula 1',
                materiaId: '1',
                createdAt: new Date('2025-06-08T01:07:25.764Z'),
                updatedAt: new Date('2025-06-08T01:07:25.764Z')
            } as unknown as MesaDeExamen;

            (prisma.mesaDeExamen.findUnique as jest.Mock).mockResolvedValue(mockMesa);

            const result = await mesaService.getMesaById(1);
            expect(result).toEqual(mockMesa);
            expect(prisma.mesaDeExamen.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
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
        });

        it('should throw error when getting mesa fails', async () => {
            const error = new Error('Database error');
            (prisma.mesaDeExamen.findUnique as jest.Mock).mockRejectedValue(error);

            await expect(mesaService.getMesaById(1)).rejects.toThrow();
        });
    });

    // Puedes agregar aquí los tests para getMesasByMateria, createMesa, updateMesa, deleteMesa
});