-- AlterTable
ALTER TABLE "system_settings" DROP COLUMN "ibCommission",
ADD COLUMN "taxEnabled" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "vatRate" DROP NOT NULL;

