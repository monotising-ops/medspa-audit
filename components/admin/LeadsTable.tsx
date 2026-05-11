'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  RefreshCw,
  Download,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Lead, LeadTag, Grade, RevenueTier, AnswerRecord } from '@/types';
import { cn, formatDate, formatRevenueTier, gradeColor, domainScoreColor } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const TAG_COLORS: Record<LeadTag, { bg: string; text: string; label: string }> = {
  hot:       { bg: '#ef4444/15', text: '#ef4444', label: 'Hot' },
  warm:      { bg: '#f97316/15', text: '#f97316', label: 'Warm' },
  cool:      { bg: '#3b82f6/15', text: '#3b82f6', label: 'Cool' },
  contacted: { bg: '#a855f7/15', text: '#a855f7', label: 'Contacted' },
  booked:    { bg: '#22c55e/15', text: '#22c55e', label: 'Booked' },
};

const TAG_BG_CLASSES: Record<LeadTag, string> = {
  hot:       'bg-red-500/15 text-red-400',
  warm:      'bg-orange-500/15 text-orange-400',
  cool:      'bg-blue-500/15 text-blue-400',
  contacted: 'bg-purple-500/15 text-purple-400',
  booked:    'bg-green-500/15 text-green-400',
};

const GRADE_LABELS: Record<Grade, string> = {
  critical:      'Critical',
  underperforming: 'Underperforming',
  functional:    'Functional',
  strong:        'Strong',
};

const REVENUE_TIERS: { value: RevenueTier; label: string }[] = [
  { value: 'under_20k',   label: 'Under $20K/mo' },
  { value: '20k_50k',     label: '$20K–$50K/mo' },
  { value: '50k_100k',    label: '$50K–$100K/mo' },
  { value: '100k_150k',   label: '$100K–$150K/mo' },
  { value: '150k_plus',   label: '$150K+/mo' },
];

const DOMAIN_KEYS = [
  'lead_gen',
  'speed_to_lead',
  'booking',
  'attribution',
  'growth',
] as const;

const DOMAIN_SHORT: Record<string, string> = {
  lead_gen:      'LG',
  speed_to_lead: 'SL',
  booking:       'BK',
  attribution:   'AT',
  growth:        'GR',
};

type SortKey = 'created_at' | 'spa_name' | 'revenue_tier' | 'total_score' | 'grade' | 'name';
type SortDir = 'asc' | 'desc';

// ─── Props ────────────────────────────────────────────────────────────────────

