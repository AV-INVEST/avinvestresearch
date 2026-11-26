-- Migrazione ADDITIVA e sicura per gli Eventi Live Premium.
-- Crea nuove tabelle ed enum dedicati agli eventi a biglietto.
-- Non modifica tabelle esistenti (Purchase, Subscription, User, StripeEvent),
-- non esegue backfill e non elimina dati.

-- CreateEnum
CREATE TYPE "LiveEventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LiveEventTicketStatus" AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

-- CreateTable
CREATE TABLE "LiveEvent" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(128) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "meetUrl" TEXT,
    "replayUrl" TEXT,
    "status" "LiveEventStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "priceAmount" INTEGER NOT NULL DEFAULT 990,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveEventTicket" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userEmail" VARCHAR(255) NOT NULL,
    "checkoutSessionId" VARCHAR(255) NOT NULL,
    "paymentIntentId" VARCHAR(255),
    "customerId" VARCHAR(255),
    "amountTotal" INTEGER NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'EUR',
    "status" "LiveEventTicketStatus" NOT NULL DEFAULT 'pending',
    "purchasedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "refundedAmount" INTEGER DEFAULT 0,
    "consentTermsVersion" VARCHAR(32),
    "consentDigitalWithdrawalVersion" VARCHAR(32),
    "consentAcceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveEventTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LiveEvent_slug_key" ON "LiveEvent"("slug");

-- CreateIndex
CREATE INDEX "LiveEvent_status_startsAt_idx" ON "LiveEvent"("status", "startsAt");

-- CreateIndex
CREATE INDEX "LiveEvent_startsAt_idx" ON "LiveEvent"("startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "LiveEventTicket_checkoutSessionId_key" ON "LiveEventTicket"("checkoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "LiveEventTicket_paymentIntentId_key" ON "LiveEventTicket"("paymentIntentId");

-- CreateIndex
CREATE INDEX "LiveEventTicket_eventId_status_idx" ON "LiveEventTicket"("eventId", "status");

-- CreateIndex
CREATE INDEX "LiveEventTicket_userEmail_status_idx" ON "LiveEventTicket"("userEmail", "status");

-- CreateIndex
CREATE INDEX "LiveEventTicket_paymentIntentId_idx" ON "LiveEventTicket"("paymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "LiveEventTicket_userEmail_eventId_key" ON "LiveEventTicket"("userEmail", "eventId");

-- AddForeignKey
ALTER TABLE "LiveEventTicket" ADD CONSTRAINT "LiveEventTicket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "LiveEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveEventTicket" ADD CONSTRAINT "LiveEventTicket_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
