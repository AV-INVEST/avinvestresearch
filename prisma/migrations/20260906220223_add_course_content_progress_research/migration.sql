-- CreateEnum
CREATE TYPE "VideoSourceType" AS ENUM ('YOUTUBE', 'BUNNY_STREAM', 'NONE');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('BUNNY_STORAGE', 'S3', 'VERCEL_BLOB', 'NONE');

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "subtitle" VARCHAR(255),
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "slug" VARCHAR(128) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "durationMin" INTEGER,
    "videoSourceType" "VideoSourceType" NOT NULL DEFAULT 'NONE',
    "youtubeVideoId" VARCHAR(128),
    "bunnyVideoId" VARCHAR(128),
    "bunnyLibraryId" VARCHAR(128),
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL,
    "userEmail" VARCHAR(255) NOT NULL,
    "lessonId" TEXT NOT NULL,
    "progressPct" INTEGER NOT NULL DEFAULT 0,
    "lastPositionSec" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "lastWatchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchDoc" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(128) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "publicationDate" TIMESTAMP(3),
    "storageProvider" "StorageProvider" NOT NULL DEFAULT 'NONE',
    "storageObjectKey" VARCHAR(512),
    "storageBucket" VARCHAR(255),
    "pdfFileName" VARCHAR(255),
    "pdfFileSizeBytes" INTEGER,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchDoc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_order_idx" ON "Course"("order");

-- CreateIndex
CREATE INDEX "Module_courseId_order_idx" ON "Module"("courseId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Module_courseId_slug_key" ON "Module"("courseId", "slug");

-- CreateIndex
CREATE INDEX "Lesson_moduleId_order_idx" ON "Lesson"("moduleId", "order");

-- CreateIndex
CREATE INDEX "Lesson_status_idx" ON "Lesson"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_moduleId_slug_key" ON "Lesson"("moduleId", "slug");

-- CreateIndex
CREATE INDEX "LessonProgress_userEmail_idx" ON "LessonProgress"("userEmail");

-- CreateIndex
CREATE INDEX "LessonProgress_lessonId_completed_idx" ON "LessonProgress"("lessonId", "completed");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_userEmail_lessonId_key" ON "LessonProgress"("userEmail", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchDoc_slug_key" ON "ResearchDoc"("slug");

-- CreateIndex
CREATE INDEX "ResearchDoc_status_publicationDate_idx" ON "ResearchDoc"("status", "publicationDate" DESC);

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
