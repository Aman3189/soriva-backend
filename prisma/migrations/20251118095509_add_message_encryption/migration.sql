-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "encryptedContent" TEXT,
ADD COLUMN     "encryptionAuthTag" TEXT,
ADD COLUMN     "encryptionIV" TEXT;
