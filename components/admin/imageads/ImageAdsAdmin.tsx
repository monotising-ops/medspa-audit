'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Save, Upload, Plus, Trash2, ExternalLink } from 'lucide-react';
import {
  IA_LANDING_DEFAULT,
  IA_GATE_DEFAULT,
  IA_CTA_DEFAULT,
  IA_RESULTS_DEFAULT,
  IA_PROOF_DEFAULT,
  IA_IMAGES_DEFAULT,
  IA_QUESTIONS_DEFAULT,
  withDefaults,
  type IAQuestion,
} from './defaults';

interface Props {
  configs: Record<string, Record<string, string>>;
  onSaveConfig: (section: string, data: Record<string, string>) => Promise<void>;
  onUploadImage: (file: File, folder: string) => Promise<string>;
}

const TABS: { id: IATab; label: string }[] = [
  { id: 'copy', label: 'Landing & Gate' },
  { id: 'questions', label: 'Questions' },
  { id: 'results', label: 'Results & CTA' },
  { id: 'images', label: 'Images' },
];
type IATab = 'copy' | 'questions' | 'results' | 'images';

function parseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) && v.length ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}

const inputClass =
  'w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#f5f5f5] placeholder-[#52525b] focus:outline-none focus:border-[#D4A847] transition-colors';

function Field({
  label,
  value,
  onChange,
  textarea,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#71717a]">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={`${inputClass} resize-y`} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}
      {hint && <span className="mt-1 block text-[11px] text-[#52525b]">{hint}</span>}
    </label>
  );
}

