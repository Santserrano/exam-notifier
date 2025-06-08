import { jest } from '@jest/globals';
import { MateriaService } from '../../../src/service/materiaService';
import { Materia } from '@prisma/client';

// Mock del módulo prisma usando requireActual
jest.mock('../../../src/lib/prisma', () => {
    return {
        prisma: {
            materia: {
                findMany: jest.fn(),
                findUnique: jest.fn()
            }
        }
    };
});

describe('MateriaService', () => {
    let materiaService: MateriaService;
    // Importa el mock real que usa la clase
    const { prisma } = require('../../../src/lib/prisma');

    beforeEach(() => {
        materiaService = new MateriaService();
        jest.clearAllMocks();
    });

    describe('getAllMaterias', () => {
        it('should return all materias', async () => {
            const mockMaterias: Materia[] = [
                {
                    id: '1',
                    nombre: 'Materia 1',
                    carreraId: '1',
                    createdAt: new Date('2025-06-08T01:07:25.735Z'),
                    updatedAt: new Date('2025-06-08T01:07:25.735Z')
                } as Materia
            ];

            prisma.materia.findMany.mockResolvedValue(mockMaterias);

            const result = await materiaService.getAllMaterias();
            expect(result).toEqual(mockMaterias);
            expect(prisma.materia.findMany).toHaveBeenCalled();
        });

        it('should throw error when getting materias fails', async () => {
            const error = new Error('Database error');
            prisma.materia.findMany.mockRejectedValue(error);

            await expect(materiaService.getAllMaterias()).rejects.toThrow();
        });
    });

    describe('getMateriaById', () => {
        it('should return materia by id', async () => {
            const mockMateria: Materia = {
                id: '1',
                nombre: 'Materia 1',
                carreraId: '1',
                createdAt: new Date('2025-06-08T01:07:25.764Z'),
                updatedAt: new Date('2025-06-08T01:07:25.764Z')
            } as Materia;

            prisma.materia.findUnique.mockResolvedValue(mockMateria);

            const result = await materiaService.getMateriaById('1');
            expect(result).toEqual(mockMateria);
            expect(prisma.materia.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                include: { carrera: true }
            });
        });

        it('should throw error when getting materia fails', async () => {
            const error = new Error('Database error');
            prisma.materia.findUnique.mockRejectedValue(error);

            await expect(materiaService.getMateriaById('1')).rejects.toThrow();
        });
    });
});