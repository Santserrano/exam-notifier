import { jest } from '@jest/globals';
import { MateriaService } from '../../../src/service/materiaService';
import { PrismaClient, Materia } from '@prisma/client';

// Mock de PrismaClient
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        materia: {
            findMany: jest.fn(),
            findUnique: jest.fn()
        }
    }))
}));

// Mock del módulo prisma
jest.mock('../../../src/lib/prisma', () => ({
    prisma: new PrismaClient()
}));

describe('MateriaService', () => {
    let materiaService: MateriaService;
    let mockPrisma: jest.Mocked<PrismaClient>;

    beforeEach(() => {
        mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
        materiaService = new MateriaService();
        jest.clearAllMocks();
    });

    describe('getAllMaterias', () => {
        it('should return all materias', async () => {
            const mockMaterias = [
                {
                    id: '1',
                    nombre: 'Materia 1',
                    carreraId: '1',
                    createdAt: new Date('2025-06-08T01:07:25.735Z'),
                    updatedAt: new Date('2025-06-08T01:07:25.735Z')
                }
            ] as unknown as Materia[];

            (mockPrisma.materia.findMany as jest.Mock).mockResolvedValue(mockMaterias);

            const result = await materiaService.getAllMaterias();
            expect(result).toEqual(mockMaterias);
            expect(mockPrisma.materia.findMany).toHaveBeenCalled();
        });

        it('should throw error when getting materias fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.materia.findMany as jest.Mock).mockRejectedValue(error);

            await expect(materiaService.getAllMaterias()).rejects.toThrow('Error al obtener las materias');
        });
    });

    describe('getMateriaById', () => {
        it('should return materia by id', async () => {
            const mockMateria = {
                id: '1',
                nombre: 'Materia 1',
                carreraId: '1',
                createdAt: new Date('2025-06-08T01:07:25.764Z'),
                updatedAt: new Date('2025-06-08T01:07:25.764Z')
            } as unknown as Materia;

            (mockPrisma.materia.findUnique as jest.Mock).mockResolvedValue(mockMateria);

            const result = await materiaService.getMateriaById('1');
            expect(result).toEqual(mockMateria);
            expect(mockPrisma.materia.findUnique).toHaveBeenCalledWith({
                where: { id: '1' }
            });
        });

        it('should throw error when getting materia fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.materia.findUnique as jest.Mock).mockRejectedValue(error);

            await expect(materiaService.getMateriaById('1')).rejects.toThrow('Error al obtener la materia');
        });
    });

    describe('getMateriasByCarrera', () => {
        it('should return materias by carrera', async () => {
            const mockMaterias = [
                {
                    id: '1',
                    nombre: 'Materia 1',
                    carreraId: '1',
                    createdAt: new Date('2025-06-08T01:07:25.768Z'),
                    updatedAt: new Date('2025-06-08T01:07:25.768Z')
                }
            ] as unknown as Materia[];

            (mockPrisma.materia.findMany as jest.Mock).mockResolvedValue(mockMaterias);

            const result = await materiaService.getMateriasByCarrera('1');
            expect(result).toEqual(mockMaterias);
            expect(mockPrisma.materia.findMany).toHaveBeenCalledWith({
                where: { carreraId: '1' }
            });
        });

        it('should throw error when getting materias by carrera fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.materia.findMany as jest.Mock).mockRejectedValue(error);

            await expect(materiaService.getMateriasByCarrera('1')).rejects.toThrow('Error al obtener las materias por carrera');
        });
    });
}); 