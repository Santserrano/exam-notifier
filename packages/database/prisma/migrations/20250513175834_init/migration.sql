-- CreateTable
CREATE TABLE "MesaDeExamen" (
    "id" SERIAL NOT NULL,
    "profesor" TEXT NOT NULL,
    "vocal" TEXT NOT NULL,
    "carrera" TEXT NOT NULL,
    "materia" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "verification" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MesaDeExamen_pkey" PRIMARY KEY ("id")
);
