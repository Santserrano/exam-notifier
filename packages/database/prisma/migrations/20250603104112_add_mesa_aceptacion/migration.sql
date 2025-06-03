-- CreateEnum
CREATE TYPE "EstadoAceptacion" AS ENUM ('PENDIENTE', 'ACEPTADA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "MesaAceptacion" (
    "id" TEXT NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "profesorId" TEXT NOT NULL,
    "estado" "EstadoAceptacion" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MesaAceptacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MesaAceptacion_mesaId_profesorId_key" ON "MesaAceptacion"("mesaId", "profesorId");

-- AddForeignKey
ALTER TABLE "MesaAceptacion" ADD CONSTRAINT "MesaAceptacion_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "MesaDeExamen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesaAceptacion" ADD CONSTRAINT "MesaAceptacion_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Profesor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
