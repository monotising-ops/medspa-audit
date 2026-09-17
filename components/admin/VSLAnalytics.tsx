'use client';

import { useCallback, useEffect, useState } from 'react';

const GOLD = '#D4A853';
const GOLD_LT = '#E8C26A';

interface FunnelData {
  visitors: number;
  unmuted: number; unmutedRate: number;
  video25: number; video50: number; video75: number; videoComplete: number;
  formStart: number; formStartRate: number;
  submitted: number; submitRate: number; formCompletionRate: number;
}
interface StepRow { step: number; label: string; reached: number; continued: number; dropped: number; dropRate: number }
interface Split { label: string; sessions: number; rate: number }
interface DayRow { date: string; visitors: number; unmutes: number; leads: number }

interface Analytics {
  days: number;
  totalEvents: number;
  truncated: boolean;
  funnel: FunnelData;
  formSteps: StepRow[];
  testimonialPlays: Split[];
  devices: Split[];
  campaigns: Split[];
  daily: DayRow[];
  error?: string;
  needsMigration?: boolean;
}

const MIGRATION_SQL = `create table if not exists vsl_events (
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

alter table vsl_events enable row level security;`;

// ─── Bits ─────────────────────────────────────────────────────────────────────

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#0b0b0b', border: '1px solid #191919', borderRadius: '14px', padding: '18px 20px' }}>
      <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: GOLD }}>
        {title}
      </p>
      {sub && <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#525252' }}>{sub}</p>}
      <div style={{ marginTop: '16px' }}>{children}</div>
    </div>
  );
}

function FunnelBar({ label, value, of, rateLabel }: { label: string; value: number; of: number; rateLabel?: string }) {
  const pct = of > 0 ? (value / of) * 100 : 0;
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px', gap: '10px' }}>
        <span style={{ fontSize: '13px', color: '#d4d4d8', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '13px', color: '#f5f5f5', fontWeight: 700, whiteSpace: 'nowrap' }}>
          {value.toLocaleString()}
          {rateLabel && <span style={{ color: GOLD_LT, fontWeight: 600, marginLeft: '8px' }}>{rateLabel}</span>}
        </span>
      </div>
      <div style={{ height: '8px', background: '#161616', borderRadius: '9999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.max(pct, value > 0 ? 1.5 : 0)}%`, background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LT})`, borderRadius: '9999px', transition: 'width .4s' }} />
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'gold' | 'plain' }) {
  return (
    <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '13px 14px' }}>
      <p style={{ margin: 0, fontSize: '11px', color: '#6b6b6b', fontWeight: 500 }}>{label}</p>
      <p style={{ margin: '5px 0 0', fontSize: '21px', fontWeight: 800, letterSpacing: '-0.02em', color: tone === 'gold' ? GOLD_LT : '#f5f5f5' }}>
        {value}
      </p>
    </div>
  );
}

