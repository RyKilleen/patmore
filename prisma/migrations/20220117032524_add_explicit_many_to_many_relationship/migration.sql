-- CreateTable
CREATE TABLE "StoreTypesOnItems" (
    "itemId" INTEGER NOT NULL,
    "storeTypeId" INTEGER NOT NULL,

    CONSTRAINT "StoreTypesOnItems_pkey" PRIMARY KEY ("itemId","storeTypeId")
);

-- AddForeignKey
ALTER TABLE "StoreTypesOnItems" ADD CONSTRAINT "StoreTypesOnItems_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreTypesOnItems" ADD CONSTRAINT "StoreTypesOnItems_storeTypeId_fkey" FOREIGN KEY ("storeTypeId") REFERENCES "StoreType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
