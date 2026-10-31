-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF', 'CUSTOMER');

-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'CANCELLED';

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT IF EXISTS "Subscription_customerId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Invoice_subscriptionId_periodStart_key";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "addressLine1" TEXT,
ADD COLUMN IF NOT EXISTS "addressLine2" TEXT,
ADD COLUMN IF NOT EXISTS "billingEmail" TEXT,
ADD COLUMN IF NOT EXISTS "businessName" TEXT,
ADD COLUMN IF NOT EXISTS "taxId" TEXT,
ALTER COLUMN "companyName" SET DEFAULT 'Brightloop Customer',
ALTER COLUMN "contactName" SET DEFAULT 'Primary Contact',
ALTER COLUMN "email" SET DEFAULT 'billing@brightloop.io';

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "discountPaise" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "dueAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "subtotalPaise" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "taxPaise" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "totalPaise" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "subscriptionId" DROP NOT NULL,
ALTER COLUMN "dueDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "subtotal" SET DEFAULT 0,
ALTER COLUMN "taxTotal" SET DEFAULT 0,
ALTER COLUMN "total" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "InvoiceLine" ADD COLUMN IF NOT EXISTS "taxPaise" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "totalPaise" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "unitPricePaise" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "unitPrice" SET DEFAULT 0,
ALTER COLUMN "subtotal" SET DEFAULT 0,
ALTER COLUMN "total" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "amountPaise" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "method" "PaymentMethod" NOT NULL DEFAULT 'CARD',
ADD COLUMN IF NOT EXISTS "note" TEXT,
ADD COLUMN IF NOT EXISTS "recordedByUserId" TEXT,
ALTER COLUMN "amount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "billingInterval" "BillingInterval" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "nextBillingAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "planNameSnapshot" TEXT,
ADD COLUMN IF NOT EXISTS "recurringTotalPaise" INTEGER,
ALTER COLUMN "currentPeriodStart" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "currentPeriodEnd" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "planSnapshotName" SET DEFAULT 'Standard Plan',
ALTER COLUMN "planSnapshotCode" SET DEFAULT 'STD',
ALTER COLUMN "planSnapshotBillingInterval" SET DEFAULT 'MONTHLY',
ALTER COLUMN "planSnapshotBasePrice" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_billingEmail_key" ON "Customer"("billingEmail");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Invoice_dueAt_idx" ON "Invoice"("dueAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Payment_method_idx" ON "Payment"("method");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Subscription_customerId_fkey') THEN
    ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Invoice_subscriptionId_fkey') THEN
    ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Invoice_customerId_fkey') THEN
    ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_invoiceId_fkey') THEN
    ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_recordedByUserId_fkey') THEN
    ALTER TABLE "Payment" ADD CONSTRAINT "Payment_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
