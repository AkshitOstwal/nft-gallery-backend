/*
  Warnings:

  - You are about to drop the column `dateOfAcquisation` on the `NFTToken` table. All the data in the column will be lost.
  - Added the required column `dateOfAcquisition` to the `NFTToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NFTToken" DROP COLUMN "dateOfAcquisation",
ADD COLUMN     "dateOfAcquisition" TIMESTAMP(3) NOT NULL;
