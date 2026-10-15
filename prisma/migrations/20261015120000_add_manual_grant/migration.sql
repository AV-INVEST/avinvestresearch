-- Migrazione ADDITIVA e reversibile per gli accessi attribuiti manualmente.
-- Non modifica tabelle esistenti (Purchase, Subscription, User, StripeEvent),
-- non esegue backfill e non elimina dati.

-- CreateEnum
CREATE TYPE "ManualGrantKind" AS ENUM ('PAID_VERIFIED', 'COMPLIMENTARY');

-- CreateEnum
CREATE TYPE "ManualGrantStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "ManualGrantEvidenceType" AS ENUM ('STRIPE_CHECKOUT_SESSION', 'STRIPE_PAYMENT_INTENT', 'STRIPE_INVOICE', 'OFF_PLATFORM');

-- CreateEnum
CREATE TYPE "ManualGrantConsentSource" AS ENUM ('STRIPE_METADATA', 'ADMIN_ATTESTATION', 'NONE');

-- CreateEnum
CREATE TYPE "ManualGrantAuditAction" AS ENUM ('CREATED', 'REVOKED', 'REACTIVATED', 'EVIDENCE_RECHECKED');

-- CreateTable
CREATE TABLE "ManualGrant" (
    "id" TEXT NOT NULL,
    "userEmail" VARCHAR(255) NOT NULL,
    "productSlug" VARCHAR(64) NOT NULL,
    "kind" "ManualGrantKind" NOT NULL,
    "status" "ManualGrantStatus" NOT NULL DEFAULT 'ACTIVE',
    "activeKey" VARCHAR(400),
    "evidenceKey" VARCHAR(400),
    "evidenceType" "ManualGrantEvidenceType",
    "evidenceReference" VARCHAR(255),
    "linkedPurchaseId" VARCHAR(255),
    "evidenceAmountTotal" INTEGER,
    "evidenceCurrency" VARCHAR(8),
    "evidencePaidAt" TIMESTAMP(3),
    "evidenceCustomerEmail" VARCHAR(255),
    "evidenceSnapshot" JSONB,
    "evidenceWarnings" JSONB,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" VARCHAR(255),
    "consentSource" "ManualGrantConsentSource" NOT NULL DEFAULT 'NONE',
    "consentTermsVersion" VARCHAR(32),
    "consentDigitalWithdrawalVersion" VARCHAR(32),
    "consentAcceptedAt" TIMESTAMP(3),
    "grantedBy" VARCHAR(255) NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" VARCHAR(64),
    "reasonNote" TEXT,
    "adminNote" TEXT,
    "revokedAt" TIMESTAMP(3),
    "revokedBy" VARCHAR(255),
    "revokeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManualGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManualGrantEvent" (
    "id" TEXT NOT NULL,
    "grantId" TEXT,
    "action" "ManualGrantAuditAction" NOT NULL,
    "actorEmail" VARCHAR(255) NOT NULL,
    "targetEmail" VARCHAR(255) NOT NULL,
    "productSlug" VARCHAR(64) NOT NULL,
    "kind" "ManualGrantKind",
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManualGrantEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ManualGrant_activeKey_key" ON "ManualGrant"("activeKey");

-- CreateIndex
CREATE UNIQUE INDEX "ManualGrant_evidenceKey_key" ON "ManualGrant"("evidenceKey");

-- CreateIndex
CREATE INDEX "ManualGrant_userEmail_productSlug_status_idx" ON "ManualGrant"("userEmail", "productSlug", "status");

-- CreateIndex
CREATE INDEX "ManualGrant_productSlug_status_idx" ON "ManualGrant"("productSlug", "status");

-- CreateIndex
CREATE INDEX "ManualGrant_kind_status_idx" ON "ManualGrant"("kind", "status");

-- CreateIndex
CREATE INDEX "ManualGrant_status_grantedAt_idx" ON "ManualGrant"("status", "grantedAt");

-- CreateIndex
CREATE INDEX "ManualGrantEvent_grantId_createdAt_idx" ON "ManualGrantEvent"("grantId", "createdAt");

-- CreateIndex
CREATE INDEX "ManualGrantEvent_actorEmail_createdAt_idx" ON "ManualGrantEvent"("actorEmail", "createdAt");

-- CreateIndex
CREATE INDEX "ManualGrantEvent_targetEmail_createdAt_idx" ON "ManualGrantEvent"("targetEmail", "createdAt");

-- CreateIndex
CREATE INDEX "ManualGrantEvent_action_createdAt_idx" ON "ManualGrantEvent"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "ManualGrantEvent" ADD CONSTRAINT "ManualGrantEvent_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "ManualGrant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
