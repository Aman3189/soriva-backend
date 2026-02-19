/*
  Warnings:

  - You are about to drop the column `max_tokens` on the `chatbot_clients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chatbot_clients" DROP COLUMN "max_tokens",
ADD COLUMN     "daily_session_limit" INTEGER NOT NULL DEFAULT 200,
ADD COLUMN     "max_tokens_per_msg" INTEGER NOT NULL DEFAULT 1024,
ADD COLUMN     "monthly_input_tokens" INTEGER NOT NULL DEFAULT 2000000,
ADD COLUMN     "monthly_message_limit" INTEGER NOT NULL DEFAULT 10000,
ADD COLUMN     "monthly_output_tokens" INTEGER NOT NULL DEFAULT 1000000,
ADD COLUMN     "usage_reset_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "used_input_tokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "used_messages" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "used_output_tokens" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "daily_message_limit" SET DEFAULT 500;