interface LeadsTableProps {
  leads: Lead[];
  onUpdateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  onExportCSV: () => void;
  onRefresh: () => void;
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

const inputClass =
  'rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#f5f5f5] placeholder-[#52525b] focus:outline-none focus:border-[#3b82f6] transition-colors';

const selectClass =
  'rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#f5f5f5] focus:outline-none focus:border-[#3b82f6] transition-colors appearance-none';

// ─── Tag Dropdown ─────────────────────────────────────────────────────────────

interface TagDropdownProps {
  tags: LeadTag[];
  onApply: (tag: LeadTag | null) => void;
  onClose: () => void;
}

function TagDropdown({ tags, onApply, onClose }: TagDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  const allTags = Object.keys(TAG_COLORS) as LeadTag[];

  return (
    <div
      ref={ref}
      className="absolute z-50 mt-1 w-40 rounded-xl border border-[#2a2a2a] bg-[#111111] shadow-2xl py-1"
    >
      {allTags.map((tag) => {
        const active = tags.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => { onApply(active ? null : tag); onClose(); }}
            className={cn(
              'flex w-full items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-[#1f1f1f]',
              active ? TAG_BG_CLASSES[tag] : 'text-[#a1a1aa]',
            )}
          >
            {TAG_COLORS[tag].label}
            {active && <X className="w-3 h-3 opacity-60" />}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => { onApply(null); onClose(); }}
        className="flex w-full items-center px-3 py-2 text-xs text-[#52525b] hover:bg-[#1f1f1f] hover:text-[#f5f5f5] transition-colors border-t border-[#1f1f1f] mt-1"
      >
        Clear tags
      </button>
    </div>
  );
}

// ─── Domain Score Bars ────────────────────────────────────────────────────────

interface DomainScoreBarsProps {
  domainScores: Lead['domain_scores'];
  maxScore?: number;
}

function DomainScoreBars({ domainScores }: DomainScoreBarsProps) {
  return (
    <div className="flex flex-col gap-1 min-w-[80px]">
      {DOMAIN_KEYS.map((key) => {
        const score = domainScores[key] ?? 0;
        // Assume max per domain ~ 20 pts; we show percentage of 20
        const pct = Math.min(1, score / 20);
        const color = domainScoreColor(pct);
        return (
          <div key={key} className="flex items-center gap-1.5">
            <span className="text-[9px] text-[#52525b] w-5 flex-shrink-0">
              {DOMAIN_SHORT[key]}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-[#1f1f1f] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct * 100}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Notes Cell ───────────────────────────────────────────────────────────────

interface NotesCellProps {
  leadId: string;
  notes: string;
  onSave: (id: string, notes: string) => Promise<void>;
}

function NotesCell({ leadId, notes: initialNotes, onSave }: NotesCellProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialNotes);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      textareaRef.current?.focus();
    }
  }, [editing]);

  async function handleBlur() {
    setEditing(false);
    if (value !== initialNotes) {
      try {
        await onSave(leadId, value);
      } catch {
        toast.error('Failed to save note');
        setValue(initialNotes);
      }
    }
  }

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        rows={3}
        className="w-full min-w-[140px] rounded-lg border border-[#3b82f6] bg-[#0a0a0a] px-2 py-1.5 text-xs text-[#f5f5f5] resize-none focus:outline-none"
      />
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className="min-w-[140px] max-w-[180px] cursor-text rounded-md px-2 py-1.5 hover:bg-[#1f1f1f] transition-colors"
      title="Click to edit note"
    >
      {value ? (
        <span className="text-xs text-[#a1a1aa] line-clamp-2">{value}</span>
      ) : (
        <span className="text-xs text-[#3a3a3a] italic">Click to add note…</span>
      )}
    </div>
  );
}

// ─── Expanded Row ─────────────────────────────────────────────────────────────

interface ExpandedRowProps {
  lead: Lead;
  colSpan: number;
}

function ExpandedRow({ lead, colSpan }: ExpandedRowProps) {
  return (
    <tr className="bg-[#0a0a0a]">
      <td colSpan={colSpan} className="px-4 py-4 border-t border-[#1f1f1f]">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wide mb-3">
            Answer Breakdown
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {lead.answers.map((ans: AnswerRecord, i) => (
              <div
                key={i}
                className="rounded-lg border border-[#1f1f1f] bg-[#111111] px-3 py-2.5"
              >
                <p className="text-xs text-[#71717a] leading-snug mb-1.5">
                  {ans.question_text ?? `Question ${i + 1}`}
                </p>
                <p className="text-xs font-medium text-[#f5f5f5]">
                  {Array.isArray(ans.selected_label)
                    ? ans.selected_label.join(', ')
                    : ans.selected_label ?? `Option ${ans.selected_option_index}`}
                </p>
                {ans.score !== undefined && (
                  <span className="mt-1 inline-block text-[10px] text-[#3b82f6]">
                    {ans.score} pts
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Sort Header Cell ─────────────────────────────────────────────────────────

interface SortHeaderProps {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
}

function SortHeader({ label, sortKey, currentKey, currentDir, onSort }: SortHeaderProps) {
  const active = currentKey === sortKey;
  return (
    <th
      scope="col"
      onClick={() => onSort(sortKey)}
      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wide cursor-pointer select-none hover:text-[#f5f5f5] transition-colors"
    >
      <span className="flex items-center gap-1">
        {label}
        {active ? (
          currentDir === 'asc' ? (
            <ChevronUp className="w-3 h-3 text-[#3b82f6]" />
          ) : (
            <ChevronDown className="w-3 h-3 text-[#3b82f6]" />
          )
        ) : (
          <ChevronsUpDown className="w-3 h-3 opacity-30" />
        )}
      </span>
    </th>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function LeadsTable({
  leads,
  onUpdateLead,
  onExportCSV,
  onRefresh,
}: LeadsTableProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState<Grade | ''>('');
  const [filterRevenue, setFilterRevenue] = useState<RevenueTier | ''>('');
  const [filterTag, setFilterTag] = useState<LeadTag | ''>('');
  const [filterScoreMin, setFilterScoreMin] = useState('');
  const [filterScoreMax, setFilterScoreMax] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkTag, setBulkTag] = useState<LeadTag | ''>('');
  const [tagDropdownId, setTagDropdownId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Filter
  const filtered = leads.filter((lead) => {
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      if (
        !lead.name?.toLowerCase().includes(q) &&
        !lead.email?.toLowerCase().includes(q) &&
        !lead.spa_name?.toLowerCase().includes(q)
      ) return false;
    }
    if (filterGrade && lead.grade !== filterGrade) return false;
    if (filterRevenue && lead.revenue_tier !== filterRevenue) return false;
    if (filterTag && !lead.tags?.includes(filterTag)) return false;
    if (filterScoreMin !== '' && lead.total_score < Number(filterScoreMin)) return false;
    if (filterScoreMax !== '' && lead.total_score > Number(filterScoreMax)) return false;
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let av: string | number = '';
    let bv: string | number = '';
    switch (sortKey) {
      case 'created_at': av = a.created_at; bv = b.created_at; break;
      case 'spa_name':   av = a.spa_name?.toLowerCase() ?? ''; bv = b.spa_name?.toLowerCase() ?? ''; break;
      case 'name':       av = a.name?.toLowerCase() ?? ''; bv = b.name?.toLowerCase() ?? ''; break;
      case 'revenue_tier': av = a.revenue_tier; bv = b.revenue_tier; break;
      case 'total_score': av = a.total_score; bv = b.total_score; break;
      case 'grade':      av = a.grade; bv = b.grade; break;
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === sorted.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sorted.map((l) => l.id)));
    }
  }

  async function handleUpdateTag(leadId: string, tag: LeadTag | null) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    let newTags: LeadTag[];
    if (tag === null) {
      newTags = [];
    } else if (lead.tags?.includes(tag)) {
      newTags = (lead.tags ?? []).filter((t) => t !== tag);
    } else {
      newTags = [...(lead.tags ?? []), tag];
    }
    try {
      await onUpdateLead(leadId, { tags: newTags });
    } catch {
      toast.error('Failed to update tag');
    }
  }

  async function handleSaveNote(leadId: string, notes: string) {
    await onUpdateLead(leadId, { notes });
    toast.success('Note saved');
  }

  async function handleBulkApplyTag() {
    if (!bulkTag) return;
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => handleUpdateTag(id, bulkTag))
      );
      toast.success(`Tag applied to ${selectedIds.size} lead${selectedIds.size !== 1 ? 's' : ''}`);
      setSelectedIds(new Set());
      setBulkTag('');
    } catch {
      toast.error('Bulk tag failed');
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      onRefresh();
    } finally {
      // Give a tiny visual beat
      setTimeout(() => setRefreshing(false), 600);
    }
  }

  const allSelected = sorted.length > 0 && selectedIds.size === sorted.length;
  const someSelected = selectedIds.size > 0;

  // 10 columns (checkbox, date, name/email, spa, revenue, score, grade, domains, tags, notes, expand)
  const totalCols = 11;

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52525b]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, spa…"
              className={cn(inputClass, 'pl-8 w-56')}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#f5f5f5]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="rounded-full bg-[#1f1f1f] px-2.5 py-1 text-xs text-[#71717a] font-medium">
            {sorted.length} lead{sorted.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-xs text-[#a1a1aa] hover:text-[#f5f5f5] hover:border-[#3a3a3a] disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
            Refresh
          </button>
          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 rounded-lg bg-[#3b82f6] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2563eb] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value as Grade | '')}
          className={cn(selectClass, 'w-44')}
        >
          <option value="">All Grades</option>
          {(['critical', 'underperforming', 'functional', 'strong'] as Grade[]).map((g) => (
            <option key={g} value={g}>{GRADE_LABELS[g]}</option>
          ))}
        </select>

        <select
          value={filterRevenue}
          onChange={(e) => setFilterRevenue(e.target.value as RevenueTier | '')}
          className={cn(selectClass, 'w-44')}
        >
          <option value="">All Revenue Tiers</option>
          {REVENUE_TIERS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value as LeadTag | '')}
          className={cn(selectClass, 'w-36')}
        >
          <option value="">All Tags</option>
          {(Object.keys(TAG_COLORS) as LeadTag[]).map((t) => (
            <option key={t} value={t}>{TAG_COLORS[t].label}</option>
          ))}
        </select>

        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={filterScoreMin}
            onChange={(e) => setFilterScoreMin(e.target.value)}
            placeholder="Score min"
            className={cn(inputClass, 'w-24')}
          />
          <span className="text-xs text-[#52525b]">–</span>
          <input
            type="number"
            value={filterScoreMax}
            onChange={(e) => setFilterScoreMax(e.target.value)}
            placeholder="Score max"
            className={cn(inputClass, 'w-24')}
          />
        </div>

        {(filterGrade || filterRevenue || filterTag || filterScoreMin || filterScoreMax) && (
          <button
            type="button"
            onClick={() => {
              setFilterGrade('');
              setFilterRevenue('');
              setFilterTag('');
              setFilterScoreMin('');
              setFilterScoreMax('');
            }}
            className="text-xs text-[#71717a] hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>

      {/* Bulk action bar */}
      {someSelected && (
        <div className="flex items-center gap-3 rounded-xl border border-[#3b82f6]/30 bg-[#0d1117] px-4 py-2.5">
          <span className="text-xs text-[#a1a1aa]">
            {selectedIds.size} selected
          </span>
          <span className="text-[#2a2a2a]">|</span>
          <select
            value={bulkTag}
            onChange={(e) => setBulkTag(e.target.value as LeadTag | '')}
            className={cn(selectClass, 'w-36 py-1.5 text-xs')}
          >
            <option value="">Apply tag…</option>
            {(Object.keys(TAG_COLORS) as LeadTag[]).map((t) => (
              <option key={t} value={t}>{TAG_COLORS[t].label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleBulkApplyTag}
            disabled={!bulkTag}
            className="rounded-lg bg-[#3b82f6] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2563eb] disabled:opacity-40 transition-colors"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-xs text-[#52525b] hover:text-[#f5f5f5] transition-colors"
          >
            Deselect all
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#1f1f1f]">
        <table className="w-full min-w-[1100px] border-collapse">
          <thead>
            <tr className="border-b border-[#1f1f1f] bg-[#0a0a0a]">
              {/* Checkbox */}
              <th scope="col" className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-[#3a3a3a] bg-[#0a0a0a] accent-[#3b82f6] cursor-pointer"
                />
              </th>
              <SortHeader label="Date"         sortKey="created_at"  currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortHeader label="Name / Email" sortKey="name"        currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortHeader label="Spa Name"     sortKey="spa_name"    currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortHeader label="Revenue"      sortKey="revenue_tier" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortHeader label="Score"        sortKey="total_score" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortHeader label="Grade"        sortKey="grade"       currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <th scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wide">
                Domains
              </th>
              <th scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wide">
                Tags
              </th>
              <th scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wide">
                Notes
              </th>
              <th scope="col" className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={totalCols}
                  className="py-16 text-center text-sm text-[#52525b]"
                >
                  No leads match your filters.
                </td>
              </tr>
            )}
            {sorted.map((lead) => {
              const isExpanded = expandedIds.has(lead.id);
              const isSelected = selectedIds.has(lead.id);
              const gc = gradeColor(lead.grade);
              const scorePercent = lead.max_score > 0 ? lead.total_score / lead.max_score : 0;

              return (
                <>
                  <tr
                    key={lead.id}
                    className={cn(
                      'border-b border-[#111111] transition-colors',
                      isSelected ? 'bg-[#0d1117]' : 'hover:bg-[#0d0d0d]',
                    )}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3 align-middle">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(lead.id)}
                        className="rounded border-[#3a3a3a] bg-[#0a0a0a] accent-[#3b82f6] cursor-pointer"
                      />
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 align-middle whitespace-nowrap">
                      <span className="text-xs text-[#71717a]">
                        {formatDate(lead.created_at)}
                      </span>
                    </td>

                    {/* Name + email */}
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-[#f5f5f5] whitespace-nowrap">
                          {lead.name}
                        </p>
                        <p className="text-xs text-[#71717a]">{lead.email}</p>
                      </div>
                    </td>

                    {/* Spa name */}
                    <td className="px-4 py-3 align-middle">
                      <span className="text-sm text-[#f5f5f5] whitespace-nowrap">
                        {lead.spa_name}
                      </span>
                    </td>

                    {/* Revenue tier badge */}
                    <td className="px-4 py-3 align-middle">
                      <span className="rounded-full bg-[#1f1f1f] px-2.5 py-1 text-xs text-[#a1a1aa] whitespace-nowrap">
                        {formatRevenueTier(lead.revenue_tier)}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: gc }}
                        />
                        <span
                          className="text-lg font-bold leading-none"
                          style={{ color: gc }}
                        >
                          {lead.total_score}
                        </span>
                        <span className="text-xs text-[#52525b]">
                          /{lead.max_score}
                        </span>
                      </div>
                    </td>

                    {/* Grade badge */}
                    <td className="px-4 py-3 align-middle">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
                        style={{
                          backgroundColor: gc + '20',
                          color: gc,
                        }}
                      >
                        {GRADE_LABELS[lead.grade]}
                      </span>
                    </td>

                    {/* Domain score bars */}
                    <td className="px-4 py-3 align-middle">
                      <DomainScoreBars domainScores={lead.domain_scores} />
                    </td>

                    {/* Tags */}
                    <td className="px-4 py-3 align-middle">
                      <div className="relative flex items-center gap-1 flex-wrap min-w-[100px]">
                        {lead.tags && lead.tags.length > 0 ? (
                          lead.tags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() =>
                                setTagDropdownId(
                                  tagDropdownId === lead.id ? null : lead.id,
                                )
                              }
                              className={cn(
                                'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors',
                                TAG_BG_CLASSES[tag],
                              )}
                            >
                              {TAG_COLORS[tag].label}
                            </button>
                          ))
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setTagDropdownId(
                                tagDropdownId === lead.id ? null : lead.id,
                              )
                            }
                            className="rounded-full border border-dashed border-[#2a2a2a] px-2 py-0.5 text-[10px] text-[#52525b] hover:border-[#3b82f6] hover:text-[#3b82f6] transition-colors"
                          >
                            + Tag
                          </button>
                        )}

                        {tagDropdownId === lead.id && (
                          <TagDropdown
                            tags={lead.tags ?? []}
                            onApply={(tag) => handleUpdateTag(lead.id, tag)}
                            onClose={() => setTagDropdownId(null)}
                          />
                        )}
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="px-4 py-3 align-middle">
                      <NotesCell
                        leadId={lead.id}
                        notes={lead.notes ?? ''}
                        onSave={handleSaveNote}
                      />
                    </td>

                    {/* Expand toggle */}
                    <td className="px-4 py-3 align-middle">
                      <button
                        type="button"
                        onClick={() => toggleExpand(lead.id)}
                        className="rounded-md p-1.5 text-[#52525b] hover:text-[#f5f5f5] hover:bg-[#1f1f1f] transition-colors"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        <ChevronRight
                          className={cn(
                            'w-4 h-4 transition-transform duration-150',
                            isExpanded && 'rotate-90',
                          )}
                        />
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <ExpandedRow
                      key={`${lead.id}-expanded`}
                      lead={lead}
                      colSpan={totalCols}
                    />
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
