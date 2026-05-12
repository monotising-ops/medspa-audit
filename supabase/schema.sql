-- ═══════════════════════════════════════════════════════════════
-- Med Spa Growth Audit — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── Drop tables (re-runnable) ────────────────────────────────
drop table if exists leads cascade;
drop table if exists result_contents cascade;
drop table if exists site_configs cascade;
drop table if exists grade_tiers cascade;
drop table if exists questions cascade;

-- ─── Questions ────────────────────────────────────────────────
create table questions (
  id          uuid primary key default gen_random_uuid(),
  "order"     integer not null default 0,
  type        text not null check (type in ('intake','scored')),
  input_type  text not null check (input_type in ('single_select','multi_select','text')),
  domain      text not null,
  question_text text not null,
  placeholder text,
  image_url   text,
  options     jsonb not null default '[]',
  active      boolean not null default true,
  created_at  timestamptz default now()
);

-- ─── Leads ────────────────────────────────────────────────────
create table leads (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz default now(),
  name            text not null,
  email           text not null,
  spa_name        text not null,
  revenue_tier    text not null,
  location_count  text not null,
  top_treatments  text[] not null default '{}',
  answers         jsonb not null default '[]',
  domain_scores   jsonb not null default '{}',
  total_score     integer not null default 0,
  max_score       integer not null default 44,
  grade           text not null,
  tags            text[] not null default '{}',
  notes           text not null default ''
);

-- ─── Result Contents ──────────────────────────────────────────
create table result_contents (
  id               uuid primary key default gen_random_uuid(),
  domain           text not null,
  content_type     text not null check (content_type in ('analysis','best_practice','tip','recommendation')),
  score_range_min  integer not null default 0,
  score_range_max  integer not null default 100,
  revenue_tier     text,
  body             text not null default '',
  image_url        text,
  created_at       timestamptz default now()
);

-- ─── Site Configs ─────────────────────────────────────────────
create table site_configs (
  id       uuid primary key default gen_random_uuid(),
  section  text not null,
  key      text not null,
  value    text not null default '',
  unique(section, key)
);

-- ─── Grade Tiers ──────────────────────────────────────────────
create table grade_tiers (
  id          uuid primary key default gen_random_uuid(),
  min_percent numeric not null,
  max_percent numeric not null,
  grade       text not null,
  label       text not null,
  color       text not null default '#ef4444'
);

-- ─── Info Bank ────────────────────────────────────────────────
create table if not exists info_bank (
  id          uuid primary key default gen_random_uuid(),
  question_id text not null,
  option_id   text not null,
  title       text not null default '',
  body        text not null default '',
  category    text not null default 'insight',
  created_at  timestamptz default now()
);

-- ─── RLS policies ─────────────────────────────────────────────
alter table questions enable row level security;
alter table leads enable row level security;
alter table result_contents enable row level security;
alter table site_configs enable row level security;
alter table grade_tiers enable row level security;
alter table info_bank enable row level security;

-- Public can read questions and configs (assessment display)
create policy "public read questions" on questions for select using (true);
create policy "public read configs" on site_configs for select using (true);
create policy "public read grade_tiers" on grade_tiers for select using (true);
create policy "public read result_contents" on result_contents for select using (true);
create policy "public read info_bank" on info_bank for select using (true);

-- Anyone can insert leads (public submission)
create policy "public insert leads" on leads for insert with check (true);

-- Service role key bypasses RLS (used by admin API routes)

-- ─── Indexes ──────────────────────────────────────────────────
create index leads_created_at_idx on leads(created_at desc);
create index leads_grade_idx on leads(grade);
create index leads_revenue_tier_idx on leads(revenue_tier);
create index questions_order_idx on questions("order");
create index info_bank_option_idx on info_bank(question_id, option_id);
