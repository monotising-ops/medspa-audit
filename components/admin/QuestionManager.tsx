'use client';

import { useState, useRef, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Pencil,
  Trash2,
  Copy,
  Plus,
  X,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import type { Question, AnswerOption, Domain, QuestionType, InputType } from '@/types';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const DOMAIN_OPTIONS: { value: Domain; label: string; color: string }[] = [
  { value: 'intake', label: 'Intake', color: '#6366f1' },
  { value: 'lead_gen', label: 'Lead Gen', color: '#3b82f6' },
  { value: 'speed_to_lead', label: 'Speed-to-Lead', color: '#f97316' },
  { value: 'booking', label: 'Booking', color: '#22c55e' },
  { value: 'attribution', label: 'Attribution', color: '#a855f7' },
  { value: 'growth', label: 'Growth', color: '#eab308' },
];

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'intake', label: 'Intake' },
  { value: 'scored', label: 'Scored' },
];

const INPUT_TYPE_OPTIONS: { value: InputType; label: string }[] = [
  { value: 'single_select', label: 'Single Select' },
  { value: 'multi_select', label: 'Multi Select' },
  { value: 'text', label: 'Text' },
];

function domainColor(domain: Domain): string {
  return DOMAIN_OPTIONS.find((d) => d.value === domain)?.color ?? '#71717a';
}

function domainLabel(domain: Domain): string {
  return DOMAIN_OPTIONS.find((d) => d.value === domain)?.label ?? domain;
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder-[#52525b] focus:outline-none focus:border-[#3b82f6] transition-colors';

const selectClass =
  'w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b82f6] transition-colors appearance-none';

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-[#a1a1aa] mb-1.5">
      {children}
    </label>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
}

function SmallToggle({ checked, onChange }: ToggleProps) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      className="relative flex-shrink-0 rounded-full cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
      style={{
        width: 34,
        height: 20,
        backgroundColor: checked ? '#3b82f6' : '#333333',
      }}
    >
      <span
        className="absolute top-[2px] rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{
          width: 16,
          height: 16,
          left: 2,
          transform: checked ? 'translateX(14px)' : 'translateX(0)',
        }}
      />
    </div>
  );
}

// ─── Sortable Row ─────────────────────────────────────────────────────────────

interface SortableItemProps {
  question: Question;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleActive: (active: boolean) => void;
}

