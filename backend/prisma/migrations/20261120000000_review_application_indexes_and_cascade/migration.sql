-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_freelancerId_fkey";

-- CreateIndex
CREATE INDEX "Application_freelancerId_createdAt_idx" ON "Application"("freelancerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Review_reviewerId_idx" ON "Review"("reviewerId");

-- CreateIndex
CREATE INDEX "Review_revieweeId_idx" ON "Review"("revieweeId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
