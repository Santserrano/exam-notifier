-- CreateEnum
CREATE TYPE "EstadoAceptacion" AS ENUM ('PENDIENTE', 'ACEPTADA', 'RECHAZADA');

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
CREATE TABLE "Profesor" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,

    CONSTRAINT "Profesor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MesaDeExamen" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "verification" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modalidad" TEXT DEFAULT 'Presencial',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profesorId" TEXT NOT NULL,
    "vocalId" TEXT NOT NULL,
    "aula" TEXT,
    "webexLink" TEXT,
    "carreraId" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,

    CONSTRAINT "MesaDeExamen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificacionConfig" (
    "id" TEXT NOT NULL,
    "profesorId" TEXT NOT NULL,
    "webPushEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "avisoPrevioHoras" INTEGER NOT NULL DEFAULT 24,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificacionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebPushSubscription" (
    "id" TEXT NOT NULL,
    "profesorId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebPushSubscription_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "MesaAceptacion" (
    "id" TEXT NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "profesorId" TEXT NOT NULL,
    "estado" "EstadoAceptacion" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MesaAceptacion_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "_AlumnosEnMesa" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Carrera_nombre_key" ON "Carrera"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Materia_nombre_carreraId_key" ON "Materia"("nombre", "carreraId");

-- CreateIndex
CREATE UNIQUE INDEX "Profesor_email_key" ON "Profesor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NotificacionConfig_profesorId_key" ON "NotificacionConfig"("profesorId");

-- CreateIndex
CREATE UNIQUE INDEX "Alumno_dni_key" ON "Alumno"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "MesaAceptacion_mesaId_profesorId_key" ON "MesaAceptacion"("mesaId", "profesorId");

-- CreateIndex
CREATE UNIQUE INDEX "_CarreraToProfesor_AB_unique" ON "_CarreraToProfesor"("A", "B");

-- CreateIndex
CREATE INDEX "_CarreraToProfesor_B_index" ON "_CarreraToProfesor"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MateriaToProfesor_AB_unique" ON "_MateriaToProfesor"("A", "B");

-- CreateIndex
CREATE INDEX "_MateriaToProfesor_B_index" ON "_MateriaToProfesor"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AlumnosEnMesa_AB_unique" ON "_AlumnosEnMesa"("A", "B");

-- CreateIndex
CREATE INDEX "_AlumnosEnMesa_B_index" ON "_AlumnosEnMesa"("B");

-- AddForeignKey
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesaDeExamen" ADD CONSTRAINT "MesaDeExamen_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesaDeExamen" ADD CONSTRAINT "MesaDeExamen_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesaDeExamen" ADD CONSTRAINT "MesaDeExamen_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Profesor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesaDeExamen" ADD CONSTRAINT "MesaDeExamen_vocalId_fkey" FOREIGN KEY ("vocalId") REFERENCES "Profesor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacionConfig" ADD CONSTRAINT "NotificacionConfig_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Profesor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebPushSubscription" ADD CONSTRAINT "WebPushSubscription_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Profesor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesaAceptacion" ADD CONSTRAINT "MesaAceptacion_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "MesaDeExamen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesaAceptacion" ADD CONSTRAINT "MesaAceptacion_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Profesor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarreraToProfesor" ADD CONSTRAINT "_CarreraToProfesor_A_fkey" FOREIGN KEY ("A") REFERENCES "Carrera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarreraToProfesor" ADD CONSTRAINT "_CarreraToProfesor_B_fkey" FOREIGN KEY ("B") REFERENCES "Profesor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MateriaToProfesor" ADD CONSTRAINT "_MateriaToProfesor_A_fkey" FOREIGN KEY ("A") REFERENCES "Materia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MateriaToProfesor" ADD CONSTRAINT "_MateriaToProfesor_B_fkey" FOREIGN KEY ("B") REFERENCES "Profesor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlumnosEnMesa" ADD CONSTRAINT "_AlumnosEnMesa_A_fkey" FOREIGN KEY ("A") REFERENCES "Alumno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlumnosEnMesa" ADD CONSTRAINT "_AlumnosEnMesa_B_fkey" FOREIGN KEY ("B") REFERENCES "MesaDeExamen"("id") ON DELETE CASCADE ON UPDATE CASCADE;
