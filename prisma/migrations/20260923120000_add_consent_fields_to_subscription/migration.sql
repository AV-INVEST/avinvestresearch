-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "consentTermsVersion" VARCHAR(32);

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "consentAcceptedAt" TIMESTAMP(3);
