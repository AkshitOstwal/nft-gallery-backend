/*
  Warnings:

  - You are about to drop the column `unrealisedGainsLosses` on the `NFTToken` table. All the data in the column will be lost.
  - Added the required column `unrealizedGainsLosses` to the `NFTToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NFTToken" DROP COLUMN "unrealisedGainsLosses",
ADD COLUMN     "unrealizedGainsLosses" INTEGER NOT NULL;
