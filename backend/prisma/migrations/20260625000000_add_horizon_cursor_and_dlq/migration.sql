-- Idempotent re-run of horizon_cursor / horizon_dlq setup.
-- 20260619000000_add_horizon_cursor_and_dlq already creates these tables on a fresh database.
-- This migration must be a no-op there, and must bring older databases (where the tables were
-- created without last_event_at) in line with schema.prisma.

-- Create horizon_cursor table for durable cursor persistence
CREATE TABLE IF NOT EXISTS "horizon_cursor" (
  "id"            INTEGER PRIMARY KEY DEFAULT 1 CHECK ("id" = 1),
  "cursor"        TEXT NOT NULL,
  "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "last_event_at" TIMESTAMPTZ
);

ALTER TABLE "horizon_cursor" ADD COLUMN IF NOT EXISTS "last_event_at" TIMESTAMPTZ;

-- Create horizon_dlq table for failed event processing
CREATE TABLE IF NOT EXISTS "horizon_dlq" (
  "id"          SERIAL PRIMARY KEY,
  "cursor"      TEXT NOT NULL,
  "payload"     JSONB NOT NULL,
  "error"       TEXT NOT NULL,
  "attempt"     INTEGER NOT NULL DEFAULT 1,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  "replayed_at" TIMESTAMPTZ
);

-- Index matching the @@index([replayedAt, cursor]) declared in schema.prisma
CREATE INDEX IF NOT EXISTS "horizon_dlq_replayed_at_cursor_idx" ON "horizon_dlq"("replayed_at", "cursor");

-- Seed the singleton cursor row, as 20260619000000 does
INSERT INTO "horizon_cursor" ("id", "cursor")
VALUES (1, '0')
ON CONFLICT ("id") DO NOTHING;
