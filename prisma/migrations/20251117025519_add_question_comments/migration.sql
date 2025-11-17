-- CreateTable
CREATE TABLE "QuestionComment" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionComment_questionId_idx" ON "QuestionComment"("questionId");

-- CreateIndex
CREATE INDEX "QuestionComment_userId_idx" ON "QuestionComment"("userId");

-- CreateIndex
CREATE INDEX "QuestionComment_createdAt_idx" ON "QuestionComment"("createdAt");

-- AddForeignKey
ALTER TABLE "QuestionComment" ADD CONSTRAINT "QuestionComment_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
