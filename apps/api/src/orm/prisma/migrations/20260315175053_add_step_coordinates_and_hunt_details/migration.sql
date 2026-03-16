/*
  Warnings:

  - You are about to drop the column `location` on the `Step` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Hunt" ADD COLUMN     "difficulty" TEXT DEFAULT 'Intermédiaire',
ADD COLUMN     "shortDescription" TEXT;

-- AlterTable
ALTER TABLE "Step" DROP COLUMN "location",
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;
