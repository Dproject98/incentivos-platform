-- CreateEnum
CREATE TYPE "BonoRedemptionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "StaffScan" DROP CONSTRAINT "StaffScan_staffId_fkey";

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "ibanHolder" TEXT,
ADD COLUMN     "ibanNumber" TEXT;

-- AlterTable
ALTER TABLE "BusinessStaff" ADD COLUMN     "pin" TEXT;

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "incentiveType",
ADD COLUMN     "bonusMinValue" DOUBLE PRECISION,
ADD COLUMN     "fixedValue" DOUBLE PRECISION,
ADD COLUMN     "incentiveTypes" TEXT[],
ADD COLUMN     "percentageValue" DOUBLE PRECISION,
ALTER COLUMN "incentiveValue" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "chosenIncentiveType" TEXT,
ADD COLUMN     "empresaPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "empresaPaidAt" TIMESTAMP(3),
ADD COLUMN     "empresaPaymentId" TEXT;

-- AlterTable
ALTER TABLE "StaffScan" ADD COLUMN     "businessStaffId" TEXT,
ALTER COLUMN "staffId" DROP NOT NULL;

-- DropEnum
DROP TYPE "IncentiveType";

-- CreateTable
CREATE TABLE "EmpresaPayment" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "confirmedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmpresaPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonoRedemption" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "BonoRedemptionStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BonoRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessStaff_pin_key" ON "BusinessStaff"("pin");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_empresaPaymentId_fkey" FOREIGN KEY ("empresaPaymentId") REFERENCES "EmpresaPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffScan" ADD CONSTRAINT "StaffScan_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffScan" ADD CONSTRAINT "StaffScan_businessStaffId_fkey" FOREIGN KEY ("businessStaffId") REFERENCES "BusinessStaff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpresaPayment" ADD CONSTRAINT "EmpresaPayment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonoRedemption" ADD CONSTRAINT "BonoRedemption_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonoRedemption" ADD CONSTRAINT "BonoRedemption_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

