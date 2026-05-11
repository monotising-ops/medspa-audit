'use client';

import { useState, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  ResultContent,
  GradeTier,
  ContentType,
  Domain,
  RevenueTier,
  Grade,
} from '@/types';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const SCORED_DOMAINS: { value: Domain; label: string }[] = [
  { value: 'lead_gen', label: 'Lead Gen' },
  { value: 'speed_to_lead', label: 'Speed-to-Lead' },
  { value: 'booking', label: 'Booking' },
  { value: 'attribution', label: 'Attribution' },
  { value: 'growth', label: 'Growth' },
];

const CONTENT_SECTIONS: { type: ContentType; label: string; description: string }[] = [
  { type: 'analysis', label: 'Analysis', description: 'Score-range based text shown in results' },
  { type: 'best_practice', label: 'Best Practice', description: 'One per domain' },
  { type: 'tip', label: 'Actionable Tip', description: 'One per domain' },
  { type: 'recommendation', label: 'Recommendations', description: 'Per revenue tier' },
];

const REVENUE_TIERS: { value: RevenueTier; label: string }[] = [
  { value: 'under_20k', label: 'Under $20K/mo' },
  { value: '20k_50k', label: '$20K–$50K/mo' },
  { value: '50k_100k', label: '$50K–$100K/mo' },
  { value: '100k_150k', label: '$100K–$150K/mo' },
  { value: '150k_plus', label: '$150K+/mo' },
];

const GRADE_ROWS: { grade: Grade; label: string }[] = [
  { grade: 'critical', label: 'Critical' },
  { grade: 'underperforming', label: 'Underperforming' },
  { grade: 'functional', label: 'Functional' },
  { grade: 'strong', label: 'Strong' },
];

// ─── Shared UI ────────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#f5f5f5] placeholder-[#52525b] focus:outline-none focus:border-[#3b82f6] transition-colors';

const selectClass =
  'w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#f5f5f5] focus:outline-none focus:border-[#3b82f6] transition-colors appearance-none';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
      {children}
    </label>
  );
}

function scoreRangeLabel(min: number, max: number): string {
  if (max <= 3) return `Low: ${min}–${max} pts`;
  if (max <= 7) return `Mid: ${min}–${max} pts`;
  return `High: ${min}–${max} pts`;
}

