'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { VSLConfig } from '@/types';

// ─── Shared field components (same patterns as SequenceEditor) ────────────────

function TextField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  hint?: string;
}) {
  const base: React.CSSProperties = {
    width: '100%',
    background: '#0a0a0a',
    border: '1px solid #1e1e1e',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#f5f5f5',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: multiline ? 'vertical' : undefined,
    minHeight: multiline ? '96px' : undefined,
    lineHeight: multiline ? 1.6 : undefined,
  };
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a1a1aa', marginBottom: '6px' }}>
        {label}
      </label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={base} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={base} />
      )}
      {hint && <p style={{ fontSize: '11px', color: '#4a4a4a', margin: '5px 0 0', lineHeight: 1.5 }}>{hint}</p>}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {children}
    </div>
  );
}

function Section({
  title,
  sub,
  children,
  defaultOpen = false,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: '1px solid #171717', borderRadius: '14px', overflow: 'hidden', background: '#080808' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '12px', padding: '15px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D4A853' }}>
            {title}
          </span>
          {sub && <span style={{ display: 'block', fontSize: '12px', color: '#525252', marginTop: '4px' }}>{sub}</span>}
        </span>
        <svg
          width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"
          style={{ flexShrink: 0, color: '#525252', transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .18s' }}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>{children}</div>}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  config: VSLConfig;
  onSave: (c: VSLConfig) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VSLEditor({ config, onSave }: Props) {
  const [local, setLocal] = useState<VSLConfig>({ ...config });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof VSLConfig>(key: K, val: string) {
    setLocal((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(local);
      toast.success('VSL page saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '760px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#737373' }}>
          Everything on <span style={{ color: '#D4A853', fontWeight: 600 }}>/offer</span>, top to bottom.
        </p>
        <a href="/offer" target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Preview page ↗
        </a>
      </div>

      {/* 1 ── Hero */}
      <Section title="1 · Hero" sub="Badge, headline and the two proof pills above the video" defaultOpen>
        <Card>
          <TextField label="Badge pill (small uppercase, top of page)" value={local.hero_badge} onChange={(v) => set('hero_badge', v)} />
          <TextField label="Main headline" value={local.hero_headline} onChange={(v) => set('hero_headline', v)} multiline />
          <TextField label="Subheadline" value={local.hero_subheadline} onChange={(v) => set('hero_subheadline', v)} hint="Keep it pointing at the video — that is the job of this line." />
          <TextField label="Proof pill 1" value={local.hero_pill_1} onChange={(v) => set('hero_pill_1', v)} />
          <TextField label="Proof pill 2" value={local.hero_pill_2} onChange={(v) => set('hero_pill_2', v)} hint="Leave blank to hide." />
        </Card>
      </Section>

      {/* 2 ── Video */}
      <Section title="2 · Vertical VSL" sub="The 9:16 video and its unmute overlay" defaultOpen>
        <Card>
          <TextField
            label="Video URL (9:16 vertical MP4)"
            value={local.video_url}
            onChange={(v) => set('video_url', v)}
            placeholder="https://your-cdn.b-cdn.net/vsl.mp4"
            hint="Direct MP4 link. Use a video CDN (Bunny Stream, Cloudflare Stream) — not Supabase Storage, which caps at ~250 views a month on the free tier. Leave blank to show a placeholder."
          />
          <TextField
            label="Poster image URL"
            value={local.video_poster_url}
            onChange={(v) => set('video_poster_url', v)}
            hint="First frame shown before playback. Strongly recommended — it is the thumbnail people decide on."
          />
          <TextField
            label="Progress bar curve"
            value={local.video_progress_curve}
            onChange={(v) => set('video_progress_curve', v)}
            placeholder="0.45"
            hint="How fast the bar runs ahead of real time. 1.0 = honest and linear. 0.45 (default) shows ~48% at the 2-minute mark of a 10-minute video, then visibly slows. Lower is more aggressive; 0.1 is the floor."
          />
          <TextField label="Overlay title (red box)" value={local.video_overlay_title} onChange={(v) => set('video_overlay_title', v)} />
          <TextField
            label="Overlay call-to-action"
            value={local.video_overlay_cta}
            onChange={(v) => set('video_overlay_cta', v)}
            hint="Clicking the overlay restarts the video from 0:00 with sound and goes fullscreen."
          />
        </Card>
      </Section>

      {/* 3 ── Form */}
      <Section title="3 · Lead form" sub="Sits directly under the video">
        <Card>
          <TextField label="Headline above the form" value={local.form_headline} onChange={(v) => set('form_headline', v)} hint="Leave blank to hide." />
          <TextField label="Submit button text" value={local.hero_cta_text} onChange={(v) => set('hero_cta_text', v)} />
          <TextField label="Reassurance line below the form" value={local.hero_tagline} onChange={(v) => set('hero_tagline', v)} />
          <TextField label="Calendly URL" value={local.calendly_url} onChange={(v) => set('calendly_url', v)} placeholder="https://calendly.com/your-link" hint="Used on /offer/booked after submission." />
        </Card>
      </Section>

      {/* 4 ── Client results */}
      <Section title="4 · Client results" sub="The three black-and-gold case study cards">
        <Card>
          <TextField label="Section eyebrow" value={local.proof_eyebrow} onChange={(v) => set('proof_eyebrow', v)} />
          <TextField label="Section headline" value={local.proof_headline} onChange={(v) => set('proof_headline', v)} />
        </Card>

        {([1, 2, 3] as const).map((n) => (
          <Card key={n}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#D4A853', margin: 0 }}>Card {n}</p>
            <TextField label="Client / clinic name" value={local[`t${n}_name`]} onChange={(v) => set(`t${n}_name`, v)} placeholder="Aman & Niel | Med Spa" />
            <TextField label="Headline metric (large gold text)" value={local[`t${n}_metric`]} onChange={(v) => set(`t${n}_metric`, v)} placeholder="+$17.7K Collected" />
            <TextField label="Qualifier under the metric" value={local[`t${n}_subtitle`]} onChange={(v) => set(`t${n}_subtitle`, v)} placeholder="On Half The Ad Spend" />
            <TextField label="Story paragraph" value={local[`t${n}_body`]} onChange={(v) => set(`t${n}_body`, v)} multiline />
            <TextField label="Case study video URL (optional)" value={local[`t${n}_video_url`]} onChange={(v) => set(`t${n}_video_url`, v)} />
            <TextField label="Video poster URL (optional)" value={local[`t${n}_poster_url`]} onChange={(v) => set(`t${n}_poster_url`, v)} hint="A poster with no video URL renders as a still image. Leave both blank to hide the media area. Clear the name and metric to hide the whole card." />
          </Card>
        ))}

        <Card>
          <TextField label="Results disclaimer" value={local.proof_disclaimer} onChange={(v) => set('proof_disclaimer', v)} multiline hint="Shown under the cards. Keep this — it is your earnings-claim cover." />
        </Card>
      </Section>

      {/* 5 ── How it works */}
      <Section title="5 · How it works" sub="The gold step rail near the bottom of the page">
        <Card>
          <TextField label="Eyebrow" value={local.how_eyebrow} onChange={(v) => set('how_eyebrow', v)} />
          <TextField label="Headline (white part)" value={local.how_headline} onChange={(v) => set('how_headline', v)} placeholder="The System Behind" />
          <TextField label="Headline (gold part)" value={local.how_headline_accent} onChange={(v) => set('how_headline_accent', v)} placeholder="Fully Booked Clinics" />
          <TextField label="Subtext" value={local.how_subtext} onChange={(v) => set('how_subtext', v)} multiline />
        </Card>

        {([1, 2, 3] as const).map((n) => (
          <Card key={n}>
            <TextField label={`Step ${n} label`} value={local[`step${n}_label`]} onChange={(v) => set(`step${n}_label`, v)} placeholder={`STEP ${n} — DIAGNOSE`} hint="Clear this to hide the whole step." />
            {([1, 2, 3] as const).map((m) => (
              <div key={m} style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '12px', borderLeft: '2px solid #1a1a1a' }}>
                <TextField label={`Item ${m} — title`} value={local[`step${n}_item${m}_title`]} onChange={(v) => set(`step${n}_item${m}_title`, v)} hint={m === 3 ? 'Blank titles are skipped, so a step can have 1, 2 or 3 items.' : undefined} />
                <TextField label={`Item ${m} — body`} value={local[`step${n}_item${m}_body`]} onChange={(v) => set(`step${n}_item${m}_body`, v)} multiline />
              </div>
            ))}
          </Card>
        ))}
      </Section>

      {/* 6 ── Footer */}
      <Section title="6 · Footer" sub="Company line, compliance text and policy links">
        <Card>
          <TextField label="Company name" value={local.footer_company} onChange={(v) => set('footer_company', v)} />
          <TextField label="Disclaimer / compliance text" value={local.footer_disclaimer} onChange={(v) => set('footer_disclaimer', v)} multiline hint="Meta requires the 'not affiliated with Facebook' language when you run ads to this page." />
          <TextField label="Privacy Policy URL" value={local.footer_privacy_url} onChange={(v) => set('footer_privacy_url', v)} hint="Link is hidden while blank. Meta ad review does check for this." />
          <TextField label="Terms URL" value={local.footer_terms_url} onChange={(v) => set('footer_terms_url', v)} />
        </Card>
      </Section>

      {/* 7 ── Thank-you page */}
      <Section title="7 · Thank-you page" sub="Everything on /offer/booked after they submit">
        <Card>
          <TextField label="Headline (with their name)" value={local.booked_headline} onChange={(v) => set('booked_headline', v)} hint="Use {name} where their first name should appear." />
          <TextField label="Headline (name unknown)" value={local.booked_headline_fallback} onChange={(v) => set('booked_headline_fallback', v)} />
          <TextField label="Subtext under the headline" value={local.booked_subtext} onChange={(v) => set('booked_subtext', v)} multiline />
        </Card>

        <Card>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#D4A853', margin: 0 }}>&ldquo;On the call&rdquo; section</p>
          <TextField label="Eyebrow" value={local.booked_expect_eyebrow} onChange={(v) => set('booked_expect_eyebrow', v)} />
          <TextField label="Headline" value={local.booked_expect_headline} onChange={(v) => set('booked_expect_headline', v)} />
          {([1, 2, 3] as const).map((n) => (
            <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '12px', borderLeft: '2px solid #1a1a1a' }}>
              <TextField label={`Point ${n} — title`} value={local[`booked_expect${n}_title`]} onChange={(v) => set(`booked_expect${n}_title`, v)} hint={n === 3 ? 'Clear a title to hide that point.' : undefined} />
              <TextField label={`Point ${n} — body`} value={local[`booked_expect${n}_body`]} onChange={(v) => set(`booked_expect${n}_body`, v)} multiline />
            </div>
          ))}
        </Card>

        <Card>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#D4A853', margin: 0 }}>Proof stats row</p>
          {([1, 2, 3, 4] as const).map((n) => (
            <div key={n} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
              <TextField label={`Stat ${n} — value`} value={local[`booked_stat${n}_value`]} onChange={(v) => set(`booked_stat${n}_value`, v)} placeholder="4.43×" />
              <TextField label={`Stat ${n} — label`} value={local[`booked_stat${n}_label`]} onChange={(v) => set(`booked_stat${n}_label`, v)} placeholder="Avg ROAS for active clients" />
            </div>
          ))}
        </Card>
      </Section>

      {/* Sticky save */}
      <div style={{ position: 'sticky', bottom: 0, paddingTop: '14px', background: 'linear-gradient(180deg, transparent, #050505 42%)' }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '13px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
            border: 'none', background: saving ? '#1e1e1e' : '#D4A853', color: saving ? '#525252' : '#0a0a0a',
            cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
          }}
        >
          {saving ? 'Saving…' : 'Save VSL Page'}
        </button>
      </div>
    </div>
  );
}
