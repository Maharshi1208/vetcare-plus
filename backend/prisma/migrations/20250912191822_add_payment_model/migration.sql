/*
  Warnings:

  - The `status` column on the `Appointment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."ApptStatus" AS ENUM ('BOOKED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- DropIndex
DROP INDEX "public"."Pet_name_idx";

-- DropIndex
DROP INDEX "public"."Vet_email_key";

-- AlterTable
ALTER TABLE "public"."Appointment" DROP COLUMN "status",
ADD COLUMN     "status" "public"."ApptStatus" NOT NULL DEFAULT 'BOOKED';

-- AlterTable
ALTER TABLE "public"."Pet" ALTER COLUMN "species" DROP NOT NULL;

-- DropEnum
DROP TYPE "public"."AppointmentStatus";

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_appointmentId_key" ON "public"."Payment"("appointmentId");

-- CreateIndex
CREATE INDEX "Appointment_petId_idx" ON "public"."Appointment"("petId");

-- CreateIndex
CREATE INDEX "Appointment_vetId_idx" ON "public"."Appointment"("vetId");

-- CreateIndex
CREATE INDEX "Appointment_ownerId_idx" ON "public"."Appointment"("ownerId");

-- CreateIndex
CREATE INDEX "Vet_name_idx" ON "public"."Vet"("name");

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
