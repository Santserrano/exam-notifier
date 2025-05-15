/*
  Warnings:

  - Added the required column `updatedAt` to the `MesaDeExamen` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MesaDeExamen" ADD COLUMN     "modalidad" TEXT DEFAULT 'Presencial',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "verification" SET DEFAULT false;
