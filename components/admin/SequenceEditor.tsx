'use client';

import { useState, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import type { CoverConfig, GateConfig, ResultsCTAConfig } from '@/types';
import { cn } from '@/lib/utils';

// ─── Toggle Switch ────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
}

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        className="relative flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
        style={{
          width: 40,
          height: 24,
          backgroundColor: checked ? '#3b82f6' : '#333333',
        }}
      >
        <span
          className="absolute top-[3px] rounded-full bg-white shadow-sm transition-transform duration-200"
          style={{
            width: 18,
            height: 18,
            left: 3,
            transform: checked ? 'translateX(16px)' : 'translateX(0)',
          }}
        />
      </div>
      {label && <span className="text-sm text-[#a1a1aa]">{label}</span>}
    </label>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#161616] transition-colors"
      >
        <span className="text-base font-semibold text-white">{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-[#71717a]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#71717a]" />
        )}
      </button>
      {open && (
        <div className="px-6 pb-6 border-t border-[#1f1f1f]">
          <div className="pt-5">{children}</div>
        </div>
      )}
    </div>
  );
}

// ─── Field Helpers ────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-[#a1a1aa] mb-1.5">
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder-[#52525b] focus:outline-none focus:border-[#3b82f6] transition-colors';

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(inputClass, 'resize-none leading-relaxed')}
      />
    </div>
  );
}

function SaveButton({
  onClick,
  saving,
}: {
  onClick: () => void;
  saving: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="mt-6 rounded-lg bg-[#3b82f6] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {saving ? 'Saving…' : 'Save Section'}
    </button>
  );
}

// ─── Cover Section ────────────────────────────────────────────────────────────

