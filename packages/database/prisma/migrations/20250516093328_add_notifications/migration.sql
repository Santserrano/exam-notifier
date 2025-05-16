/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Profesor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Profesor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Profesor" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "telefono" TEXT;

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

-- CreateIndex
CREATE UNIQUE INDEX "NotificacionConfig_profesorId_key" ON "NotificacionConfig"("profesorId");

-- CreateIndex
CREATE UNIQUE INDEX "Profesor_email_key" ON "Profesor"("email");

-- AddForeignKey
ALTER TABLE "NotificacionConfig" ADD CONSTRAINT "NotificacionConfig_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Profesor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebPushSubscription" ADD CONSTRAINT "WebPushSubscription_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Profesor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
