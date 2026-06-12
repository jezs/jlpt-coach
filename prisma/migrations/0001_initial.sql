-- CreateEnum
CREATE TYPE "Category" AS ENUM ('VOCABULARY', 'GRAMMAR', 'KANJI', 'READING');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "anthropicApiKey" TEXT,
    "studyGoalDays" INTEGER NOT NULL DEFAULT 365,
    "dailyMinutes" INTEGER NOT NULL DEFAULT 15,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "itemKey" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "nextReview" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReview" TIMESTAMP(3),
    "correctStreak" INTEGER NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "correctReviews" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "study_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_responses" (
    "id" TEXT NOT NULL,
    "studyItemId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "quality" INTEGER NOT NULL,
    "timeMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "category" "Category",
    "itemsStudied" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "aiSuggested" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "study_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weakness_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "report" JSONB NOT NULL,

    CONSTRAINT "weakness_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "study_items_userId_itemKey_key" ON "study_items"("userId", "itemKey");
CREATE INDEX "study_items_userId_nextReview_idx" ON "study_items"("userId", "nextReview");
CREATE INDEX "study_items_userId_category_idx" ON "study_items"("userId", "category");
CREATE INDEX "item_responses_studyItemId_idx" ON "item_responses"("studyItemId");
CREATE INDEX "item_responses_sessionId_idx" ON "item_responses"("sessionId");
CREATE INDEX "study_sessions_userId_startedAt_idx" ON "study_sessions"("userId", "startedAt");
CREATE INDEX "weakness_reports_userId_createdAt_idx" ON "weakness_reports"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "study_items" ADD CONSTRAINT "study_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "item_responses" ADD CONSTRAINT "item_responses_studyItemId_fkey" FOREIGN KEY ("studyItemId") REFERENCES "study_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "item_responses" ADD CONSTRAINT "item_responses_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "study_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "weakness_reports" ADD CONSTRAINT "weakness_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
