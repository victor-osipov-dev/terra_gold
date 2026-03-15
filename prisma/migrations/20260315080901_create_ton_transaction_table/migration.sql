-- CreateTable
CREATE TABLE "TonTransaction" (
    "id" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TonTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TonTransaction_tx_hash_key" ON "TonTransaction"("tx_hash");
