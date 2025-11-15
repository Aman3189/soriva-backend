/*
  Warnings:

  - The values [INDIA,INTERNATIONAL] on the enum `Region` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Region_new" AS ENUM ('IN', 'INTL');
ALTER TABLE "public"."boosters" ALTER COLUMN "region" DROP DEFAULT;
ALTER TABLE "public"."studio_booster_purchases" ALTER COLUMN "region" DROP DEFAULT;
ALTER TABLE "public"."subscriptions" ALTER COLUMN "region" DROP DEFAULT;
ALTER TABLE "public"."users" ALTER COLUMN "region" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "region" TYPE "Region_new" USING ("region"::text::"Region_new");
ALTER TABLE "subscriptions" ALTER COLUMN "region" TYPE "Region_new" USING ("region"::text::"Region_new");
ALTER TABLE "boosters" ALTER COLUMN "region" TYPE "Region_new" USING ("region"::text::"Region_new");
ALTER TABLE "studio_booster_purchases" ALTER COLUMN "region" TYPE "Region_new" USING ("region"::text::"Region_new");
ALTER TYPE "Region" RENAME TO "Region_old";
ALTER TYPE "Region_new" RENAME TO "Region";
DROP TYPE "public"."Region_old";
ALTER TABLE "boosters" ALTER COLUMN "region" SET DEFAULT 'IN';
ALTER TABLE "studio_booster_purchases" ALTER COLUMN "region" SET DEFAULT 'IN';
ALTER TABLE "subscriptions" ALTER COLUMN "region" SET DEFAULT 'IN';
ALTER TABLE "users" ALTER COLUMN "region" SET DEFAULT 'IN';
COMMIT;

-- AlterTable
ALTER TABLE "boosters" ALTER COLUMN "region" SET DEFAULT 'IN';

-- AlterTable
ALTER TABLE "studio_booster_purchases" ALTER COLUMN "region" SET DEFAULT 'IN';

-- AlterTable
ALTER TABLE "subscriptions" ALTER COLUMN "region" SET DEFAULT 'IN';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "region" SET DEFAULT 'IN';
