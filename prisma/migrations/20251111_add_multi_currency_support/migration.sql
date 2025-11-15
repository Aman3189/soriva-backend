

-- Create Region enum (SIMPLIFIED: Only 2 regions)
CREATE TYPE "Region" AS ENUM (
  'INDIA',         -- India users (₹ INR pricing)
  'INTERNATIONAL'  -- All other countries ($ USD pricing - bank converts to local)
);

-- Create Currency enum (SIMPLIFIED: Only 2 currencies)
CREATE TYPE "Currency" AS ENUM (
  'INR',  -- Indian Rupee (₹) - India only
  'USD'   -- US Dollar ($) - International (bank auto-converts to GBP, EUR, CAD, AUD, etc.)
);


ALTER TABLE "users" ADD COLUMN "region" "Region" NOT NULL DEFAULT 'INDIA';
ALTER TABLE "users" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'INR';
ALTER TABLE "users" ADD COLUMN "country" TEXT DEFAULT 'IN';
ALTER TABLE "users" ADD COLUMN "detectedCountry" TEXT;
ALTER TABLE "users" ADD COLUMN "countryName" TEXT;
ALTER TABLE "users" ADD COLUMN "timezone" TEXT;


CREATE INDEX "users_region_idx" ON "users"("region");
CREATE INDEX "users_currency_idx" ON "users"("currency");
CREATE INDEX "users_country_idx" ON "users"("country");

ALTER TABLE "subscriptions" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'INR';
ALTER TABLE "subscriptions" ADD COLUMN "region" "Region" NOT NULL DEFAULT 'INDIA';

CREATE INDEX "subscriptions_currency_idx" ON "subscriptions"("currency");
CREATE INDEX "subscriptions_region_idx" ON "subscriptions"("region");


ALTER TABLE "boosters" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'INR';
ALTER TABLE "boosters" ADD COLUMN "region" "Region" NOT NULL DEFAULT 'INDIA';


CREATE INDEX "boosters_currency_idx" ON "boosters"("currency");
CREATE INDEX "boosters_region_idx" ON "boosters"("region");


ALTER TABLE "studio_booster_purchases" ADD COLUMN "region" "Region" NOT NULL DEFAULT 'INDIA';


CREATE INDEX "studio_booster_purchases_region_idx" ON "studio_booster_purchases"("region");


COMMENT ON TYPE "Region" IS 'Simplified regions: INDIA for Indian users, INTERNATIONAL for all others';
COMMENT ON TYPE "Currency" IS 'Simplified currencies: INR for India, USD for International (bank converts)';

COMMENT ON COLUMN "users"."region" IS 'User geographical region: INDIA or INTERNATIONAL';
COMMENT ON COLUMN "users"."currency" IS 'User preferred currency: INR or USD';
COMMENT ON COLUMN "users"."country" IS 'ISO country code for analytics (IN, US, GB, CA, etc.)';
COMMENT ON COLUMN "users"."detectedCountry" IS 'Auto-detected country from IP (for region assignment)';
COMMENT ON COLUMN "users"."countryName" IS 'Full country name for display';
COMMENT ON COLUMN "users"."timezone" IS 'User timezone (Asia/Kolkata, America/New_York, etc.)';

COMMENT ON COLUMN "subscriptions"."currency" IS 'Subscription payment currency: INR or USD';
COMMENT ON COLUMN "subscriptions"."region" IS 'Subscription region: INDIA or INTERNATIONAL';

COMMENT ON COLUMN "boosters"."currency" IS 'Booster payment currency: INR or USD';
COMMENT ON COLUMN "boosters"."region" IS 'Booster region: INDIA or INTERNATIONAL';

COMMENT ON COLUMN "studio_booster_purchases"."region" IS 'Studio booster region: INDIA or INTERNATIONAL';

