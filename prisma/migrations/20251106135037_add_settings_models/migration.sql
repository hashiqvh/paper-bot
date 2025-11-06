-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "signature" TEXT,
ADD COLUMN     "timezone" TEXT DEFAULT 'UTC';

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "licenseNumber" TEXT,
    "address" TEXT,
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "paymentInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_addresses" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "cryptocurrency" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "newClientAdded" BOOLEAN NOT NULL DEFAULT true,
    "proposalAccepted" BOOLEAN NOT NULL DEFAULT true,
    "invoiceOverdue" BOOLEAN NOT NULL DEFAULT true,
    "kycSubmission" BOOLEAN NOT NULL DEFAULT true,
    "activityLog" BOOLEAN NOT NULL DEFAULT true,
    "securityAlerts" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "ibCommission" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_userId_key" ON "companies"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_preferences_userId_key" ON "user_notification_preferences"("userId");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_addresses" ADD CONSTRAINT "wallet_addresses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