function revenueTierLabel(tier: RevenueTier | null): string {
  if (!tier) return 'All Tiers';
  return REVENUE_TIERS.find((t) => t.value === tier)?.label ?? tier;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ResultsContentManagerProps {
  contents: ResultContent[];
  gradeTiers: GradeTier[];
  onUpdate: (id: string, body: Partial<ResultContent>) => Promise<void>;
  onCreate: (content: Partial<ResultContent>) => Promise<ResultContent>;
  onDelete: (id: string) => Promise<void>;
  onUpdateGradeTier: (id: string, data: Partial<GradeTier>) => Promise<void>;
  onUploadImage: (file: File, domain: string) => Promise<string>;
}

// ─── Add Content Form ─────────────────────────────────────────────────────────

interface AddContentFormProps {
  domain: Domain;
  contentType: ContentType;
  onSave: (partial: Partial<ResultContent>) => Promise<void>;
  onCancel: () => void;
}

function AddContentForm({ domain, contentType, onSave, onCancel }: AddContentFormProps) {
  const [body, setBody] = useState('');
  const [scoreMin, setScoreMin] = useState(0);
  const [scoreMax, setScoreMax] = useState(5);
  const [revenueTier, setRevenueTier] = useState<RevenueTier | ''>('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!body.trim()) {
      toast.error('Body text is required');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        domain,
        content_type: contentType,
        body: body.trim(),
        score_range_min: scoreMin,
        score_range_max: scoreMax,
        revenue_tier: contentType === 'recommendation' && revenueTier ? revenueTier : null,
        image_url: null,
      });
      toast.success('Content created');
    } catch {
      toast.error('Failed to create content');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#3b82f6]/30 bg-[#0d1117] p-4 space-y-3">
      <p className="text-xs font-semibold text-[#3b82f6] uppercase tracking-wide">
        New {CONTENT_SECTIONS.find((s) => s.type === contentType)?.label}
      </p>

      {contentType === 'analysis' && (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SectionLabel>Score Min</SectionLabel>
            <input
              type="number"
              value={scoreMin}
              min={0}
              onChange={(e) => setScoreMin(Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div className="flex-1">
            <SectionLabel>Score Max</SectionLabel>
            <input
              type="number"
              value={scoreMax}
              min={0}
              onChange={(e) => setScoreMax(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
      )}

      {contentType === 'recommendation' && (
        <div>
          <SectionLabel>Revenue Tier</SectionLabel>
          <select
            value={revenueTier}
            onChange={(e) => setRevenueTier(e.target.value as RevenueTier | '')}
            className={selectClass}
          >
            <option value="">— Select tier —</option>
            {REVENUE_TIERS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <SectionLabel>Body Text</SectionLabel>
        <textarea
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Use {spa_name} and {treatments} as placeholders…"
          className={cn(inputClass, 'resize-none leading-relaxed')}
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-[#3b82f6] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2563eb] disabled:opacity-50 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Creating…' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs text-[#a1a1aa] hover:text-[#f5f5f5] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Content Entry Card ───────────────────────────────────────────────────────

interface ContentEntryCardProps {
  entry: ResultContent;
  onUpdate: (id: string, body: Partial<ResultContent>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUploadImage: (file: File, domain: string) => Promise<string>;
}

function ContentEntryCard({
  entry,
  onUpdate,
  onDelete,
  onUploadImage,
}: ContentEntryCardProps) {
  const [body, setBody] = useState(entry.body);
  const [imageUrl, setImageUrl] = useState(entry.image_url);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const showImage =
    entry.content_type === 'analysis' || entry.content_type === 'best_practice';
  const showScoreRange = entry.content_type === 'analysis';
  const showRevenueTier = entry.content_type === 'recommendation';

  async function handleSave() {
    setSaving(true);
    try {
      await onUpdate(entry.id, { body, image_url: imageUrl });
      toast.success('Content saved');
    } catch {
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await onUploadImage(file, entry.domain);
      setImageUrl(url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleDeleteClick() {
    if (confirmDelete) {
      onDelete(entry.id).catch(() => toast.error('Failed to delete content'));
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  }

  return (
    <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-4 space-y-3">
      {/* Meta label row */}
      <div className="flex items-center gap-2 flex-wrap">
        {showScoreRange && (
          <span className="rounded-full bg-[#3b82f6]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#3b82f6] uppercase tracking-wide">
            {scoreRangeLabel(entry.score_range_min, entry.score_range_max)}
          </span>
        )}
        {showRevenueTier && (
          <span className="rounded-full bg-[#a855f7]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#a855f7] uppercase tracking-wide">
            {revenueTierLabel(entry.revenue_tier)}
          </span>
        )}
      </div>

      {/* Body textarea */}
      <div>
        <textarea
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={cn(inputClass, 'resize-y leading-relaxed')}
          placeholder="Enter content body…"
        />
        <p className="mt-1 text-[10px] text-[#52525b]">
          Placeholders: <code className="text-[#3b82f6]">{'{spa_name}'}</code>{' '}
          <code className="text-[#3b82f6]">{'{treatments}'}</code>
        </p>
      </div>

      {/* Image upload */}
      {showImage && (
        <div>
          {imageUrl && (
            <div className="mb-2 flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Content"
                className="h-16 w-24 rounded-md object-cover border border-[#2a2a2a]"
              />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="text-xs text-[#71717a] hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-2.5 py-1.5 text-xs text-[#a1a1aa] hover:border-[#3b82f6] hover:text-[#f5f5f5] disabled:opacity-50 transition-colors"
          >
            <Upload className="w-3 h-3" />
            {uploading ? 'Uploading…' : imageUrl ? 'Replace Image' : 'Upload Image'}
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-[#3b82f6] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2563eb] disabled:opacity-50 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            confirmDelete
              ? 'bg-red-500/20 text-red-400'
              : 'border border-[#2a2a2a] text-[#71717a] hover:text-red-400 hover:border-red-500/30',
          )}
        >
          <Trash2 className="w-3.5 h-3.5" />
          {confirmDelete ? 'Confirm Delete' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

// ─── Accordion Section ────────────────────────────────────────────────────────

interface AccordionSectionProps {
  title: string;
  description: string;
  entries: ResultContent[];
  contentType: ContentType;
  domain: Domain;
  onUpdate: (id: string, body: Partial<ResultContent>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUploadImage: (file: File, domain: string) => Promise<string>;
  onAdd: (partial: Partial<ResultContent>) => Promise<ResultContent>;
}

function AccordionSection({
  title,
  description,
  entries,
  contentType,
  domain,
  onUpdate,
  onDelete,
  onUploadImage,
  onAdd,
}: AccordionSectionProps) {
  const [open, setOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="rounded-xl border border-[#1f1f1f] bg-[#0d0d0d] overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#111111] transition-colors"
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronDown className="w-4 h-4 text-[#71717a] flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#71717a] flex-shrink-0" />
          )}
          <div className="text-left">
            <span className="text-sm font-semibold text-[#f5f5f5]">{title}</span>
            <span className="ml-2 text-xs text-[#52525b]">{description}</span>
          </div>
        </div>
        <span className="rounded-full bg-[#1f1f1f] px-2 py-0.5 text-xs text-[#71717a] font-medium">
          {entries.length}
        </span>
      </button>

      {/* Body */}
      {open && (
        <div className="border-t border-[#1f1f1f] p-4 space-y-3">
          {entries.length === 0 && !showAddForm && (
            <p className="text-sm text-[#52525b] text-center py-4">
              No content yet for this section.
            </p>
          )}

          {entries.map((entry) => (
            <ContentEntryCard
              key={entry.id}
              entry={entry}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onUploadImage={onUploadImage}
            />
          ))}

          {showAddForm ? (
            <AddContentForm
              domain={domain}
              contentType={contentType}
              onSave={async (partial) => {
                await onAdd(partial);
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 text-sm text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Content
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Grade Tier Row ───────────────────────────────────────────────────────────

interface GradeTierRowProps {
  tier: GradeTier;
  onSave: (id: string, data: Partial<GradeTier>) => Promise<void>;
}

function GradeTierRow({ tier, onSave }: GradeTierRowProps) {
  const [label, setLabel] = useState(tier.label);
  const [color, setColor] = useState(tier.color);
  const [minPct, setMinPct] = useState(tier.min_percent);
  const [maxPct, setMaxPct] = useState(tier.max_percent);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(tier.id, { label, color, min_percent: minPct, max_percent: maxPct });
      toast.success(`${tier.grade} tier saved`);
    } catch {
      toast.error('Failed to save grade tier');
    } finally {
      setSaving(false);
    }
  }

  const gradeDisplayName =
    tier.grade.charAt(0).toUpperCase() + tier.grade.slice(1);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#1f1f1f] bg-[#111111] px-4 py-3">
      {/* Grade name */}
      <div className="w-28 flex-shrink-0">
        <span className="text-sm font-semibold text-[#f5f5f5]">{gradeDisplayName}</span>
      </div>

      {/* Color swatch + picker */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          className="w-6 h-6 rounded-full border border-[#2a2a2a] flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
          title="Pick color"
        />
        <input
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          maxLength={7}
          className="w-20 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-2 py-1 text-xs font-mono text-[#f5f5f5] focus:outline-none focus:border-[#3b82f6]"
        />
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label text…"
          className={inputClass}
        />
      </div>

      {/* Percent range */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <input
          type="number"
          value={minPct}
          min={0}
          max={100}
          onChange={(e) => setMinPct(Number(e.target.value))}
          className="w-14 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-2 py-2 text-xs text-center text-[#f5f5f5] focus:outline-none focus:border-[#3b82f6]"
          title="Min %"
        />
        <span className="text-xs text-[#52525b]">–</span>
        <input
          type="number"
          value={maxPct}
          min={0}
          max={100}
          onChange={(e) => setMaxPct(Number(e.target.value))}
          className="w-14 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-2 py-2 text-xs text-center text-[#f5f5f5] focus:outline-none focus:border-[#3b82f6]"
          title="Max %"
        />
        <span className="text-xs text-[#52525b]">%</span>
      </div>

      {/* Save */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-[#3b82f6] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2563eb] disabled:opacity-50 transition-colors"
      >
        <Save className="w-3.5 h-3.5" />
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function ResultsContentManager({
  contents,
  gradeTiers,
  onUpdate,
  onCreate,
  onDelete,
  onUpdateGradeTier,
  onUploadImage,
}: ResultsContentManagerProps) {
  const [activeDomain, setActiveDomain] = useState<Domain>('lead_gen');

  const domainContents = contents.filter((c) => c.domain === activeDomain);

  function sectionEntries(type: ContentType): ResultContent[] {
    return domainContents.filter((c) => c.content_type === type);
  }

  return (
    <div className="space-y-6">
      {/* Domain selector tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {SCORED_DOMAINS.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => setActiveDomain(d.value)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              activeDomain === d.value
                ? 'bg-[#3b82f6] text-white'
                : 'bg-[#111111] text-[#a1a1aa] border border-[#1f1f1f] hover:border-[#2a2a2a] hover:text-[#f5f5f5]',
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Domain label */}
      <div>
        <h2 className="text-base font-semibold text-[#f5f5f5]">
          {SCORED_DOMAINS.find((d) => d.value === activeDomain)?.label} Content
        </h2>
        <p className="text-xs text-[#52525b] mt-0.5">
          Manage content blocks displayed in results for this domain.
        </p>
      </div>

      {/* Content sections (accordion) */}
      <div className="space-y-3">
        {CONTENT_SECTIONS.map((section) => (
          <AccordionSection
            key={section.type}
            title={section.label}
            description={section.description}
            entries={sectionEntries(section.type)}
            contentType={section.type}
            domain={activeDomain}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onUploadImage={onUploadImage}
            onAdd={onCreate}
          />
        ))}
      </div>

      {/* Grade Tiers section */}
      <div className="rounded-xl border border-[#1f1f1f] bg-[#0d0d0d] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1f1f1f]">
          <h3 className="text-sm font-semibold text-[#f5f5f5]">Grade Tiers</h3>
          <p className="text-xs text-[#52525b] mt-0.5">
            Configure grade thresholds and display labels (applies to all domains).
          </p>
        </div>
        <div className="p-4 space-y-3">
          {GRADE_ROWS.map((row) => {
            const tier = gradeTiers.find((t) => t.grade === row.grade);
            if (!tier) return null;
            return (
              <GradeTierRow
                key={tier.id}
                tier={tier}
                onSave={onUpdateGradeTier}
              />
            );
          })}
          {gradeTiers.length === 0 && (
            <p className="text-sm text-[#52525b] text-center py-4">
              No grade tiers configured.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
