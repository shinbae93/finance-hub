-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('MUA', 'BAN');

-- CreateTable
CREATE TABLE "StockTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tradeDate" DATE NOT NULL,
    "settlementDate" DATE NOT NULL,
    "ticker" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "volume" INTEGER NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "feeRate" DECIMAL(5,4) NOT NULL,
    "fee" DECIMAL(15,2) NOT NULL,
    "tax" DECIMAL(15,2) NOT NULL,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockTransaction_userId_ticker_idx" ON "StockTransaction"("userId", "ticker");

-- CreateIndex
CREATE INDEX "StockTransaction_userId_tradeDate_idx" ON "StockTransaction"("userId", "tradeDate");

-- AddForeignKey
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
