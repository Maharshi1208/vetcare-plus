-- CreateEnum
CREATE TYPE "public"."NotificationKind" AS ENUM ('REMINDER_24H', 'REMINDER_1H');

-- CreateTable
CREATE TABLE "public"."NotificationLog" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "kind" "public"."NotificationKind" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationLog_sentAt_idx" ON "public"."NotificationLog"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationLog_appointmentId_kind_key" ON "public"."NotificationLog"("appointmentId", "kind");

-- AddForeignKey
ALTER TABLE "public"."NotificationLog" ADD CONSTRAINT "NotificationLog_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
