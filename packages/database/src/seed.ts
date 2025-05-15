import type { Prisma } from "@prisma/client";

import { prisma } from "./index.ts";

const DEFAULT_MESAS: Prisma.MesaDeExamenCreateInput[] = [
  {
    profesor: "Tim Apple",
    vocal: "Vocal Ejemplo",
    carrera: "Ingeniería",
    materia: "Matemáticas",
    fecha: new Date(),
    descripcion: "Mesa de ejemplo",
    cargo: "Profesor",
    verification: true,
    // createdAt se autogenera
  },
];

(async () => {
  try {
    await Promise.all(
      DEFAULT_MESAS.map((mesa) =>
        prisma.mesaDeExamen.create({
          data: mesa,
        })
      )
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
