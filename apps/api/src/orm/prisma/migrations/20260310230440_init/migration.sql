-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PARTNER', 'PLAYER');

-- CreateEnum
CREATE TYPE "HuntStatus" AS ENUM ('DRAFT', 'ACTIVE', 'FINISHED');

-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('GPS', 'QR_CODE', 'AR', 'RIDDLE');

-- CreateTable
CREATE TABLE "Hunt" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "radius" INTEGER NOT NULL DEFAULT 5000,
    "status" "HuntStatus" NOT NULL DEFAULT 'DRAFT',
    "rewardType" TEXT DEFAULT 'DISCOUNT_CODE',
    "rewardValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "refUser" INTEGER NOT NULL,

    CONSTRAINT "Hunt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participation" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "status" "ParticipationStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "refUser" INTEGER NOT NULL,
    "refHunt" INTEGER NOT NULL,
    "currentStep" INTEGER,

    CONSTRAINT "Participation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Step" (
    "id" SERIAL NOT NULL,
    "orderNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "clue" TEXT,
    "location" TEXT,
    "radius" INTEGER NOT NULL DEFAULT 50,
    "actionType" "ActionType" NOT NULL DEFAULT 'GPS',
    "arMarker" TEXT,
    "arContent" TEXT,
    "qrCode" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refHunt" INTEGER NOT NULL,

    CONSTRAINT "Step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PLAYER',
    "picture" TEXT,
    "lastConnection" TIMESTAMP(3),
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Participation_refUser_refHunt_key" ON "Participation"("refUser", "refHunt");

-- CreateIndex
CREATE UNIQUE INDEX "Step_refHunt_orderNumber_key" ON "Step"("refHunt", "orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Hunt" ADD CONSTRAINT "Hunt_refUser_fkey" FOREIGN KEY ("refUser") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_refUser_fkey" FOREIGN KEY ("refUser") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_refHunt_fkey" FOREIGN KEY ("refHunt") REFERENCES "Hunt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_currentStep_fkey" FOREIGN KEY ("currentStep") REFERENCES "Step"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Step" ADD CONSTRAINT "Step_refHunt_fkey" FOREIGN KEY ("refHunt") REFERENCES "Hunt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
