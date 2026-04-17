-- Add influencer metrics + badge fields
ALTER TABLE "InfluencerProfile"
  ADD COLUMN IF NOT EXISTS "audienceRate" NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS "retentionRate" NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS "badgeTier" TEXT,
  ADD COLUMN IF NOT EXISTS "badgeScore" NUMERIC(5, 2);

-- Indexes for sorting/filtering
CREATE INDEX IF NOT EXISTS "InfluencerProfile_badgeTier_idx"
  ON "InfluencerProfile" ("badgeTier");
CREATE INDEX IF NOT EXISTS "InfluencerProfile_badgeScore_idx"
  ON "InfluencerProfile" ("badgeScore");
