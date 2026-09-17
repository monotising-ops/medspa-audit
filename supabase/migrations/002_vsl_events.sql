-- ─── VSL funnel events ────────────────────────────────────────────────
-- First-party, cookie-free analytics for /offer. session_id is a random
-- string held in sessionStorage — no cookie, no cross-site identifier,
-- nothing that needs a consent banner in the US.

create table if not exists vsl_events (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  session_id   text not null,
  event        text not null,
  step         integer,
  label        text,
  device       text,
  path         text,
  referrer     text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_content  text
);

create index if not exists vsl_events_created_at_idx on vsl_events (created_at desc);
create index if not exists vsl_events_event_idx      on vsl_events (event);
create index if not exists vsl_events_session_idx     on vsl_events (session_id);

-- Writes come from the public page through the service-role API route only.
alter table vsl_events enable row level security;
