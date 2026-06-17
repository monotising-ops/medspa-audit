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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
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
    minHeight: multiline ? '80px' : undefined,
  };
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a1a1aa', marginBottom: '6px' }}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={base} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={base} />
      )}
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#525252', margin: 0 }}>{title}</p>
      {sub && <p style={{ fontSize: '12px', color: '#444', marginTop: '4px' }}>{sub}</p>}
    </div>
  );
}

function SaveBtn({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      style={{
        marginTop: '8px',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
        border: 'none',
        background: saving ? '#1e1e1e' : '#3b82f6',
        color: saving ? '#525252' : '#fff',
        cursor: saving ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s',
      }}
    >
      {saving ? 'Saving…' : 'Save Changes'}
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {children}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '720px' }}>

      {/* Hero Section */}
      <div>
        <SectionTitle title="Hero Section" sub="The headline and CTA at the top of /offer" />
        <Card>
          <TextField
            label="Main Headline"
            value={local.hero_headline}
            onChange={(v) => set('hero_headline', v)}
            placeholder="Fill Your Med Spa Calendar With Booked Appointments — Not Just Leads"
          />
          <TextField
            label="Subheadline (gold accent text below headline)"
            value={local.hero_subheadline}
            onChange={(v) => set('hero_subheadline', v)}
            placeholder="Only pay when patients actually book."
          />
          <TextField
            label="CTA Button Text"
            value={local.hero_cta_text}
            onChange={(v) => set('hero_cta_text', v)}
            placeholder="Book My Free Strategy Call →"
          />
          <TextField
            label="Tagline below form (small muted text)"
            value={local.hero_tagline}
            onChange={(v) => set('hero_tagline', v)}
            placeholder="Takes 60 seconds · No credit card · Free strategy call"
          />
        </Card>
      </div>

      {/* Risk Reversal */}
      <div>
        <SectionTitle title="Risk Reversal Section" sub="The guarantee section below the form" />
        <Card>
          <TextField
            label="Headline"
            value={local.risk_headline}
            onChange={(v) => set('risk_headline', v)}
            placeholder="We put our money where our mouth is."
          />
          <TextField
            label="Body Text (shown in green)"
            value={local.risk_body}
            onChange={(v) => set('risk_body', v)}
            multiline
            placeholder="If we don't deliver real, booked appointments for your clinic — you don't pay."
          />
        </Card>
      </div>

      {/* Calendly */}
      <div>
        <SectionTitle title="Calendly URL" sub="Shown on /offer/booked after form submission" />
        <Card>
          <TextField
            label="Calendly Link"
            value={local.calendly_url}
            onChange={(v) => set('calendly_url', v)}
            placeholder="https://calendly.com/your-link-here"
          />
        </Card>
      </div>

      {/* Social Proof headline */}
      <div>
        <SectionTitle title="Social Proof Headline" sub="Above the client result cards" />
        <Card>
          <TextField
            label="Section Headline"
            value={local.proof_headline}
            onChange={(v) => set('proof_headline', v)}
            placeholder="See why clinics across the US and Canada trust Monotising"
          />
        </Card>
      </div>

      {/* Client Result Cards */}
      <div>
        <SectionTitle title="Client Result Cards" sub="The 3 before/after cards in the social proof section" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {([1, 2, 3] as const).map((n) => (
            <Card key={n}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#D4A853', margin: 0 }}>Card {n}</p>
              <TextField label="Client / Clinic Name" value={local[`result${n}_name`]} onChange={(v) => set(`result${n}_name`, v)} placeholder="Aman & Niel's Med Spa" />
              <TextField label="Location" value={local[`result${n}_location`]} onChange={(v) => set(`result${n}_location`, v)} placeholder="Local Market" />
              <TextField label="Before (shown muted)" value={local[`result${n}_before`]} onChange={(v) => set(`result${n}_before`, v)} placeholder="$7,800 adspend · 1.26× ROAS" />
              <TextField label="After Monotising (shown in gold)" value={local[`result${n}_after`]} onChange={(v) => set(`result${n}_after`, v)} placeholder="$4,060 adspend · 4.43× ROAS · $17,700+ collected" />
              <TextField label="Highlight (shown in green, with ✓)" value={local[`result${n}_highlight`]} onChange={(v) => set(`result${n}_highlight`, v)} placeholder="71 confirmed bookings in one month" />
            </Card>
          ))}
        </div>
      </div>

      <SaveBtn onClick={handleSave} saving={saving} />
    </div>
  );
}
