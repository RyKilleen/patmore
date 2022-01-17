/*
  Warnings:

  - You are about to drop the column `itemId` on the `StoreType` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "StoreType" DROP CONSTRAINT "StoreType_itemId_fkey";

-- AlterTable
ALTER TABLE "StoreType" DROP COLUMN "itemId";

-- CreateTable
CREATE TABLE "_ItemToStoreType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ItemToStoreType_AB_unique" ON "_ItemToStoreType"("A", "B");

-- CreateIndex
CREATE INDEX "_ItemToStoreType_B_index" ON "_ItemToStoreType"("B");

-- AddForeignKey
ALTER TABLE "_ItemToStoreType" ADD FOREIGN KEY ("A") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemToStoreType" ADD FOREIGN KEY ("B") REFERENCES "StoreType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
