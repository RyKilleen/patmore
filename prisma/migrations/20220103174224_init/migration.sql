-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "needed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);
