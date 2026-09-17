import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

// Funnel aggregation for the VSL dashboard. Counts UNIQUE SESSIONS per step,
// not raw events — one person replaying the video should not look like two
// visitors.

const PAGE = 1000;
const MAX_ROWS = 100_000;

interface Row {
  session_id: string;
  event: string;
  step: number | null;
  label: string | null;
  device: string | null;
  utm_campaign: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  const days = Math.min(Math.max(Number(new URL(request.url).searchParams.get('days') ?? 7), 1), 365);
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  const db = getAdminClient();
  const rows: Row[] = [];

  // Paginate — PostgREST caps a single response well below our ceiling.
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const { data, error } = await db
      .from('vsl_events')
      .select('session_id,event,step,label,device,utm_campaign,created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1);

    if (error) {
      const missing = /relation .* does not exist|schema cache/i.test(error.message);
      return Response.json(
        { error: error.message, needsMigration: missing },
        { status: missing ? 200 : 500 }
      );
    }
    if (!data?.length) break;
    rows.push(...(data as Row[]));
    if (data.length < PAGE) break;
  }

  // ── Unique sessions per event ──────────────────────────────────────
  const sessionsFor = (event: string) =>
    new Set(rows.filter((r) => r.event === event).map((r) => r.session_id));

  const visitors = sessionsFor('vsl_page_view');
  const unmuted = sessionsFor('vsl_unmute_click');
  const formStart = sessionsFor('vsl_form_start');
  const submitted = sessionsFor('vsl_form_submit');

  const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 1000) / 10 : 0);

  // ── Form step depth ────────────────────────────────────────────────
  // step N on vsl_form_step means they ARRIVED at question N.
  const STEP_LABELS = ['Location', 'Treatments', 'Ad spend', 'Challenge', 'Name & phone'];
  const stepSessions: Set<string>[] = STEP_LABELS.map(() => new Set<string>());
  stepSessions[0] = new Set(formStart);
  for (const r of rows) {
    if (r.event !== 'vsl_form_step' || r.step == null) continue;
    if (r.step >= 0 && r.step < STEP_LABELS.length) stepSessions[r.step].add(r.session_id);
  }

  const formSteps = STEP_LABELS.map((label, i) => {
    const reached = stepSessions[i].size;
    const next = i + 1 < STEP_LABELS.length ? stepSessions[i + 1].size : submitted.size;
    return {
      step: i + 1,
      label,
      reached,
      continued: next,
      dropped: Math.max(reached - next, 0),
      dropRate: pct(Math.max(reached - next, 0), reached),
    };
  });

  // ── Testimonial plays ──────────────────────────────────────────────
  const testimonialPlays = Object.entries(
    rows
      .filter((r) => r.event === 'vsl_testimonial_play')
      .reduce<Record<string, Set<string>>>((acc, r) => {
        const k = r.label ?? 'unknown';
        (acc[k] ??= new Set()).add(r.session_id);
        return acc;
      }, {})
  )
    .map(([label, s]) => ({ label, sessions: s.size, rate: pct(s.size, visitors.size) }))
    .sort((a, b) => b.sessions - a.sessions);

  // ── Device + campaign split ────────────────────────────────────────
  const splitBy = (key: 'device' | 'utm_campaign') =>
    Object.entries(
      rows
        .filter((r) => r.event === 'vsl_page_view')
        .reduce<Record<string, Set<string>>>((acc, r) => {
          const k = r[key] ?? 'direct / none';
          (acc[k] ??= new Set()).add(r.session_id);
          return acc;
        }, {})
    )
      .map(([label, s]) => ({ label, sessions: s.size, rate: pct(s.size, visitors.size) }))
      .sort((a, b) => b.sessions - a.sessions);

  // ── Daily series ───────────────────────────────────────────────────
  const byDay: Record<string, { visitors: Set<string>; unmutes: Set<string>; leads: Set<string> }> = {};
  for (const r of rows) {
    const d = r.created_at.slice(0, 10);
    byDay[d] ??= { visitors: new Set(), unmutes: new Set(), leads: new Set() };
    if (r.event === 'vsl_page_view') byDay[d].visitors.add(r.session_id);
    if (r.event === 'vsl_unmute_click') byDay[d].unmutes.add(r.session_id);
    if (r.event === 'vsl_form_submit') byDay[d].leads.add(r.session_id);
  }
  const daily = Object.entries(byDay)
    .map(([date, v]) => ({ date, visitors: v.visitors.size, unmutes: v.unmutes.size, leads: v.leads.size }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return Response.json({
    days,
    totalEvents: rows.length,
    truncated: rows.length >= MAX_ROWS,
    funnel: {
      visitors: visitors.size,
      unmuted: unmuted.size,
      unmutedRate: pct(unmuted.size, visitors.size),
      video25: sessionsFor('vsl_video_25').size,
      video50: sessionsFor('vsl_video_50').size,
      video75: sessionsFor('vsl_video_75').size,
      videoComplete: sessionsFor('vsl_video_complete').size,
      formStart: formStart.size,
      formStartRate: pct(formStart.size, visitors.size),
      submitted: submitted.size,
      submitRate: pct(submitted.size, visitors.size),
      formCompletionRate: pct(submitted.size, formStart.size),
    },
    formSteps,
    testimonialPlays,
    devices: splitBy('device'),
    campaigns: splitBy('utm_campaign'),
    daily,
  });
}
