-- CreateTable
CREATE TABLE "public"."Vaccination" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "vetId" TEXT,
    "vaccineName" TEXT NOT NULL,
    "givenDate" TIMESTAMP(3) NOT NULL,
    "nextDueDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vaccination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Medication" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "prescribedById" TEXT,
    "name" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vaccination_petId_idx" ON "public"."Vaccination"("petId");

-- CreateIndex
CREATE INDEX "Vaccination_givenDate_idx" ON "public"."Vaccination"("givenDate");

-- CreateIndex
CREATE INDEX "Medication_petId_idx" ON "public"."Medication"("petId");

-- CreateIndex
CREATE INDEX "Medication_startDate_idx" ON "public"."Medication"("startDate");

-- AddForeignKey
ALTER TABLE "public"."Vaccination" ADD CONSTRAINT "Vaccination_petId_fkey" FOREIGN KEY ("petId") REFERENCES "public"."Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vaccination" ADD CONSTRAINT "Vaccination_vetId_fkey" FOREIGN KEY ("vetId") REFERENCES "public"."Vet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Medication" ADD CONSTRAINT "Medication_petId_fkey" FOREIGN KEY ("petId") REFERENCES "public"."Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Medication" ADD CONSTRAINT "Medication_prescribedById_fkey" FOREIGN KEY ("prescribedById") REFERENCES "public"."Vet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
