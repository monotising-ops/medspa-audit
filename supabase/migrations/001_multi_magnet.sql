-- ═══════════════════════════════════════════════════════════════
-- Multi-Magnet Migration
-- Makes the shared `leads` table support multiple lead magnets
-- (Med Spa Roadmap + Creative Audit + future magnets), all managed
-- from the same admin dashboard.
--
-- SAFE TO RUN ON THE LIVE DATABASE: purely additive. No existing
-- column is dropped or altered. Existing rows are backfilled to
-- 'medspa-roadmap' so they keep showing up exactly as before.
--
-- Run this once in the Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════

-- Which magnet produced this lead. Every existing row is the original roadmap.
alter table leads add column if not exists magnet_id text not null default 'medspa-roadmap';

-- Phone (Creative Audit gate collects this; roadmap left it optional).
alter table leads add column if not exists phone text;

-- Creative Audit intake I-2: the lead's self-described struggle, free text.
-- Highest-value field for the DM opener — surfaced prominently in admin.
alter table leads add column if not exists struggle_text text;

-- Optional Instagram handle / ad link ("look at my actual ads").
-- Presence of this = the AD_PROVIDED flag (warmest leads).
alter table leads add column if not exists ad_link text;

-- Filter/sort by magnet in the admin leads table.
create index if not exists leads_magnet_id_idx on leads(magnet_id);
