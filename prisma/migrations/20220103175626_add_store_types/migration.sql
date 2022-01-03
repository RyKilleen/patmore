-- CreateEnum
CREATE TYPE "StoreType" AS ENUM ('BigBox', 'Grocery', 'General');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "stores" "StoreType"[];
