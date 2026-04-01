// ─── Shared Supabase Configuration ──────────────────────────
// Replace these two values with your actual Supabase project credentials.
// Both app.js and admin.js import from this single source of truth.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

export const SUPABASE_URL  = 'YOUR_SUPABASE_URL'
export const SUPABASE_ANON = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// ─── Wedding Config ─────────────────────────────────────────
// Used by the countdown timer on the invite page.
export const WEDDING_DATE = new Date('2025-06-07T17:00:00')

// Couple names (used in titles / meta)
export const BRIDE = 'Sarah'
export const GROOM = 'James'
