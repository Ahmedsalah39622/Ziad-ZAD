-- Add columns for discount tracking
ALTER TABLE "Order" ADD COLUMN "discountCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "discountPct" DOUBLE PRECISION NOT NULL DEFAULT 0;
