-- CreateTable
CREATE TABLE "public"."Vet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialization" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Availability" (
    "id" TEXT NOT NULL,
    "vetId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vet_email_key" ON "public"."Vet"("email");

-- CreateIndex
CREATE INDEX "Availability_vetId_idx" ON "public"."Availability"("vetId");

-- CreateIndex
CREATE INDEX "Availability_startAt_idx" ON "public"."Availability"("startAt");

-- AddForeignKey
ALTER TABLE "public"."Availability" ADD CONSTRAINT "Availability_vetId_fkey" FOREIGN KEY ("vetId") REFERENCES "public"."Vet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
