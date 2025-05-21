/*
  Warnings:

  - You are about to drop the column `carrera` on the `MesaDeExamen` table. All the data in the column will be lost.
  - You are about to drop the column `materia` on the `MesaDeExamen` table. All the data in the column will be lost.
  - You are about to drop the column `carreras` on the `Profesor` table. All the data in the column will be lost.
  - You are about to drop the column `materias` on the `Profesor` table. All the data in the column will be lost.
  - Added the required column `carreraId` to the `MesaDeExamen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `materiaId` to the `MesaDeExamen` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MesaDeExamen" DROP COLUMN "carrera",
DROP COLUMN "materia",
ADD COLUMN     "carreraId" TEXT NOT NULL,
ADD COLUMN     "materiaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Profesor" DROP COLUMN "carreras",
DROP COLUMN "materias";

-- CreateTable
CREATE TABLE "Carrera" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Carrera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Materia" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "carreraId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Materia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CarreraToProfesor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_MateriaToProfesor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Carrera_nombre_key" ON "Carrera"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Materia_nombre_carreraId_key" ON "Materia"("nombre", "carreraId");

-- CreateIndex
CREATE UNIQUE INDEX "_CarreraToProfesor_AB_unique" ON "_CarreraToProfesor"("A", "B");

-- CreateIndex
CREATE INDEX "_CarreraToProfesor_B_index" ON "_CarreraToProfesor"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MateriaToProfesor_AB_unique" ON "_MateriaToProfesor"("A", "B");

-- CreateIndex
CREATE INDEX "_MateriaToProfesor_B_index" ON "_MateriaToProfesor"("B");

-- AddForeignKey
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesaDeExamen" ADD CONSTRAINT "MesaDeExamen_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesaDeExamen" ADD CONSTRAINT "MesaDeExamen_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarreraToProfesor" ADD CONSTRAINT "_CarreraToProfesor_A_fkey" FOREIGN KEY ("A") REFERENCES "Carrera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarreraToProfesor" ADD CONSTRAINT "_CarreraToProfesor_B_fkey" FOREIGN KEY ("B") REFERENCES "Profesor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MateriaToProfesor" ADD CONSTRAINT "_MateriaToProfesor_A_fkey" FOREIGN KEY ("A") REFERENCES "Materia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MateriaToProfesor" ADD CONSTRAINT "_MateriaToProfesor_B_fkey" FOREIGN KEY ("B") REFERENCES "Profesor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