function SaveButton({ onClick, saving, label = 'Save' }: { onClick: () => void; saving: boolean; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="inline-flex items-center gap-1.5 rounded-lg bg-[#D4A847] px-4 py-2 text-sm font-semibold text-[#0a0a0a] hover:bg-[#E8C96A] disabled:opacity-50 transition-colors"
    >
      <Save className="h-3.5 w-3.5" />
      {saving ? 'Saving…' : label}
    </button>
  );
}

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#1e1e1e] bg-[#0d0d0d] p-6">
      <h3 className="text-base font-semibold text-[#f5f5f5]">{title}</h3>
      {desc && <p className="mt-1 text-xs text-[#737373]">{desc}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

export default function ImageAdsAdmin({ configs, onSaveConfig, onUploadImage }: Props) {
  const [tab, setTab] = useState<IATab>('copy');
  const [saving, setSaving] = useState(false);

  const [landing, setLanding] = useState(withDefaults(IA_LANDING_DEFAULT, configs.ia_landing));
  const [gate, setGate] = useState(withDefaults(IA_GATE_DEFAULT, configs.ia_gate));
  const [cta, setCta] = useState(withDefaults(IA_CTA_DEFAULT, configs.ia_cta));
  const [results, setResults] = useState(withDefaults(IA_RESULTS_DEFAULT, configs.ia_results));
  const [images, setImages] = useState(withDefaults(IA_IMAGES_DEFAULT, configs.ia_images));
  const [proof, setProof] = useState(parseJson(configs.ia_proof?.data, IA_PROOF_DEFAULT));
  const [questions, setQuestions] = useState(parseJson(configs.ia_questions?.data, IA_QUESTIONS_DEFAULT));

  async function save(section: string, data: Record<string, string>) {
    setSaving(true);
    try {
      await onSaveConfig(section, data);
      toast.success('Saved — changes are live on the magnet');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }

  function updateQuestion(idx: number, patch: Partial<IAQuestion>) {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  }
  function updateOption(qIdx: number, oIdx: number, patch: Partial<{ label: string; score: number }>) {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.map((o, j) => (j === oIdx ? { ...o, ...patch } : o)) } : q,
      ),
    );
  }

  async function handleImageUpload(key: keyof typeof images, file: File) {
    try {
      const url = await onUploadImage(file, 'imageads');
      setImages((im) => ({ ...im, [key]: url }));
      toast.success('Uploaded — remember to Save');
    } catch {
      toast.error('Upload failed');
    }
  }

  return (
    <div>
      {/* Sub-tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-[#D4A847] text-[#0a0a0a]' : 'text-[#a1a1aa] hover:text-[#f5f5f5]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Landing & Gate ── */}
      {tab === 'copy' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Landing page" desc="The headline and copy people see before starting.">
            <Field label="Headline" value={landing.headline} onChange={(v) => setLanding({ ...landing, headline: v })} textarea rows={2} />
            <Field label="Subtext" value={landing.subhead} onChange={(v) => setLanding({ ...landing, subhead: v })} textarea />
            <Field label="Meta line" value={landing.meta} onChange={(v) => setLanding({ ...landing, meta: v })} />
            <Field label="Trust line" value={landing.trust} onChange={(v) => setLanding({ ...landing, trust: v })} textarea />
            <Field label="Button text" value={landing.cta} onChange={(v) => setLanding({ ...landing, cta: v })} />
            <SaveButton saving={saving} onClick={() => save('ia_landing', landing)} label="Save landing" />
          </Card>

          <Card title="Unlock gate" desc="The email/phone capture shown before results.">
            <Field label="Headline" value={gate.headline} onChange={(v) => setGate({ ...gate, headline: v })} />
            <Field label="Subtext" value={gate.subhead} onChange={(v) => setGate({ ...gate, subhead: v })} textarea />
            <Field label="Button text" value={gate.cta} onChange={(v) => setGate({ ...gate, cta: v })} />
            <SaveButton saving={saving} onClick={() => save('ia_gate', gate)} label="Save gate" />
          </Card>
        </div>
      )}

      {/* ── Questions ── */}
      {tab === 'questions' && (
        <div className="space-y-4">
          <p className="text-xs text-[#737373]">
            Edit question text, answer options and point values. Keep the 5 scored questions and 3 intake
            fields (structure feeds scoring & results) — change the wording and scores freely.
          </p>
          {questions.map((q, qi) => (
            <div key={q.id} className="rounded-2xl border border-[#1e1e1e] bg-[#0d0d0d] p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-md bg-[#1f1f1f] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#a1a1aa]">
                  {q.type === 'intake' ? 'Intake' : `Scored · ${q.domain}`}
                </span>
                <span className="text-[10px] text-[#52525b]">{q.id}</span>
              </div>
              <Field label="Question text" value={q.question_text} onChange={(v) => updateQuestion(qi, { question_text: v })} />
              {q.type === 'intake' ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label="Helper text" value={q.helper ?? ''} onChange={(v) => updateQuestion(qi, { helper: v })} />
                  <Field label="Placeholder" value={q.placeholder ?? ''} onChange={(v) => updateQuestion(qi, { placeholder: v })} />
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  {q.options.map((o, oi) => (
                    <div key={o.id} className="flex items-center gap-2">
                      <input
                        value={o.label}
                        onChange={(e) => updateOption(qi, oi, { label: e.target.value })}
                        className={`${inputClass} flex-1`}
                      />
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={o.score}
                        onChange={(e) => updateOption(qi, oi, { score: Number(e.target.value) })}
                        className={`${inputClass} w-16 text-center`}
                        title="Points"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <SaveButton saving={saving} onClick={() => save('ia_questions', { data: JSON.stringify(questions) })} label="Save all questions" />
        </div>
      )}

      {/* ── Results & CTA ── */}
      {tab === 'results' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Book-a-call CTA" desc="The bridge block at the bottom of the results page.">
            <Field label="Headline" value={cta.headline} onChange={(v) => setCta({ ...cta, headline: v })} textarea rows={2} />
            <Field label="Body" value={cta.body} onChange={(v) => setCta({ ...cta, body: v })} textarea />
            <Field label="Button text" value={cta.primary_text} onChange={(v) => setCta({ ...cta, primary_text: v })} />
            <Field label="Calendly / booking URL" value={cta.primary_url} onChange={(v) => setCta({ ...cta, primary_url: v })} hint="Full link, e.g. https://calendly.com/…" />
            <Field label="Secondary line" value={cta.secondary} onChange={(v) => setCta({ ...cta, secondary: v })} />
            {cta.primary_url && (
              <a href={cta.primary_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#3b82f6] hover:underline">
                Test link <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <div><SaveButton saving={saving} onClick={() => save('ia_cta', cta)} label="Save CTA" /></div>
          </Card>

          <Card title="Results copy" desc="Grade lines, the price-shopper diagnosis, and the attention test.">
            <Field label="Grade line — Critical" value={results.grade_critical} onChange={(v) => setResults({ ...results, grade_critical: v })} textarea rows={2} />
            <Field label="Grade line — Leaking" value={results.grade_leaking} onChange={(v) => setResults({ ...results, grade_leaking: v })} textarea rows={2} />
            <Field label="Grade line — Functional" value={results.grade_functional} onChange={(v) => setResults({ ...results, grade_functional: v })} textarea rows={2} />
            <Field label="Grade line — Strong" value={results.grade_strong} onChange={(v) => setResults({ ...results, grade_strong: v })} textarea rows={2} />
            <Field label="Price diagnosis — headline" value={results.price_headline} onChange={(v) => setResults({ ...results, price_headline: v })} />
            <Field label="Price diagnosis — body" value={results.price_body} onChange={(v) => setResults({ ...results, price_body: v })} textarea rows={4} />
            <Field label="Attention test — title" value={results.attention_title} onChange={(v) => setResults({ ...results, attention_title: v })} />
            <Field label="Attention test — body" value={results.attention_body} onChange={(v) => setResults({ ...results, attention_body: v })} textarea rows={4} />
            <div><SaveButton saving={saving} onClick={() => save('ia_results', results)} label="Save results copy" /></div>
          </Card>

          <Card title="Proof stats" desc="The numbers shown in the proof block.">
            <div className="space-y-2">
              {proof.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={p.value}
                    onChange={(e) => setProof(proof.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                    placeholder="$17,720"
                    className={`${inputClass} w-32`}
                  />
                  <input
                    value={p.label}
                    onChange={(e) => setProof(proof.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                    placeholder="generated in 2.5 months"
                    className={`${inputClass} flex-1`}
                  />
                  <button type="button" onClick={() => setProof(proof.filter((_, j) => j !== i))} className="rounded-md p-2 text-[#52525b] hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setProof([...proof, { value: '', label: '' }])} className="inline-flex items-center gap-1.5 text-xs text-[#a1a1aa] hover:text-[#f5f5f5]">
              <Plus className="h-3.5 w-3.5" /> Add stat
            </button>
            <div><SaveButton saving={saving} onClick={() => save('ia_proof', { data: JSON.stringify(proof.filter((p) => p.value || p.label)) })} label="Save proof" /></div>
          </Card>
        </div>
      )}

      {/* ── Images ── */}
      {tab === 'images' && (
        <div>
          <p className="mb-4 text-xs text-[#737373]">
            Upload your own before/after and attention-test images to replace the built-in mockups.
            Leave a slot empty to keep the built-in design.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            {([
              ['before_url', 'Before / after — “What you’re running”'],
              ['after_url', 'Before / after — “The fix”'],
              ['attention_cluttered_url', 'Attention test — cluttered ad'],
              ['attention_clean_url', 'Attention test — clean ad'],
            ] as [keyof typeof images, string][]).map(([key, label]) => (
              <div key={key} className="rounded-2xl border border-[#1e1e1e] bg-[#0d0d0d] p-4">
                <p className="mb-2 text-xs font-semibold text-[#a1a1aa]">{label}</p>
                <div className="mb-3 flex aspect-[4/5] max-h-56 items-center justify-center overflow-hidden rounded-lg border border-[#1f1f1f] bg-[#0a0a0a]">
                  {images[key] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={images[key]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-[#52525b]">Built-in mockup (no upload)</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#111] px-3 py-2 text-xs text-[#a1a1aa] hover:text-[#f5f5f5]">
                    <Upload className="h-3.5 w-3.5" /> Upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(key, f); }} />
                  </label>
                  {images[key] && (
                    <button type="button" onClick={() => setImages({ ...images, [key]: '' })} className="text-xs text-[#52525b] hover:text-red-400">
                      Clear
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <SaveButton saving={saving} onClick={() => save('ia_images', images)} label="Save images" />
          </div>
        </div>
      )}
    </div>
  );
}
