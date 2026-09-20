-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "consentTermsVersion" VARCHAR(32);

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "consentDigitalWithdrawalVersion" VARCHAR(32);

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "consentAcceptedAt" TIMESTAMP(3);
