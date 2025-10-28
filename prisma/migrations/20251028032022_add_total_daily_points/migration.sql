-- AlterTable
ALTER TABLE "UserStats" ADD COLUMN     "totalDailyPoints" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "UserStats_totalDailyPoints_idx" ON "UserStats"("totalDailyPoints");
