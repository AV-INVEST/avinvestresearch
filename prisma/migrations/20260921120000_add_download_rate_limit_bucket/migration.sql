-- CreateTable
CREATE TABLE "DownloadRateLimitBucket" (
    "id" TEXT NOT NULL,
    "userEmail" VARCHAR(255) NOT NULL,
    "scope" VARCHAR(64) NOT NULL,
    "resourceKey" VARCHAR(256) NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowSizeMinutes" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DownloadRateLimitBucket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RateLimitBucket_unique_key" ON "DownloadRateLimitBucket"("userEmail", "scope", "resourceKey", "windowStart", "windowSizeMinutes");

-- CreateIndex
CREATE INDEX "DownloadRateLimitBucket_userEmail_scope_idx" ON "DownloadRateLimitBucket"("userEmail", "scope");

-- CreateIndex
CREATE INDEX "DownloadRateLimitBucket_windowStart_idx" ON "DownloadRateLimitBucket"("windowStart");
