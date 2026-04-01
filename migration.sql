-- ═══════════════════════════════════════════════════════════
-- Wedding RSVP — Supabase Schema Migration
-- Run this in the Supabase SQL Editor to add the new columns
-- ═══════════════════════════════════════════════════════════

-- Rename 'name' to 'full_name' for clarity (skip if already named full_name)
-- ALTER TABLE rsvps RENAME COLUMN name TO full_name;

-- Add new columns (all optional, won't break existing rows)
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS phone          text;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS email          text;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS guest_count    smallint DEFAULT 1;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS side           text CHECK (side IN ('bride', 'groom'));
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS relationship   text;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS dietary_needs  text;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS song_request   text;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS needs_transport boolean DEFAULT false;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS table_number   smallint;

-- ═══════════════════════════════════════════════════════════
-- If you are creating the table from scratch, use this instead:
-- ═══════════════════════════════════════════════════════════
/*
CREATE TABLE rsvps (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       text NOT NULL,
  phone           text,
  email           text,
  is_coming       boolean NOT NULL,
  guest_count     smallint NOT NULL DEFAULT 1,
  side            text CHECK (side IN ('bride', 'groom')),
  relationship    text,
  dietary_needs   text,
  song_request    text,
  comment         text,
  needs_transport boolean DEFAULT false,
  table_number    smallint,
  created_at      timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Public can insert (RSVP form)
CREATE POLICY "Anyone can insert" ON rsvps FOR INSERT WITH CHECK (true);

-- Only authenticated users can read (admin dashboard)
CREATE POLICY "Auth users can read" ON rsvps FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users can delete
CREATE POLICY "Auth users can delete" ON rsvps FOR DELETE USING (auth.role() = 'authenticated');

-- Only authenticated users can update
CREATE POLICY "Auth users can update" ON rsvps FOR UPDATE USING (auth.role() = 'authenticated');
*/
