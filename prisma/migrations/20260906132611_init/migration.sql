-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "googleId" VARCHAR(255),
    "name" VARCHAR(255),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeEvent" (
    "id" TEXT NOT NULL,
    "eventId" VARCHAR(255) NOT NULL,
    "type" VARCHAR(128) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "userEmail" VARCHAR(255) NOT NULL,
    "productSlug" VARCHAR(64) NOT NULL,
    "checkoutSessionId" VARCHAR(255) NOT NULL,
    "customerId" VARCHAR(255),
    "paymentIntentId" VARCHAR(255),
    "invoiceId" VARCHAR(255),
    "amountTotal" INTEGER NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'EUR',
    "status" "PurchaseStatus" NOT NULL DEFAULT 'pending',
    "purchasedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "refundedAmount" INTEGER DEFAULT 0,
    "invoiceHostedUrl" TEXT,
    "invoicePdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeEvent_eventId_key" ON "StripeEvent"("eventId");

-- CreateIndex
CREATE INDEX "StripeEvent_eventId_idx" ON "StripeEvent"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_checkoutSessionId_key" ON "Purchase"("checkoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_paymentIntentId_key" ON "Purchase"("paymentIntentId");

-- CreateIndex
CREATE INDEX "Purchase_userEmail_status_idx" ON "Purchase"("userEmail", "status");

-- CreateIndex
CREATE INDEX "Purchase_paymentIntentId_idx" ON "Purchase"("paymentIntentId");

-- CreateIndex
CREATE INDEX "Purchase_productSlug_idx" ON "Purchase"("productSlug");

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
