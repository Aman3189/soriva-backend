/*
  Warnings:

  - The values [RECEIPT] on the enum `WorkspaceTool` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WorkspaceTool_new" AS ENUM ('RESUME', 'LETTER', 'INVOICE', 'CERTIFICATE', 'AGREEMENT', 'MEMO', 'PROPOSAL', 'NEWSLETTER');
ALTER TABLE "workspace_generations" ALTER COLUMN "tool" TYPE "WorkspaceTool_new" USING ("tool"::text::"WorkspaceTool_new");
ALTER TYPE "WorkspaceTool" RENAME TO "WorkspaceTool_old";
ALTER TYPE "WorkspaceTool_new" RENAME TO "WorkspaceTool";
DROP TYPE "public"."WorkspaceTool_old";
COMMIT;
