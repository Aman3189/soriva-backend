/*
  Warnings:

  - You are about to drop the column `receiptUsesTotal` on the `workspace_free_quotas` table. All the data in the column will be lost.
  - You are about to drop the column `receiptUsesUsed` on the `workspace_free_quotas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "workspace_free_quotas" DROP COLUMN "receiptUsesTotal",
DROP COLUMN "receiptUsesUsed";
