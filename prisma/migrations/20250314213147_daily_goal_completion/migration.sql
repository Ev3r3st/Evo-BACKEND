-- CreateTable
CREATE TABLE "DailyGoalCompletion" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "goalId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DailyGoalCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyGoalCompletion_userId_goalId_date_key" ON "DailyGoalCompletion"("userId", "goalId", "date");

-- AddForeignKey
ALTER TABLE "DailyGoalCompletion" ADD CONSTRAINT "DailyGoalCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyGoalCompletion" ADD CONSTRAINT "DailyGoalCompletion_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
