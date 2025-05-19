-- AlterTable
ALTER TABLE "MesaDeExamen" ADD COLUMN     "aula" TEXT,
ADD COLUMN     "webexLink" TEXT;

-- CreateTable
CREATE TABLE "Alumno" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "carrera" TEXT NOT NULL,
    "dni" TEXT NOT NULL,

    CONSTRAINT "Alumno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AlumnosEnMesa" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Alumno_dni_key" ON "Alumno"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "_AlumnosEnMesa_AB_unique" ON "_AlumnosEnMesa"("A", "B");

-- CreateIndex
CREATE INDEX "_AlumnosEnMesa_B_index" ON "_AlumnosEnMesa"("B");

-- AddForeignKey
ALTER TABLE "_AlumnosEnMesa" ADD CONSTRAINT "_AlumnosEnMesa_A_fkey" FOREIGN KEY ("A") REFERENCES "Alumno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlumnosEnMesa" ADD CONSTRAINT "_AlumnosEnMesa_B_fkey" FOREIGN KEY ("B") REFERENCES "MesaDeExamen"("id") ON DELETE CASCADE ON UPDATE CASCADE;
