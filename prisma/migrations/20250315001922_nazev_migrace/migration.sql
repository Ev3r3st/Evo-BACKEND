/*
  Warnings:

  - You are about to drop the `DailyGoalCompletion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DailyGoalCompletion" DROP CONSTRAINT "DailyGoalCompletion_goalId_fkey";

-- DropForeignKey
ALTER TABLE "DailyGoalCompletion" DROP CONSTRAINT "DailyGoalCompletion_userId_fkey";

-- DropTable
DROP TABLE "DailyGoalCompletion";
