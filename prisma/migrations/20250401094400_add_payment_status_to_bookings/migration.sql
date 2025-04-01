/*
  Warnings:

  - A unique constraint covering the columns `[stripeCheckoutSessionId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'PAID';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "stripeCheckoutSessionId" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_stripeCheckoutSessionId_key" ON "Booking"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_stripePaymentIntentId_key" ON "Booking"("stripePaymentIntentId");
