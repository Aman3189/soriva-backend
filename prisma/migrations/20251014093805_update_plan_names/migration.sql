-- AlterTable
ALTER TABLE "users" ALTER COLUMN "responseDelay" SET DEFAULT 5.0,
ALTER COLUMN "responseDelay" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex (with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS "users_sessionCount_idx" ON "users"("sessionCount");

-- ==========================================
-- DATA MIGRATION: Update Plan Names & Limits
-- ==========================================

-- Update plan names in subscriptions table
UPDATE "subscriptions"
SET "planName" = CASE
  WHEN "planName" = 'VIBE_FREE' THEN 'STARTER'
  WHEN "planName" = 'VIBE_PAID' THEN 'PLUS'
  WHEN "planName" = 'SPARK' THEN 'PRO'
  WHEN "planName" = 'APEX' THEN 'EDGE'
  WHEN "planName" = 'PERSONA' THEN 'LIFE'
  ELSE "planName"
END
WHERE "planName" IN ('VIBE_FREE', 'VIBE_PAID', 'SPARK', 'APEX', 'PERSONA');

-- Update usage limits for STARTER
UPDATE "usages" u
SET 
  "monthlyLimit" = 30000,
  "dailyLimit" = 1000,
  "remainingWords" = GREATEST(0, 30000 - u."wordsUsed")
FROM "subscriptions" s
WHERE u."userId" = s."userId"
  AND s."status" = 'active'
  AND s."planName" = 'STARTER';

-- Update usage limits for PLUS
UPDATE "usages" u
SET 
  "monthlyLimit" = 50000,
  "dailyLimit" = 3300,
  "remainingWords" = GREATEST(0, 50000 - u."wordsUsed")
FROM "subscriptions" s
WHERE u."userId" = s."userId"
  AND s."status" = 'active'
  AND s."planName" = 'PLUS';

-- Update usage limits for PRO
UPDATE "usages" u
SET 
  "monthlyLimit" = 100000,
  "dailyLimit" = 6600,
  "remainingWords" = GREATEST(0, 100000 - u."wordsUsed")
FROM "subscriptions" s
WHERE u."userId" = s."userId"
  AND s."status" = 'active'
  AND s."planName" = 'PRO';

-- Update usage limits for EDGE
UPDATE "usages" u
SET 
  "monthlyLimit" = 200000,
  "dailyLimit" = 13300,
  "remainingWords" = GREATEST(0, 200000 - u."wordsUsed")
FROM "subscriptions" s
WHERE u."userId" = s."userId"
  AND s."status" = 'active'
  AND s."planName" = 'EDGE';

-- Update usage limits for LIFE
UPDATE "usages" u
SET 
  "monthlyLimit" = 300000,
  "dailyLimit" = 20000,
  "remainingWords" = GREATEST(0, 300000 - u."wordsUsed")
FROM "subscriptions" s
WHERE u."userId" = s."userId"
  AND s."status" = 'active'
  AND s."planName" = 'LIFE';

-- Update memory days for STARTER
UPDATE "users" u
SET "memoryDays" = 5
FROM "subscriptions" s
WHERE u."id" = s."userId"
  AND s."status" = 'active'
  AND s."planName" = 'STARTER';

-- Update memory days for PLUS
UPDATE "users" u
SET "memoryDays" = 5
FROM "subscriptions" s
WHERE u."id" = s."userId"
  AND s."status" = 'active'
  AND s."planName" = 'PLUS';

-- Update memory days for PRO
UPDATE "users" u
SET "memoryDays" = 15
FROM "subscriptions" s
WHERE u."id" = s."userId"
  AND s."status" = 'active'
  AND s."planName" = 'PRO';

-- Update memory days for EDGE
UPDATE "users" u
SET "memoryDays" = 25
FROM "subscriptions" s
WHERE u."id" = s."userId"
  AND s."status" = 'active'
  AND s."planName" = 'EDGE';

-- Update memory days for LIFE
UPDATE "users" u
SET "memoryDays" = 25
FROM "subscriptions" s
WHERE u."id" = s."userId"
  AND s."status" = 'active'
  AND s."planName" = 'LIFE';

-- Update response delays for STARTER
UPDATE "users" u
SET "responseDelay" = 5.0
FROM "subscriptions" s
WHERE u."id" = s."userId"
  AND s."status" = 'active'
  AND s."planName" = 'STARTER';

-- Update response delays for PLUS
UPDATE "users" u
SET "responseDelay" = 4.0
FROM "subscriptions" s
WHERE u."id" = s."userId"
  AND s."status" = 'active'
  AND s."planName" = 'PLUS';

-- Update response delays for PRO
UPDATE "users" u
SET "responseDelay" = 2.5
FROM "subscriptions" s
WHERE u."id" = s."userId"
  AND s."status" = 'active'
  AND s."planName" = 'PRO';

-- Update response delays for EDGE
UPDATE "users" u
SET "responseDelay" = 2.0
FROM "subscriptions" s
WHERE u."id" = s."userId"
  AND s."status" = 'active'
  AND s."planName" = 'EDGE';

-- Update response delays for LIFE
UPDATE "users" u
SET "responseDelay" = 2.0
FROM "subscriptions" s
WHERE u."id" = s."userId"
  AND s."status" = 'active'
  AND s."planName" = 'LIFE';