function SortableItem({
  question,
  isEditing,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: question.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
        isEditing
          ? 'border-[#3b82f6] bg-[#111827]'
          : 'border-[#1f1f1f] bg-[#111111] hover:border-[#2a2a2a]',
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-[#52525b] hover:text-[#a1a1aa] cursor-grab active:cursor-grabbing flex-shrink-0 focus:outline-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Question text */}
      <span className="flex-1 text-sm text-white truncate min-w-0">
        {question.question_text || <em className="text-[#52525b]">Untitled question</em>}
      </span>

      {/* Domain badge */}
      <span
        className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
        style={{ backgroundColor: domainColor(question.domain) + '33', color: domainColor(question.domain) }}
      >
        {domainLabel(question.domain)}
      </span>

      {/* Type badge */}
      <span
        className={cn(
          'flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
          question.type === 'scored'
            ? 'bg-[#3b82f6]/10 text-[#3b82f6]'
            : 'bg-[#6366f1]/10 text-[#6366f1]',
        )}
      >
        {question.type}
      </span>

      {/* Active toggle */}
      <div className="flex-shrink-0">
        <SmallToggle
          checked={question.active}
          onChange={onToggleActive}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className={cn(
            'rounded-md p-1.5 transition-colors',
            isEditing
              ? 'bg-[#3b82f6]/20 text-[#3b82f6]'
              : 'text-[#71717a] hover:text-white hover:bg-[#1f1f1f]',
          )}
          aria-label="Edit question"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          className="rounded-md p-1.5 text-[#71717a] hover:text-white hover:bg-[#1f1f1f] transition-colors"
          aria-label="Duplicate question"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          className={cn(
            'rounded-md p-1.5 transition-colors',
            confirmDelete
              ? 'bg-red-500/20 text-red-400'
              : 'text-[#71717a] hover:text-red-400 hover:bg-[#1f1f1f]',
          )}
          aria-label={confirmDelete ? 'Click again to confirm delete' : 'Delete question'}
          title={confirmDelete ? 'Click again to confirm' : 'Delete'}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Options Editor ───────────────────────────────────────────────────────────

interface OptionsEditorProps {
  options: AnswerOption[];
  onChange: (options: AnswerOption[]) => void;
}

function OptionsEditor({ options, onChange }: OptionsEditorProps) {
  function updateOption(index: number, field: keyof AnswerOption, value: string | number) {
    const next = options.map((opt, i) =>
      i === index ? { ...opt, [field]: value } : opt,
    );
    onChange(next);
  }

  function addOption() {
    onChange([
      ...options,
      { id: uuid(), label: '', score: 0 },
    ]);
  }

  function removeOption(index: number) {
    onChange(options.filter((_, i) => i !== index));
  }

  return (
    <div>
      <Label>Answer Options</Label>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={opt.id} className="flex items-center gap-2">
            <input
              type="text"
              value={opt.label}
              onChange={(e) => updateOption(i, 'label', e.target.value)}
              placeholder={`Option ${i + 1}`}
              className={cn(inputClass, 'flex-1')}
            />
            <input
              type="number"
              value={opt.score}
              min={0}
              max={4}
              onChange={(e) => updateOption(i, 'score', Number(e.target.value))}
              className={cn(inputClass, 'w-16 text-center')}
              title="Score (0–4)"
            />
            <button
              type="button"
              onClick={() => removeOption(i)}
              className="flex-shrink-0 rounded-md p-1.5 text-[#71717a] hover:text-red-400 hover:bg-[#1f1f1f] transition-colors"
              aria-label="Remove option"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addOption}
          className="flex items-center gap-1.5 text-sm text-[#3b82f6] hover:text-[#60a5fa] transition-colors mt-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Option
        </button>
      </div>
      {options.length > 0 && (
        <p className="mt-1.5 text-xs text-[#52525b]">Score range: 0 (worst) – 4 (best)</p>
      )}
    </div>
  );
}

// ─── Live Preview Card ────────────────────────────────────────────────────────

interface PreviewCardProps {
  question: Partial<Question>;
}

function PreviewCard({ question }: PreviewCardProps) {
  const hasOptions =
    (question.input_type === 'single_select' || question.input_type === 'multi_select') &&
    (question.options?.length ?? 0) > 0;

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] p-4">
      <div className="mb-2 flex items-center gap-2">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{
            backgroundColor: domainColor((question.domain as Domain) ?? 'intake') + '22',
            color: domainColor((question.domain as Domain) ?? 'intake'),
          }}
        >
          {domainLabel((question.domain as Domain) ?? 'intake')}
        </span>
        <span className="text-[10px] text-[#52525b]">Preview</span>
      </div>
      <p className="text-sm font-medium text-white leading-snug mb-3">
        {question.question_text?.trim() || (
          <span className="italic text-[#52525b]">Question text will appear here…</span>
        )}
      </p>
      {hasOptions && (
        <div className="space-y-1.5">
          {question.options!.slice(0, 5).map((opt) => (
            <div
              key={opt.id}
              className="rounded-lg border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-xs text-[#a1a1aa]"
            >
              {opt.label || <span className="italic text-[#52525b]">Option label…</span>}
            </div>
          ))}
          {question.options!.length > 5 && (
            <p className="text-xs text-[#52525b] pl-1">
              +{question.options!.length - 5} more options
            </p>
          )}
        </div>
      )}
      {question.input_type === 'text' && (
        <div className="rounded-lg border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-xs text-[#52525b] italic">
          Free text answer…
        </div>
      )}
    </div>
  );
}

// ─── Edit Panel ───────────────────────────────────────────────────────────────

type EditDraft = Partial<Question> & { options: AnswerOption[] };

interface EditPanelProps {
  draft: EditDraft;
  isNew: boolean;
  onChangeDraft: (d: EditDraft) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onUploadImage: (file: File, questionId: string) => Promise<string>;
  saving: boolean;
}

