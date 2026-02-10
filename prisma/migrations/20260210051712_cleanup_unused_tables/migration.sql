/*
  Warnings:

  - You are about to drop the `Horoscope` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `credits` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `document_queries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_documents` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."credits" DROP CONSTRAINT "credits_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."document_queries" DROP CONSTRAINT "document_queries_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."document_queries" DROP CONSTRAINT "document_queries_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."jobs" DROP CONSTRAINT "jobs_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_documents" DROP CONSTRAINT "user_documents_userId_fkey";

-- DropTable
DROP TABLE "public"."Horoscope";

-- DropTable
DROP TABLE "public"."credits";

-- DropTable
DROP TABLE "public"."document_queries";

-- DropTable
DROP TABLE "public"."jobs";

-- DropTable
DROP TABLE "public"."user_documents";

-- DropEnum
DROP TYPE "public"."HoroscopeSign";
