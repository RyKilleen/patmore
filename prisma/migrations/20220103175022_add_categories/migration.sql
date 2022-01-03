-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Food', 'Cleaning', 'Household', 'Dog', 'Other');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "category" "Category" NOT NULL DEFAULT E'Food';
