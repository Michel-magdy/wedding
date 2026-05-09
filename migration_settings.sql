-- ═══════════════════════════════════════════════════════════
-- Wedding Settings — Supabase Schema Migration
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Settings table: stores wedding event details (single row)
-- Two locations: Church (ceremony) and Hall (reception)
CREATE TABLE IF NOT EXISTS wedding_settings (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Church / Ceremony
  church_date      timestamptz,
  church_name      text,
  church_address   text,
  church_maps_url  text,

  -- Hall / Reception
  hall_date        timestamptz,
  hall_name        text,
  hall_address     text,
  hall_maps_url    text,

  updated_at       timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE wedding_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read (guests need to see the info)
CREATE POLICY "Anyone can read settings" ON wedding_settings
  FOR SELECT USING (true);

-- Only authenticated users can insert
CREATE POLICY "Auth users can insert settings" ON wedding_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update
CREATE POLICY "Auth users can update settings" ON wedding_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert a default row so there's always one to update
INSERT INTO wedding_settings (church_date, church_name, hall_date, hall_name)
VALUES (NULL, NULL, NULL, NULL);