function SplitList({ rows, empty }: { rows: Split[]; empty: string }) {
  if (!rows.length) return <p style={{ margin: 0, fontSize: '13px', color: '#525252' }}>{empty}</p>;
  const max = Math.max(...rows.map((r) => r.sessions), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {rows.map((r) => (
        <div key={r.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '5px' }}>
            <span style={{ fontSize: '13px', color: '#d4d4d8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
            <span style={{ fontSize: '12.5px', color: '#8a8a8a', whiteSpace: 'nowrap' }}>
              {r.sessions.toLocaleString()} · {r.rate}%
            </span>
          </div>
          <div style={{ height: '5px', background: '#161616', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(r.sessions / max) * 100}%`, background: 'rgba(212,168,83,0.55)', borderRadius: '9999px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VSLAnalytics({ token }: { token: string }) {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?days=${days}`, { headers: { 'x-admin-token': token } });
      setData(await res.json());
    } catch {
      setData({ error: 'Could not load analytics' } as Analytics);
    } finally {
      setLoading(false);
    }
  }, [days, token]);

  useEffect(() => { void load(); }, [load]);

  if (loading && !data) {
    return <p style={{ fontSize: '13px', color: '#525252' }}>Loading metrics…</p>;
  }

  if (data?.needsMigration) {
    return (
      <div style={{ maxWidth: '720px' }}>
        <Panel title="One step left" sub="The vsl_events table does not exist yet, so there is nothing to measure.">
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#a1a1aa', lineHeight: 1.65 }}>
            Paste this into your Supabase <strong style={{ color: '#f5f5f5' }}>SQL Editor</strong> and run it. Tracking starts
            the moment it exists — no redeploy needed.
          </p>
          <pre
            style={{
              margin: 0, background: '#060606', border: '1px solid #1a1a1a', borderRadius: '10px',
              padding: '14px', fontSize: '11.5px', lineHeight: 1.6, color: '#9a9a9a',
              overflowX: 'auto', fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {MIGRATION_SQL}
          </pre>
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button
              type="button"
              onClick={() => { void navigator.clipboard.writeText(MIGRATION_SQL); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              style={{ padding: '9px 16px', borderRadius: '8px', border: 'none', background: GOLD, color: '#0a0a0a', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              {copied ? 'Copied ✓' : 'Copy SQL'}
            </button>
            <button
              type="button"
              onClick={() => void load()}
              style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #262626', background: '#111', color: '#a1a1aa', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              Check again
            </button>
          </div>
        </Panel>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <Panel title="Analytics unavailable" sub={data?.error ?? 'Unknown error'}>
        <button type="button" onClick={() => void load()} style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #262626', background: '#111', color: '#a1a1aa', fontSize: '13px', cursor: 'pointer' }}>
          Retry
        </button>
      </Panel>
    );
  }

  const f = data.funnel;
  const v = f.visitors;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '860px', paddingBottom: '60px' }}>
      {/* Range */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {[1, 7, 30, 90].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDays(d)}
            style={{
              padding: '7px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
              border: days === d ? `1px solid ${GOLD}` : '1px solid #1e1e1e',
              background: days === d ? 'rgba(212,168,83,0.12)' : '#0d0d0d',
              color: days === d ? GOLD_LT : '#737373',
            }}
          >
            {d === 1 ? 'Today' : `${d} days`}
          </button>
        ))}
        <button
          type="button"
          onClick={() => void load()}
          style={{ marginLeft: 'auto', padding: '7px 14px', borderRadius: '8px', fontSize: '12.5px', border: '1px solid #1e1e1e', background: '#0d0d0d', color: '#737373', cursor: 'pointer' }}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {v === 0 && (
        <p style={{ margin: 0, fontSize: '13px', color: '#525252', lineHeight: 1.6 }}>
          No visits recorded in this window yet. Open <a href="/offer" target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>/offer</a> in a
          new tab and the first session will show up here on refresh.
        </p>
      )}

      {/* Headline numbers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
        <Stat label="Visitors" value={v.toLocaleString()} />
        <Stat label="Unmuted the video" value={`${f.unmutedRate}%`} tone="gold" />
        <Stat label="Started the form" value={`${f.formStartRate}%`} tone="gold" />
        <Stat label="Leads submitted" value={f.submitted.toLocaleString()} tone="gold" />
      </div>

      {/* Funnel */}
      <Panel title="Funnel" sub="Unique sessions, each stage as a share of total visitors">
        <FunnelBar label="Landed on the page" value={v} of={v} />
        <FunnelBar label="Clicked to unmute" value={f.unmuted} of={v} rateLabel={`${f.unmutedRate}%`} />
        <FunnelBar label="Started the form" value={f.formStart} of={v} rateLabel={`${f.formStartRate}%`} />
        <FunnelBar label="Submitted a lead" value={f.submitted} of={v} rateLabel={`${f.submitRate}%`} />
      </Panel>

      {/* Video depth */}
      <Panel title="Video watch depth" sub="Measured after unmute — silent preroll is not watching">
        <FunnelBar label="Reached 25%" value={f.video25} of={f.unmuted || 1} />
        <FunnelBar label="Reached 50%" value={f.video50} of={f.unmuted || 1} />
        <FunnelBar label="Reached 75%" value={f.video75} of={f.unmuted || 1} />
        <FunnelBar label="Finished" value={f.videoComplete} of={f.unmuted || 1} />
      </Panel>

      {/* Form drop-off */}
      <Panel title="Where the form loses people" sub={`${f.formCompletionRate}% of everyone who starts the form finishes it`}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '440px' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#6b6b6b' }}>
                <th style={{ padding: '0 10px 9px 0', fontWeight: 500 }}>Question</th>
                <th style={{ padding: '0 10px 9px 0', fontWeight: 500, textAlign: 'right' }}>Reached</th>
                <th style={{ padding: '0 10px 9px 0', fontWeight: 500, textAlign: 'right' }}>Continued</th>
                <th style={{ padding: '0 0 9px 0', fontWeight: 500, textAlign: 'right' }}>Abandoned</th>
              </tr>
            </thead>
            <tbody>
              {data.formSteps.map((s) => (
                <tr key={s.step} style={{ borderTop: '1px solid #171717' }}>
                  <td style={{ padding: '11px 10px 11px 0', color: '#d4d4d8' }}>
                    <span style={{ color: '#525252', marginRight: '8px' }}>{s.step}</span>{s.label}
                  </td>
                  <td style={{ padding: '11px 10px 11px 0', textAlign: 'right', color: '#f5f5f5' }}>{s.reached.toLocaleString()}</td>
                  <td style={{ padding: '11px 10px 11px 0', textAlign: 'right', color: '#8a8a8a' }}>{s.continued.toLocaleString()}</td>
                  <td style={{ padding: '11px 0', textAlign: 'right', color: s.dropRate >= 40 && s.reached > 0 ? '#ef6b6b' : '#8a8a8a', fontWeight: s.dropRate >= 40 ? 700 : 400 }}>
                    {s.dropped.toLocaleString()}{s.reached > 0 && ` · ${s.dropRate}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Testimonials + device */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        <Panel title="Testimonial video plays" sub="Which case study earns the click">
          <SplitList rows={data.testimonialPlays} empty="No plays yet. Needs a video URL on at least one card." />
        </Panel>
        <Panel title="Device" sub="Share of visitors">
          <SplitList rows={data.devices} empty="No visits yet." />
        </Panel>
      </div>

      <Panel title="Campaign" sub="From the utm_campaign on your ad links">
        <SplitList rows={data.campaigns} empty="No visits yet." />
      </Panel>

      {/* Daily */}
      {data.daily.length > 0 && (
        <Panel title="By day" sub="Visitors · unmutes · leads">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '360px' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#6b6b6b' }}>
                  <th style={{ padding: '0 10px 9px 0', fontWeight: 500 }}>Date</th>
                  <th style={{ padding: '0 10px 9px 0', fontWeight: 500, textAlign: 'right' }}>Visitors</th>
                  <th style={{ padding: '0 10px 9px 0', fontWeight: 500, textAlign: 'right' }}>Unmutes</th>
                  <th style={{ padding: '0 0 9px 0', fontWeight: 500, textAlign: 'right' }}>Leads</th>
                </tr>
              </thead>
              <tbody>
                {[...data.daily].reverse().map((d) => (
                  <tr key={d.date} style={{ borderTop: '1px solid #171717' }}>
                    <td style={{ padding: '10px 10px 10px 0', color: '#d4d4d8' }}>{d.date}</td>
                    <td style={{ padding: '10px 10px 10px 0', textAlign: 'right', color: '#f5f5f5' }}>{d.visitors}</td>
                    <td style={{ padding: '10px 10px 10px 0', textAlign: 'right', color: GOLD_LT }}>{d.unmutes}</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', color: GOLD_LT, fontWeight: 700 }}>{d.leads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <p style={{ margin: 0, fontSize: '11.5px', color: '#3d3d3d', lineHeight: 1.6 }}>
        {data.totalEvents.toLocaleString()} events in the last {data.days} day{data.days === 1 ? '' : 's'}.
        {data.truncated && ' Capped at 100,000 — narrow the range for exact numbers.'}
        {' '}First-party and cookie-free, so these numbers are not affected by ad blockers or Safari tracking limits.
      </p>
    </div>
  );
}
