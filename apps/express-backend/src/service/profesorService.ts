import { PrismaClient } from "@prisma/client";

interface Profesor {
  id: string;
  nombre: string;
  apellido: string;
  carreras: { id: string; nombre: string }[];
  materias: { id: string; nombre: string }[];
}

export class ProfesorService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllProfesores() {
    try {
      const profesores = await this.prisma.profesor.findMany({
        include: {
          carreras: {
            select: {
              id: true,
              nombre: true,
            },
          },
          materias: {
            select: {
              id: true,
              nombre: true,
              carreraId: true,
            },
          },
        },
      });
      return profesores;
    } catch (error) {
      throw new Error("Error al obtener los profesores");
    }
  }

  async getProfesorById(id: string) {
    try {
      const profesor = await this.prisma.profesor.findUnique({
        where: { id },
      });
      return profesor;
    } catch (error) {
      throw new Error("Error al obtener el profesor");
    }
  }

  async getProfesoresByCarrera(carreraId: string): Promise<Profesor[]> {
    try {
      return await this.prisma.profesor.findMany({
        where: {
          carreras: {
            some: {
              id: carreraId,
            },
          },
        },
        include: {
          carreras: {
            select: {
              id: true,
              nombre: true,
            },
          },
          materias: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error("Error al obtener los profesores por carrera");
    }
  }

  async getProfesoresByMateria(materiaId: string): Promise<Profesor[]> {
    try {
      return await this.prisma.profesor.findMany({
        where: {
          materias: {
            some: {
              id: materiaId,
            },
          },
        },
        include: {
          carreras: {
            select: {
              id: true,
              nombre: true,
            },
          },
          materias: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error("Error al obtener los profesores por materia");
    }
  }
}

export const profesorService = new ProfesorService();
