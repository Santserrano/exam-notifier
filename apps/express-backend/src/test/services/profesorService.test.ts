import { jest } from '@jest/globals';
import { PrismaClient, Profesor } from '@prisma/client';

import { ProfesorService } from '../../../src/service/profesorService';

// Mock de PrismaClient
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        profesor: {
            findMany: jest.fn(),
            findUnique: jest.fn()
        }
    }))
}));

// Mock del módulo prisma
jest.mock('../../../src/lib/prisma', () => ({
    prisma: new PrismaClient()
}));

describe('ProfesorService', () => {
    let profesorService: ProfesorService;
    let mockPrisma: jest.Mocked<PrismaClient>;

    beforeEach(() => {
        mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
        profesorService = new ProfesorService();
        jest.clearAllMocks();
    });

    describe('getAllProfesores', () => {
        it('should return all profesores', async () => {
            const mockProfesores = [
                {
                    id: '1',
                    nombre: 'Juan',
                    apellido: 'Pérez',
                    email: 'juan@example.com',
                    telefono: '123456789',
                    createdAt: new Date('2025-06-08T01:07:25.735Z'),
                    updatedAt: new Date('2025-06-08T01:07:25.735Z'),
                    carreras: [{ id: '1', nombre: 'Carrera 1' }],
                    materias: [{ id: '1', nombre: 'Materia 1', carreraId: '1' }]
                }
            ] as unknown as Profesor[];

            (mockPrisma.profesor.findMany as jest.Mock).mockResolvedValue(mockProfesores);

            const result = await profesorService.getAllProfesores();
            expect(result).toEqual(mockProfesores);
            expect(mockPrisma.profesor.findMany).toHaveBeenCalledWith({
                include: {
                    carreras: true,
                    materias: true
                }
            });
        });

        it('should throw error when getting profesores fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.profesor.findMany as jest.Mock).mockRejectedValue(error);

            await expect(profesorService.getAllProfesores()).rejects.toThrow('Error al obtener los profesores');
        });
    });

    describe('getProfesorById', () => {
        it('should return profesor by id', async () => {
            const mockProfesor = {
                id: '1',
                nombre: 'Juan',
                apellido: 'Pérez',
                email: 'juan@example.com',
                telefono: '123456789',
                createdAt: new Date('2025-06-08T01:07:25.764Z'),
                updatedAt: new Date('2025-06-08T01:07:25.764Z')
            } as unknown as Profesor;

            (mockPrisma.profesor.findUnique as jest.Mock).mockResolvedValue(mockProfesor);

            const result = await profesorService.getProfesorById('1');
            expect(result).toEqual(mockProfesor);
            expect(mockPrisma.profesor.findUnique).toHaveBeenCalledWith({
                where: { id: '1' }
            });
        });

        it('should throw error when getting profesor fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.profesor.findUnique as jest.Mock).mockRejectedValue(error);

            await expect(profesorService.getProfesorById('1')).rejects.toThrow('Error al obtener el profesor');
        });
    });

    describe('getProfesoresByCarrera', () => {
        it('should return profesores by carrera', async () => {
            const mockProfesores = [
                {
                    id: '1',
                    nombre: 'Juan',
                    apellido: 'Pérez',
                    email: 'juan@example.com',
                    telefono: '123456789',
                    createdAt: new Date('2025-06-08T01:07:25.768Z'),
                    updatedAt: new Date('2025-06-08T01:07:25.768Z'),
                    carreras: [{ id: '1', nombre: 'Carrera 1' }],
                    materias: [{ id: '1', nombre: 'Materia 1' }]
                }
            ] as unknown as Profesor[];

            (mockPrisma.profesor.findMany as jest.Mock).mockResolvedValue(mockProfesores);

            const result = await profesorService.getProfesoresByCarrera('1');
            expect(result).toEqual(mockProfesores);
            expect(mockPrisma.profesor.findMany).toHaveBeenCalledWith({
                where: {
                    carreras: {
                        some: {
                            id: '1'
                        }
                    }
                },
                include: {
                    carreras: true,
                    materias: true
                }
            });
        });

        it('should throw error when getting profesores by carrera fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.profesor.findMany as jest.Mock).mockRejectedValue(error);

            await expect(profesorService.getProfesoresByCarrera('1')).rejects.toThrow('Error al obtener los profesores por carrera');
        });
    });

    describe('getProfesoresByMateria', () => {
        it('should return profesores by materia', async () => {
            const mockProfesores = [
                {
                    id: '1',
                    nombre: 'Juan',
                    apellido: 'Pérez',
                    email: 'juan@example.com',
                    telefono: '123456789',
                    createdAt: new Date('2025-06-08T01:07:25.772Z'),
                    updatedAt: new Date('2025-06-08T01:07:25.772Z'),
                    carreras: [{ id: '1', nombre: 'Carrera 1' }],
                    materias: [{ id: '1', nombre: 'Materia 1' }]
                }
            ] as unknown as Profesor[];

            (mockPrisma.profesor.findMany as jest.Mock).mockResolvedValue(mockProfesores);

            const result = await profesorService.getProfesoresByMateria('1');
            expect(result).toEqual(mockProfesores);
            expect(mockPrisma.profesor.findMany).toHaveBeenCalledWith({
                where: {
                    materias: {
                        some: {
                            id: '1'
                        }
                    }
                },
                include: {
                    carreras: true,
                    materias: true
                }
            });
        });

        it('should throw error when getting profesores by materia fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.profesor.findMany as jest.Mock).mockRejectedValue(error);

            await expect(profesorService.getProfesoresByMateria('1')).rejects.toThrow('Error al obtener los profesores por materia');
        });
    });
}); 