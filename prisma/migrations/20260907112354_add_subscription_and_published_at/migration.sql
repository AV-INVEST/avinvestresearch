-- CreateEnum
CREATE TYPE "SubscriptionProduct" AS ENUM ('AV_RESEARCH_CLUB');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('INCOMPLETE', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'ENDED');

-- AlterTable
ALTER TABLE "ResearchDoc" ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userEmail" VARCHAR(255) NOT NULL,
    "product" "SubscriptionProduct" NOT NULL DEFAULT 'AV_RESEARCH_CLUB',
    "stripeCustomerId" VARCHAR(255),
    "stripeSubscriptionId" VARCHAR(255) NOT NULL,
    "stripePriceId" VARCHAR(255),
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "currentPeriodEnd" TIMESTAMP(3),
    "latestInvoicePaidAt" TIMESTAMP(3),
    "paymentProblem" BOOLEAN NOT NULL DEFAULT false,
    "paymentProblemAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_userEmail_product_status_idx" ON "Subscription"("userEmail", "product", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userEmail_product_key" ON "Subscription"("userEmail", "product");

-- CreateIndex
CREATE INDEX "ResearchDoc_status_publishedAt_idx" ON "ResearchDoc"("status", "publishedAt" DESC);

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