function EditPanel({
  draft,
  isNew,
  onChangeDraft,
  onSave,
  onCancel,
  onUploadImage,
  saving,
}: EditPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function set<K extends keyof EditDraft>(key: K, val: EditDraft[K]) {
    onChangeDraft({ ...draft, [key]: val });
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await onUploadImage(file, draft.id ?? 'new');
      set('image_url', url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  const showOptions =
    draft.input_type === 'single_select' || draft.input_type === 'multi_select';

  return (
    <div className="rounded-xl border border-[#3b82f6]/40 bg-[#0d1117] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          {isNew ? 'New Question' : 'Edit Question'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md p-1.5 text-[#71717a] hover:text-white hover:bg-[#1f1f1f] transition-colors"
          aria-label="Close editor"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left column: form fields */}
        <div className="space-y-4">
          <div>
            <Label>Question Text</Label>
            <textarea
              rows={3}
              value={draft.question_text ?? ''}
              onChange={(e) => set('question_text', e.target.value)}
              placeholder="Enter your question…"
              className={cn(inputClass, 'resize-none leading-relaxed')}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Type</Label>
              <select
                value={draft.type ?? 'scored'}
                onChange={(e) => set('type', e.target.value as QuestionType)}
                className={selectClass}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Input Type</Label>
              <select
                value={draft.input_type ?? 'single_select'}
                onChange={(e) => {
                  const next = e.target.value as InputType;
                  onChangeDraft({
                    ...draft,
                    input_type: next,
                    options: next === 'text' ? [] : draft.options,
                  });
                }}
                className={selectClass}
              >
                {INPUT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Domain</Label>
              <select
                value={draft.domain ?? 'intake'}
                onChange={(e) => set('domain', e.target.value as Domain)}
                className={selectClass}
              >
                {DOMAIN_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Placeholder (text questions only) */}
          {draft.input_type === 'text' && (
            <div>
              <Label>Placeholder Text</Label>
              <input
                type="text"
                value={draft.placeholder ?? ''}
                onChange={(e) => set('placeholder', e.target.value || null)}
                placeholder="e.g. Glow Studio"
                className={inputClass}
              />
            </div>
          )}

          {/* Image upload */}
          <div>
            <Label>Question Image (optional)</Label>
            {draft.image_url && (
              <div className="mb-2 flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={draft.image_url}
                  alt="Question"
                  className="h-16 w-24 rounded-md object-cover border border-[#2a2a2a]"
                />
                <button
                  type="button"
                  onClick={() => set('image_url', null)}
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
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-1.5 text-xs text-[#a1a1aa] hover:border-[#3b82f6] hover:text-white disabled:opacity-50 transition-colors"
            >
              {uploading ? 'Uploading…' : draft.image_url ? 'Replace Image' : 'Upload Image'}
            </button>
          </div>

          {/* Options editor */}
          {showOptions && (
            <OptionsEditor
              options={draft.options}
              onChange={(opts) => set('options', opts)}
            />
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              {saving ? 'Saving…' : isNew ? 'Create Question' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-[#2a2a2a] px-4 py-2 text-sm text-[#a1a1aa] hover:text-white hover:border-[#3a3a3a] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Right column: live preview */}
        <div>
          <Label>Live Preview</Label>
          <PreviewCard question={draft} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

interface QuestionManagerProps {
  questions: Question[];
  onReorder: (questions: Question[]) => Promise<void>;
  onUpdate: (question: Question) => Promise<void>;
  onCreate: (question: Partial<Question>) => Promise<Question>;
  onDelete: (id: string) => Promise<void>;
  onToggleActive: (id: string, active: boolean) => Promise<void>;
  onUploadImage: (file: File, questionId: string) => Promise<string>;
}

function makeDefaultDraft(): EditDraft {
  return {
    id: uuid(),
    question_text: '',
    type: 'scored',
    input_type: 'single_select',
    domain: 'lead_gen',
    image_url: null,
    options: [],
    active: true,
    order: 0,
  };
}

export default function QuestionManager({
  questions: initialQuestions,
  onReorder,
  onUpdate,
  onCreate,
  onDelete,
  onToggleActive,
  onUploadImage,
}: QuestionManagerProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [draft, setDraft] = useState<EditDraft>(makeDefaultDraft());
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      const reordered = arrayMove(questions, oldIndex, newIndex).map((q, i) => ({
        ...q,
        order: i,
      }));

      setQuestions(reordered);
      try {
        await onReorder(reordered);
      } catch {
        toast.error('Failed to save new order');
        setQuestions(questions); // rollback
      }
    },
    [questions, onReorder],
  );

  function startEdit(question: Question) {
    setIsAddingNew(false);
    setEditingId(question.id);
    setDraft({
      ...question,
      options: question.options ? [...question.options.map((o) => ({ ...o }))] : [],
    });
  }

  function startAdd() {
    setEditingId(null);
    setIsAddingNew(true);
    setDraft({ ...makeDefaultDraft(), order: questions.length });
  }

  function cancelEdit() {
    setEditingId(null);
    setIsAddingNew(false);
  }

  async function handleDuplicate(question: Question) {
    const newQ: Partial<Question> = {
      ...question,
      id: undefined,
      question_text: `${question.question_text} (copy)`,
      order: questions.length,
      options: question.options.map((o) => ({ ...o, id: uuid() })),
    };
    try {
      const created = await onCreate(newQ);
      setQuestions((prev) => [...prev, created]);
      toast.success('Question duplicated');
    } catch {
      toast.error('Failed to duplicate question');
    }
  }

  async function handleDelete(id: string) {
    const prev = questions;
    setQuestions((qs) => qs.filter((q) => q.id !== id));
    if (editingId === id) cancelEdit();
    try {
      await onDelete(id);
      toast.success('Question deleted');
    } catch {
      setQuestions(prev);
      toast.error('Failed to delete question');
    }
  }

  async function handleToggleActive(id: string, active: boolean) {
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, active } : q)),
    );
    try {
      await onToggleActive(id, active);
    } catch {
      setQuestions((qs) =>
        qs.map((q) => (q.id === id ? { ...q, active: !active } : q)),
      );
      toast.error('Failed to update question');
    }
  }

  async function handleSave() {
    if (!draft.question_text?.trim()) {
      toast.error('Question text is required');
      return;
    }

    setSaving(true);
    try {
      if (isAddingNew) {
        const created = await onCreate(draft);
        setQuestions((prev) => [...prev, created]);
        toast.success('Question created');
        setIsAddingNew(false);
      } else if (editingId) {
        const updated: Question = {
          id: editingId,
          question_text: draft.question_text!,
          placeholder: draft.placeholder ?? null,
          type: draft.type ?? 'scored',
          input_type: draft.input_type ?? 'single_select',
          domain: draft.domain ?? 'lead_gen',
          image_url: draft.image_url ?? null,
          options: draft.options,
          active: draft.active ?? true,
          order: draft.order ?? 0,
        };
        await onUpdate(updated);
        setQuestions((qs) => qs.map((q) => (q.id === editingId ? updated : q)));
        toast.success('Question saved');
        setEditingId(null);
      }
    } catch {
      toast.error('Failed to save question');
    } finally {
      setSaving(false);
    }
  }

  const showEditor = isAddingNew || editingId !== null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Question Manager</h2>
          <p className="text-sm text-[#71717a] mt-0.5">
            {questions.length} question{questions.length !== 1 ? 's' : ''} — drag to reorder
          </p>
        </div>
        <button
          type="button"
          onClick={startAdd}
          className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2563eb] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {/* Drag-and-drop list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={questions.map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {questions.length === 0 && !isAddingNew && (
              <div className="rounded-xl border border-dashed border-[#2a2a2a] py-12 text-center">
                <p className="text-sm text-[#52525b]">No questions yet.</p>
                <button
                  type="button"
                  onClick={startAdd}
                  className="mt-2 text-sm text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
                >
                  Add your first question
                </button>
              </div>
            )}
            {questions.map((q) => (
              <SortableItem
                key={q.id}
                question={q}
                isEditing={editingId === q.id}
                onEdit={() => startEdit(q)}
                onDelete={() => handleDelete(q.id)}
                onDuplicate={() => handleDuplicate(q)}
                onToggleActive={(active) => handleToggleActive(q.id, active)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Edit / Add Panel */}
      {showEditor && (
        <EditPanel
          draft={draft}
          isNew={isAddingNew}
          onChangeDraft={setDraft}
          onSave={handleSave}
          onCancel={cancelEdit}
          onUploadImage={onUploadImage}
          saving={saving}
        />
      )}
    </div>
  );
}
