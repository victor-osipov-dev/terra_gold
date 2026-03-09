-- CreateTable
CREATE TABLE "Resource" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "number" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);
