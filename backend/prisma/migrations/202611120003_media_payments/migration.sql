ALTER TABLE "User" ADD COLUMN "latitude" DOUBLE PRECISION, ADD COLUMN "longitude" DOUBLE PRECISION;
CREATE TABLE "MidtransPayment" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "token" TEXT NOT NULL DEFAULT '',
  "redirectUrl" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'creating',
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MidtransPayment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MidtransPayment_orderId_key" ON "MidtransPayment"("orderId");
ALTER TABLE "MidtransPayment" ADD CONSTRAINT "MidtransPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
