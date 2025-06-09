import { Carrera } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

export class CarreraService {
  async getAllCarreras(): Promise<Carrera[]> {
    try {
      return await prisma.carrera.findMany({
        include: {
          materias: true,
        },
      });
    } catch (error) {
      console.error("Error al obtener carreras:", error);
      throw error;
    }
  }

  async getCarreraById(id: string): Promise<Carrera | null> {
    try {
      return await prisma.carrera.findUnique({
        where: { id },
        include: {
          materias: true,
        },
      });
    } catch (error) {
      console.error("Error al obtener carrera:", error);
      throw error;
    }
  }
}