function CoverSection({
  config,
  onSave,
  onUploadImage,
}: {
  config: CoverConfig;
  onSave: (c: CoverConfig) => Promise<void>;
  onUploadImage: (file: File, section: string) => Promise<string>;
}) {
  const [local, setLocal] = useState<CoverConfig>({ ...config });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof CoverConfig>(key: K, val: CoverConfig[K]) {
    setLocal((prev) => ({ ...prev, [key]: val }));
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await onUploadImage(file, 'cover');
      set('background_image_url', url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleHeroImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    try {
      const url = await onUploadImage(file, 'cover-hero');
      set('hero_image_url', url);
      toast.success('Hero image uploaded');
    } catch {
      toast.error('Hero image upload failed');
    } finally {
      setUploadingHero(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(local);
      toast.success('Cover settings saved');
    } catch {
      toast.error('Failed to save cover settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <TextAreaField
        label="Headline"
        value={local.headline}
        onChange={(v) => set('headline', v)}
        rows={3}
        placeholder="Your audit headline…"
      />
      <TextAreaField
        label="Subtext"
        value={local.subtext}
        onChange={(v) => set('subtext', v)}
        rows={3}
        placeholder="Supporting subtitle…"
      />
      <TextField
        label="CTA Button Text"
        value={local.cta_text}
        onChange={(v) => set('cta_text', v)}
        placeholder="Start My Free Audit"
      />
      <TextField
        label="Trust Line (shown if no bullets)"
        value={local.trust_line}
        onChange={(v) => set('trust_line', v)}
        placeholder="Takes 3 minutes · 100% free"
      />

      <div className="space-y-3 pt-1">
        <Toggle
          checked={local.show_banner !== false}
          onChange={(v) => set('show_banner', v)}
          label="Show social proof banner at top"
        />
      </div>

      <TextField
        label="Banner Text"
        value={local.banner_text ?? ''}
        onChange={(v) => set('banner_text', v)}
        placeholder="200+ Med Spas Audited · Takes 3 Minutes · Free"
      />

      <TextAreaField
        label="Trust Bullets (one per line)"
        value={local.trust_bullets ?? ''}
        onChange={(v) => set('trust_bullets', v)}
        rows={4}
        placeholder={"Personalized to your revenue tier\nIdentifies your biggest bottleneck\nActionable, not generic"}
      />

      <TextField
        label="Scrolling Ticker Text"
        value={local.ticker_text ?? ''}
        onChange={(v) => set('ticker_text', v)}
        placeholder="Lead Generation · Speed-to-Lead · Booking · "
      />

      <div>
        <Label>Questions on Cover Page (0 = none, max 4)</Label>
        <input
          type="number"
          min={0}
          max={4}
          value={local.cover_questions_count ?? 2}
          onChange={(e) => set('cover_questions_count', parseInt(e.target.value, 10))}
          className={inputClass}
          style={{ maxWidth: '80px' }}
        />
        <p className="text-xs text-[#52525b] mt-1">Number of intake questions to embed in the cover page</p>
      </div>

      <div>
        <Label>Hero Image (replaces card mockups — use a PNG with transparent background)</Label>
        {local.hero_image_url && (
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={local.hero_image_url}
              alt="Hero preview"
              className="h-28 rounded-md object-contain border border-[#2a2a2a]"
              style={{ background: 'repeating-conic-gradient(#1a1a1a 0% 25%, #111 0% 50%) 0 0 / 16px 16px' }}
            />
          </div>
        )}
        <input
          ref={heroFileRef}
          type="file"
          accept="image/*"
          onChange={handleHeroImageChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => heroFileRef.current?.click()}
          disabled={uploadingHero}
          className="rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-2 text-sm text-[#a1a1aa] hover:border-[#3b82f6] hover:text-white disabled:opacity-50 transition-colors"
        >
          {uploadingHero ? 'Uploading…' : local.hero_image_url ? 'Replace Hero Image' : 'Upload Hero Image'}
        </button>
        {local.hero_image_url && (
          <button
            type="button"
            onClick={() => set('hero_image_url', '')}
            className="ml-2 text-sm text-[#71717a] hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <div>
        <Label>Background Color</Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={local.background_color || '#050505'}
            onChange={(e) => set('background_color', e.target.value)}
            className="h-9 w-16 cursor-pointer rounded border border-[#2a2a2a] bg-transparent p-0.5"
          />
          <span className="text-sm text-[#71717a]">{local.background_color || '#050505'}</span>
        </div>
      </div>

      <div>
        <Label>Background Image</Label>
        {local.background_image_url && (
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={local.background_image_url}
              alt="Background preview"
              className="h-20 w-32 rounded-md object-cover border border-[#2a2a2a]"
            />
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-2 text-sm text-[#a1a1aa] hover:border-[#3b82f6] hover:text-white disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Uploading…' : local.background_image_url ? 'Replace Image' : 'Upload Image'}
        </button>
        {local.background_image_url && (
          <button
            type="button"
            onClick={() => set('background_image_url', '')}
            className="ml-2 text-sm text-[#71717a] hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <SaveButton onClick={handleSave} saving={saving} />
    </div>
  );
}

// ─── Gate Section ─────────────────────────────────────────────────────────────

function GateSection({
  config,
  onSave,
}: {
  config: GateConfig;
  onSave: (c: GateConfig) => Promise<void>;
}) {
  const [local, setLocal] = useState<GateConfig>({ ...config });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof GateConfig>(key: K, val: GateConfig[K]) {
    setLocal((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(local);
      toast.success('Gate settings saved');
    } catch {
      toast.error('Failed to save gate settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <TextField
        label="Headline"
        value={local.headline}
        onChange={(v) => set('headline', v)}
        placeholder="See Your Full Results"
      />
      <TextAreaField
        label="Subtext"
        value={local.subtext}
        onChange={(v) => set('subtext', v)}
        rows={3}
        placeholder="Enter your details to unlock…"
      />
      <TextField
        label="CTA Text"
        value={local.cta_text}
        onChange={(v) => set('cta_text', v)}
        placeholder="Send My Results"
      />
      <TextField
        label="Privacy Text"
        value={local.privacy_text}
        onChange={(v) => set('privacy_text', v)}
        placeholder="We never spam. Unsubscribe anytime."
      />

      <div className="space-y-3 pt-1">
        <Toggle
          checked={local.gate_enabled}
          onChange={(v) => set('gate_enabled', v)}
          label="Gate enabled (require email before showing results)"
        />
        <Toggle
          checked={local.show_spa_name_field !== false}
          onChange={(v) => set('show_spa_name_field', v)}
          label="Show spa name field"
        />
        <Toggle
          checked={local.show_phone_field === true}
          onChange={(v) => set('show_phone_field', v)}
          label="Show phone number field"
        />
      </div>

      <TextField
        label="Spa Name Field Label"
        value={local.spa_name_field_label ?? 'Med Spa Name'}
        onChange={(v) => set('spa_name_field_label', v)}
        placeholder="Med Spa Name"
      />

      <TextField
        label="Phone Field Label"
        value={local.phone_field_label ?? 'Phone Number'}
        onChange={(v) => set('phone_field_label', v)}
        placeholder="Phone Number"
      />

      <SaveButton onClick={handleSave} saving={saving} />
    </div>
  );
}

// ─── Results CTA Section ──────────────────────────────────────────────────────

function ResultsCTASection({
  config,
  onSave,
}: {
  config: ResultsCTAConfig;
  onSave: (c: ResultsCTAConfig) => Promise<void>;
}) {
  const [local, setLocal] = useState<ResultsCTAConfig>({ ...config });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ResultsCTAConfig>(key: K, val: ResultsCTAConfig[K]) {
    setLocal((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(local);
      toast.success('Results CTA settings saved');
    } catch {
      toast.error('Failed to save results CTA settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <TextField
        label="Headline"
        value={local.headline}
        onChange={(v) => set('headline', v)}
        placeholder="Ready to fix your biggest gaps?"
      />
      <TextAreaField
        label="Body"
        value={local.body}
        onChange={(v) => set('body', v)}
        rows={3}
        placeholder="Here's how we help medspa owners…"
      />
      <TextField
        label="Primary CTA Text"
        value={local.primary_cta_text}
        onChange={(v) => set('primary_cta_text', v)}
        placeholder="Book a Free Strategy Call"
      />
      <TextField
        label="Primary CTA URL"
        value={local.primary_cta_url}
        onChange={(v) => set('primary_cta_url', v)}
        placeholder="https://calendly.com/…"
      />
      <TextField
        label="Secondary CTA Text"
        value={local.secondary_cta_text}
        onChange={(v) => set('secondary_cta_text', v)}
        placeholder="Download the Full Report"
      />
      <TextField
        label="Video URL"
        value={local.video_url}
        onChange={(v) => set('video_url', v)}
        placeholder="https://youtube.com/embed/…"
      />
      <TextAreaField
        label="Case Study Text"
        value={local.case_study_text}
        onChange={(v) => set('case_study_text', v)}
        rows={3}
        placeholder="How we helped a medspa grow from…"
      />

      <div className="space-y-3 pt-1">
        <Toggle
          checked={local.show_video}
          onChange={(v) => set('show_video', v)}
          label="Show video section"
        />
        <Toggle
          checked={local.show_case_study}
          onChange={(v) => set('show_case_study', v)}
          label="Show case study section"
        />
      </div>

      <SaveButton onClick={handleSave} saving={saving} />
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

interface SequenceEditorProps {
  coverConfig: CoverConfig;
  gateConfig: GateConfig;
  ctaConfig: ResultsCTAConfig;
  onSaveCover: (config: CoverConfig) => Promise<void>;
  onSaveGate: (config: GateConfig) => Promise<void>;
  onSaveCTA: (config: ResultsCTAConfig) => Promise<void>;
  onUploadImage: (file: File, section: string) => Promise<string>;
}

export default function SequenceEditor({
  coverConfig,
  gateConfig,
  ctaConfig,
  onSaveCover,
  onSaveGate,
  onSaveCTA,
  onUploadImage,
}: SequenceEditorProps) {
  return (
    <div className="space-y-4">
      <Section title="Cover Page Settings" defaultOpen>
        <CoverSection
          config={coverConfig}
          onSave={onSaveCover}
          onUploadImage={onUploadImage}
        />
      </Section>

      <Section title="Gate Settings">
        <GateSection config={gateConfig} onSave={onSaveGate} />
      </Section>

      <Section title="Results CTA Settings">
        <ResultsCTASection config={ctaConfig} onSave={onSaveCTA} />
      </Section>
    </div>
  );
}
