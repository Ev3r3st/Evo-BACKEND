/*
  Warnings:

  - Made the column `goal_name` on table `Goal` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Goal" ALTER COLUMN "goal_name" SET NOT NULL,
ALTER COLUMN "reason" DROP NOT NULL,
ALTER COLUMN "destination" DROP NOT NULL,
ALTER COLUMN "new_self" DROP NOT NULL,
ALTER COLUMN "daily_action" DROP NOT NULL,
ALTER COLUMN "daily_learning" DROP NOT NULL,
ALTER COLUMN "daily_visualization" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Progress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "goalId" INTEGER NOT NULL,
    "completedDays" INTEGER NOT NULL DEFAULT 0,
    "lastCompletionDate" TIMESTAMP(3),
    "streak" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
