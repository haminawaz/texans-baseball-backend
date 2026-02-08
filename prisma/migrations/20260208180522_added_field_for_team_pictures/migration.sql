/*
  Warnings:

  - You are about to drop the column `logo` on the `teams` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "teams" DROP COLUMN "logo",
ADD COLUMN     "team_pictures_url" VARCHAR(255);
