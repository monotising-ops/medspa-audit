'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Question, InfoBankEntry } from '@/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  questions: Question[];
  entries: InfoBankEntry[];
  onCreate: (entry: Omit<InfoBankEntry, 'id' | 'created_at'>) => Promise<InfoBankEntry>;
  onUpdate: (id: string, data: Partial<InfoBankEntry>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

// ─── Category config ──────────────────────────────────────────────────────────

type Category = InfoBankEntry['category'];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'insight', label: 'Insight' },
  { value: 'warning', label: 'Warning' },
  { value: 'opportunity', label: 'Opportunity' },
  { value: 'strength', label: 'Strength' },
];

const CATEGORY_STYLES: Record<Category, { border: string; bg: string; badge: string }> = {
  insight:     { border: 'border-l-blue-400',   bg: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700' },
  warning:     { border: 'border-l-red-400',    bg: 'bg-red-50',    badge: 'bg-red-100 text-red-700' },
  opportunity: { border: 'border-l-[#D4A847]',  bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' },
  strength:    { border: 'border-l-green-400',  bg: 'bg-green-50',  badge: 'bg-green-100 text-green-700' },
};

// ─── Inline edit form ─────────────────────────────────────────────────────────

interface EditFormProps {
  initial: Partial<InfoBankEntry>;
  onSave: (data: { title: string; body: string; category: Category }) => Promise<void>;
  onCancel: () => void;
}

function EditForm({ initial, onSave, onCancel }: EditFormProps) {
  const [title, setTitle]       = useState(initial.title ?? '');
  const [body, setBody]         = useState(initial.body ?? '');
  const [category, setCategory] = useState<Category>(initial.category ?? 'insight');
  const [saving, setSaving]     = useState(false);

  async function handleSave() {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!body.trim())  { toast.error('Body is required');  return; }
    setSaving(true);
    try {
      await onSave({ title: title.trim(), body: body.trim(), category });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="space-y-3">
        {/* Title */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder='e.g. "Speed-to-Lead Gap Identified"'
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Category
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Body */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Insight Text
          </label>
          <p className="mb-1 text-xs text-gray-400">
            Use <code className="rounded bg-gray-100 px-1">{'{spa_name}'}</code> to personalise the message.
          </p>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={4}
            placeholder="Write the insight that will appear in this lead's results…"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Entry card ───────────────────────────────────────────────────────────────

interface EntryCardProps {
  entry: InfoBankEntry;
  onEdit: () => void;
  onDelete: () => void;
}

function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
  const styles = CATEGORY_STYLES[entry.category];
  const preview = entry.body.length > 120 ? entry.body.slice(0, 120) + '…' : entry.body;

  return (
    <div className={cn('mt-2 rounded-lg border-l-4 p-3', styles.border, styles.bg)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-800">{entry.title}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', styles.badge)}>
              {entry.category}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-600 leading-relaxed">{preview}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color =
    score <= 0  ? 'bg-red-100 text-red-700' :
    score <= 1  ? 'bg-orange-100 text-orange-700' :
    score <= 2  ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700';
  return (
    <span className={cn('ml-1 rounded-full px-2 py-0.5 text-xs font-medium', color)}>
      {score} pt{score !== 1 ? 's' : ''}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function InfoBank({ questions, entries, onCreate, onUpdate, onDelete }: Props) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  // Key: `${question_id}__${option_id}` → 'add' | 'edit'
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const scoredQuestions = questions.filter(q => q.type === 'scored');

  // Build a lookup map: `${question_id}__${option_id}` → InfoBankEntry
  const entryMap = new Map<string, InfoBankEntry>();
  for (const e of entries) {
    entryMap.set(`${e.question_id}__${e.option_id}`, e);
  }

  const totalEntries  = entries.length;
  const coveredQs     = new Set(entries.map(e => e.question_id)).size;

  function toggleQuestion(id: string) {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleCreate(
    questionId: string,
    optionId: string,
    data: { title: string; body: string; category: Category }
  ) {
    try {
      await onCreate({ question_id: questionId, option_id: optionId, ...data });
      toast.success('Insight saved');
      setEditingKey(null);
    } catch {
      toast.error('Failed to save insight');
    }
  }

  async function handleUpdate(
    id: string,
    data: { title: string; body: string; category: Category }
  ) {
    try {
      await onUpdate(id, data);
      toast.success('Insight updated');
      setEditingKey(null);
    } catch {
      toast.error('Failed to update insight');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this insight?')) return;
    try {
      await onDelete(id);
      toast.success('Insight deleted');
    } catch {
      toast.error('Failed to delete insight');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Info Bank</h2>
        <p className="mt-1 text-sm text-gray-500">
          Write custom insights that appear in a lead&apos;s results based on their specific answer choices.
          The more you fill in, the more personalised their results feel.
        </p>
      </div>

      {/* Stats */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{totalEntries}</span> insight
          {totalEntries !== 1 ? 's' : ''} written across{' '}
          <span className="font-semibold text-gray-900">{coveredQs}</span> question
          {coveredQs !== 1 ? 's' : ''}
          {scoredQuestions.length > 0 && (
            <span className="text-gray-400">
              {' '}({scoredQuestions.length} questions total)
            </span>
          )}
        </p>
      </div>

      {/* Question list */}
      {scoredQuestions.length === 0 ? (
        <p className="text-sm text-gray-400">No scored questions found.</p>
      ) : (
        <div className="space-y-2">
          {scoredQuestions.map(question => {
            const isExpanded   = expandedQuestions.has(question.id);
            const qEntryCount  = entries.filter(e => e.question_id === question.id).length;

            return (
              <div key={question.id} className="rounded-lg border border-gray-200 bg-white shadow-sm">
                {/* Question header */}
                <button
                  onClick={() => toggleQuestion(question.id)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn(
                      'shrink-0 transform transition-transform duration-200 text-gray-400',
                      isExpanded ? 'rotate-90' : 'rotate-0'
                    )}>
                      ▶
                    </span>
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {question.question_text}
                    </span>
                  </div>
                  <div className="shrink-0 ml-3 flex items-center gap-2">
                    {qEntryCount > 0 && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {qEntryCount} insight{qEntryCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 capitalize">{question.domain.replace(/_/g, ' ')}</span>
                  </div>
                </button>

                {/* Options */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4">
                    {question.options.length === 0 ? (
                      <p className="text-xs text-gray-400">No options defined for this question.</p>
                    ) : (
                      question.options.map(option => {
                        const key      = `${question.id}__${option.id}`;
                        const existing = entryMap.get(key);
                        const isEditing = editingKey === key;

                        return (
                          <div key={option.id}>
                            {/* Option label row */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-sm font-semibold text-gray-700">
                                  {option.label}
                                </span>
                                <ScoreBadge score={option.score} />
                              </div>
                              {!isEditing && (
                                <button
                                  onClick={() => setEditingKey(key)}
                                  className={cn(
                                    'shrink-0 rounded px-2 py-1 text-xs font-medium',
                                    existing
                                      ? 'text-gray-500 hover:bg-gray-100'
                                      : 'text-blue-600 hover:bg-blue-50'
                                  )}
                                >
                                  {existing ? 'Edit' : '+ Add Insight'}
                                </button>
                              )}
                            </div>

                            {/* Existing entry card */}
                            {existing && !isEditing && (
                              <EntryCard
                                entry={existing}
                                onEdit={() => setEditingKey(key)}
                                onDelete={() => handleDelete(existing.id)}
                              />
                            )}

                            {/* Inline edit form */}
                            {isEditing && (
                              <EditForm
                                initial={existing ?? {}}
                                onSave={data =>
                                  existing
                                    ? handleUpdate(existing.id, data)
                                    : handleCreate(question.id, option.id, data)
                                }
                                onCancel={() => setEditingKey(null)}
                              />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
