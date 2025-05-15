/*
  Warnings:

  - You are about to drop the column `profesor` on the `MesaDeExamen` table. All the data in the column will be lost.
  - You are about to drop the column `vocal` on the `MesaDeExamen` table. All the data in the column will be lost.
  - Added the required column `profesorId` to the `MesaDeExamen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vocalId` to the `MesaDeExamen` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MesaDeExamen" DROP COLUMN "profesor",
DROP COLUMN "vocal",
ADD COLUMN     "profesorId" TEXT NOT NULL,
ADD COLUMN     "vocalId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Profesor" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "carreras" TEXT[],
    "materias" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profesor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MesaDeExamen" ADD CONSTRAINT "MesaDeExamen_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Profesor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesaDeExamen" ADD CONSTRAINT "MesaDeExamen_vocalId_fkey" FOREIGN KEY ("vocalId") REFERENCES "Profesor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
