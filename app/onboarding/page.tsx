'use client';

// TODO: Paste Calendly URL in CALENDLY_URL constant below
// TODO: Add SOP guide URLs in SOP_LINKS constant below
// TODO: Upload roadmap image via admin, paste URL in ROADMAP_IMAGE_URL
// TODO: Add Loom tutorial video URLs to CHECKLIST_ITEMS[].tutorialUrl
// TODO: Connect Monotising dashboard to display onboarding status per client
// TODO: Run the SQL in app/api/onboarding/[clientId]/route.ts to create the DB table
// TODO: Create 'onboarding-assets' Supabase Storage bucket (set to public)

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// ─── Types ─────────────────────────────────────────────────────────────────────
// (defined early so OnboardingContent can use them)

type ObConfig = {
  roadmap_image_url: string;
  sop_creatives_url: string;
  sop_campaigns_url: string;
  calendly_url: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const INTAKE_QUESTIONS = [
  { id: 'q1', label: "What is your clinic's full name and location?", type: 'text', placeholder: 'e.g. Mintus Laser Clinic — Toronto, ON' },
  { id: 'q2', label: "What is your clinic's website URL?", type: 'text', placeholder: 'https://yoursite.com' },
  { id: 'q3', label: 'What treatments do you primarily offer? List your top 5–8 with pricing.', type: 'textarea', placeholder: 'Botox — $12/unit\nDermal Filler — $650/syringe\n...' },
  { id: 'q4', label: 'Which single treatment has the highest profit margin for your clinic?', type: 'text', placeholder: 'e.g. Body Contouring' },
  { id: 'q5', label: 'What is your average ticket per patient visit?', type: 'text', prefix: '$', placeholder: '350' },
  { id: 'q6', label: 'Who is your ideal patient? Describe them — age, gender, what they\'re looking for, what concerns they have.', type: 'textarea', placeholder: 'Women 30–50, professionals, self-conscious about fine lines...' },
  { id: 'q7', label: 'What makes your clinic different from others in your area? Why should someone choose you?', type: 'textarea', placeholder: 'We specialise in natural-looking results, same-day appointments...' },
  { id: 'q8', label: 'Are you currently running any ads or have you in the past? If so, what worked and what didn\'t?', type: 'textarea', placeholder: 'Ran Google Ads for 6 months, low quality leads...' },
  { id: 'q9', label: 'What is your current monthly marketing budget (including ad spend)?', type: 'select', options: ['Under $500', '$500 – $1,000', '$1,000 – $2,000', '$2,000 – $5,000', '$5,000+'] },
  { id: 'q10', label: 'What is your biggest challenge right now when it comes to getting new patients?', type: 'textarea', placeholder: 'Getting consistent leads, not just inquiries...' },
  { id: 'q11', label: 'How does your team currently handle new inquiries? (DMs, phone, email, booking system)', type: 'textarea', placeholder: 'Front desk calls back within a day...' },
  { id: 'q12', label: 'What booking or POS system do you use? (Boulevard, Vagaro, Jane, Mangomint, other)', type: 'text', placeholder: 'e.g. Jane App' },
  { id: 'q13', label: "What are your clinic's hours of operation?", type: 'text', placeholder: 'Mon–Fri 9am–6pm, Sat 10am–4pm' },
  { id: 'q14', label: 'Do you have before/after patient photos with consent that we can use in ads?', type: 'radio', options: ['Yes', 'No', 'Some but need to get consent'] },
  { id: 'q15', label: 'Anything else you want us to know about your clinic, your goals, or your concerns?', type: 'textarea', placeholder: 'Open field — anything goes...' },
] as const;

const ROADMAP_STEPS = [
  { n: '01', time: '24 Hours', title: 'Welcome + Onboarding', body: 'This document, your 20-day roadmap, your creative concept, and your intake form are waiting for you. Take 20 minutes to walk through it all.' },
  { n: '02', time: '48 Hours', title: 'Creative Preview Delivered', body: 'Within 48 hours of signing, you\'ll see 3–4 ad concepts built and briefed specifically for your spa. Not final — these will evolve with data and show you the direction we\'re starting from.' },
  { n: '03', time: '72 Hours', title: 'Access + Intake Complete', body: 'You\'ve filled out the intake and granted access to Meta Ads Manager and any other tool we need access to. Pixel and Conversions API installation begins immediately.' },
  { n: '04', time: 'Day 5–7', title: 'Kickoff Call', body: 'We jump on a 45-minute call to walk through strategy, finalize creative direction, confirm pixel and tracking are firing correctly, and align on the first 30 days.' },
  { n: '05', time: 'Day 10', title: 'Campaigns Go Live', body: 'Your first segmented campaigns launch. Treatment-level targeting and optimized booking flow. Meta enters its learning phase — lead volume and cost will be inconsistent for the first 7–10 days. This is expected and normal.' },
  { n: '06', time: 'Day 20', title: 'First Real Data', body: 'Learning phase is complete. We review the first real performance data together. CPL has stabilised, first booked appointments are flowing in, and we\'re making our first optimisation decisions based on signal, not noise.' },
];

const CHECKLIST_ITEMS = [
  {
    id: 'meta_ads',
    title: 'Meta Ads Manager',
    desc: 'Grant us Advertiser access to your ad account.',
    tutorialUrl: '', // TODO: Loom tutorial URL
    inputs: [{ id: 'account_id', label: 'Your Ad Account ID', placeholder: 'Found in Ads Manager → Settings', type: 'text' }],
    note: "No worries if you're not sure how — I can walk you through this on our kickoff call.",
  },
  {
    id: 'biz_manager',
    title: 'Meta Business Manager',
    desc: 'Add us as a partner.',
    tutorialUrl: '', // TODO: Loom tutorial URL
    inputs: [{ id: 'bm_id', label: 'Your Business Manager ID', placeholder: 'Found in Business Settings', type: 'text' }],
  },
  {
    id: 'instagram',
    title: 'Instagram Page',
    desc: 'Grant us access to run ads from your page.',
    tutorialUrl: '', // TODO: Loom tutorial URL
    inputs: [{ id: 'handle', label: 'Your Instagram handle', placeholder: '@yourclinic', type: 'text' }],
  },
  {
    id: 'facebook',
    title: 'Facebook Page',
    desc: 'Grant us access.',
    tutorialUrl: '', // TODO: Loom tutorial URL
    inputs: [{ id: 'page_url', label: 'Facebook Page URL', placeholder: 'facebook.com/yourclinic', type: 'text' }],
  },
  {
    id: 'booking_system',
    title: 'Booking System',
    desc: 'Share login so we can verify booking flow.',
    tutorialUrl: '',
    inputs: [
      { id: 'name_url', label: 'System name + login URL', placeholder: 'Jane App — jane.app/yourlogin', type: 'text' },
      { id: 'username', label: 'Username / email', placeholder: 'clinic@email.com', type: 'text' },
      { id: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
    ],
    note: "Prefer to share these on a call? Toggle 'I'll come back to this' and we'll handle it live.",
  },
];

const UPLOAD_FIELDS = [
  { id: 'logos', label: 'Clinic logo', hint: 'PNG with transparent background preferred', accept: '.png,.jpg,.svg', max: 1 },
  { id: 'clinic-photos', label: 'Clinic photos', hint: 'Interior, treatment rooms, staff — anything that shows the vibe', accept: 'image/*', max: 10 },
  { id: 'before-after', label: 'Before/after patient photos', hint: 'With patient consent', accept: 'image/*', max: 20 },
  { id: 'marketing-materials', label: 'Existing marketing materials', hint: 'Flyers, previous ad creatives, brand guides', accept: 'image/*,.pdf', max: 10 },
];

// ─── More types ───────────────────────────────────────────────────────────────

type FormData = Record<string, string>;
type ChecklistData = Record<string, { checked: boolean; inputs: Record<string, string> }>;

const TOTAL_FIELDS = 15 + 5;

function calcPct(form: FormData, checklist: ChecklistData): number {
  const filled = Object.values(form).filter((v) => typeof v === 'string' && v.trim().length > 0).length;
  const checked = Object.values(checklist).filter((v) => v?.checked).length;
  return Math.min(100, Math.round(((filled + checked) / TOTAL_FIELDS) * 100));
}
type UploadedFiles = Record<string, { url: string; name: string; path: string }[]>;

// ─── Styles ───────────────────────────────────────────────────────────────────

const OB_STYLES = `
  @keyframes obFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes savedFlash { 0%,100% { opacity: 0; } 20%,80% { opacity: 1; } }
  .ob-q-card { transition: border-color 0.2s; }
  .ob-q-card:focus-within { border-color: rgba(212,168,83,0.35) !important; }
  .ob-input { width: 100%; background: #0A0A0A; border: 1.5px solid #1e1e1e; border-radius: 8px; padding: 12px 14px; color: #F5F5F5; font-size: 14px; outline: none; font-family: inherit; transition: border-color 0.15s; resize: vertical; }
  .ob-input:focus { border-color: #D4A853; }
  .ob-input::placeholder { color: #3a3a3a; }
`;

// ─── Small helpers ────────────────────────────────────────────────────────────

function SectionHeader({ n, title, subtitle }: { n: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', color: '#D4A853', fontWeight: 700, letterSpacing: '0.1em', background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.25)', borderRadius: '6px', padding: '3px 8px' }}>{n}</span>
        <h2 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 800, color: '#F5F5F5', margin: 0, letterSpacing: '-0.02em' }}>{title}</h2>
      </div>
      {subtitle && <p style={{ color: '#777', fontSize: '14px', margin: 0, paddingLeft: '0' }}>{subtitle}</p>}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '20px 22px', ...style }}>
      {children}
    </div>
  );
}

function SkipBtn({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={active ? "Mark as complete" : "I'll come back to this"}
      style={{
        flexShrink: 0, background: 'none',
        border: `1px solid ${active ? '#D4A853' : 'rgba(239,68,68,0.4)'}`,
        borderRadius: '6px',
        padding: '4px 8px', fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em',
        color: active ? '#D4A853' : 'rgba(239,68,68,0.6)',
        cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
      }}
    >
      {active ? '↩ Come back' : 'Skip for now'}
    </button>
  );
}

function DocPreviewButton({ url, label }: { url: string; label: string }) {
  const [open, setOpen] = useState(false);
  if (!url) {
    return <span style={{ color: '#444', fontSize: '13px' }}>→ {label} <span style={{ color: '#3a3a3a' }}>(coming soon)</span></span>;
  }
  return (
    <>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: '#D4A853', fontSize: '13px', fontWeight: 600 }}>→ {label}</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, border: '1px solid #2a2a2a', background: 'transparent', color: '#888', cursor: 'pointer' }}
        >
          Preview
        </button>
        <a
          href={url}
          download
          style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, border: '1px solid rgba(212,168,83,0.3)', background: 'transparent', color: '#D4A853', textDecoration: 'none' }}
        >
          Download ↓
        </a>
      </div>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.93)', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
            <span style={{ color: '#AAAAAA', fontSize: '13px', fontWeight: 600 }}>{label}</span>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <a href={url} download style={{ color: '#D4A853', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>Download ↓</a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', fontSize: '22px', lineHeight: 1, padding: '2px 6px' }}
              >
                ×
              </button>
            </div>
          </div>
          <iframe
            src={url}
            style={{ flex: 1, width: '100%', border: 'none', background: '#fff' }}
            title={label}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

function ShowHideInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="ob-input"
        style={{ paddingRight: '48px' }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '12px' }}
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

// ─── File Upload Zone ─────────────────────────────────────────────────────────

function FileUploadZone({
  fieldId, label, hint, accept, max, clientId,
  files, onUploaded, onRemove,
}: {
  fieldId: string; label: string; hint: string; accept: string; max: number;
  clientId: string; files: { url: string; name: string; path: string }[];
  onUploaded: (f: { url: string; name: string; path: string }) => void;
  onRemove: (path: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const remaining = max - files.length;
    const toUpload = Array.from(fileList).slice(0, remaining);
    setUploading(true); setError('');
    for (const file of toUpload) {
      if (file.size > 10 * 1024 * 1024) { setError(`${file.name} exceeds 10 MB limit`); continue; }
      const fd = new FormData();
      fd.append('file', file); fd.append('clientId', clientId); fd.append('category', fieldId);
      const res = await fetch('/api/onboarding/upload', { method: 'POST', body: fd });
      if (res.ok) { const data = await res.json(); onUploaded(data); }
      else { const { error: e } = await res.json(); setError(e ?? 'Upload failed'); }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  const isImage = (name: string) => /\.(png|jpg|jpeg|webp|svg)$/i.test(name);

  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#AAAAAA', marginBottom: '10px' }}>
        {label} <span style={{ color: '#555', fontWeight: 400 }}>— {hint}</span>
      </label>

      {/* Uploaded file previews */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          {files.map((f) => (
            <div key={f.path} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1e1e1e', background: '#0A0A0A' }}>
              {isImage(f.name) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.url} alt={f.name} style={{ width: '72px', height: '72px', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '72px', height: '72px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="1" width="14" height="18" rx="2" stroke="#555" strokeWidth="1.5"/><path d="M7 7h6M7 11h6M7 15h4" stroke="#555" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: '9px', color: '#555', textAlign: 'center', padding: '0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '64px' }}>{f.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemove(f.path)}
                style={{ position: 'absolute', top: '3px', right: '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(0,0,0,0.75)', border: 'none', color: '#ccc', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      {files.length < max && (
        <>
          <input ref={inputRef} type="file" accept={accept} multiple={max > 1} className="hidden" style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: '1px dashed #2a2a2a',
              background: 'transparent', color: uploading ? '#444' : '#888', cursor: uploading ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
            }}
          >
            {uploading ? 'Uploading…' : `+ Upload file${max > 1 ? 's' : ''}`}
            {max > 1 && files.length > 0 && <span style={{ color: '#555', fontWeight: 400 }}> ({files.length}/{max})</span>}
          </button>
        </>
      )}
      {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{error}</p>}
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({
  q, value, skipped, onChange, onToggleSkip, clientId, uploads, onUploaded, onRemove,
}: {
  q: (typeof INTAKE_QUESTIONS)[number];
  value: string;
  skipped: boolean;
  onChange: (v: string) => void;
  onToggleSkip: () => void;
  clientId: string;
  uploads?: { url: string; name: string; path: string }[];
  onUploaded?: (f: { url: string; name: string; path: string }) => void;
  onRemove?: (path: string) => void;
}) {
  return (
    <div
      className="ob-q-card"
      id={`question-${q.id}`}
      style={{ background: '#141414', border: `1.5px solid ${skipped ? '#D4A853' : '#1e1e1e'}`, borderRadius: '12px', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <label style={{ fontSize: '14px', fontWeight: 600, color: '#F5F5F5', lineHeight: 1.4, flex: 1 }}>{q.label}</label>
        <SkipBtn active={skipped} onClick={onToggleSkip} />
      </div>

      {skipped && (
        <div style={{ fontSize: '11px', color: '#D4A853', background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.2)', borderRadius: '6px', padding: '6px 10px' }}>
          Marked "come back to this" — fill this in when you're ready
        </div>
      )}

      {'prefix' in q && q.prefix && (
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#555', fontSize: '14px' }}>{q.prefix}</span>
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={'placeholder' in q ? q.placeholder : ''} className="ob-input" style={{ paddingLeft: '28px' }} />
        </div>
      )}

      {q.type === 'text' && !('prefix' in q && q.prefix) && (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={'placeholder' in q ? q.placeholder : ''} className="ob-input" />
      )}

      {q.type === 'textarea' && (
        <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} placeholder={'placeholder' in q ? q.placeholder : ''} className="ob-input" />
      )}

      {q.type === 'select' && 'options' in q && (
        <select value={value} onChange={(e) => onChange(e.target.value)} className="ob-input" style={{ cursor: 'pointer' }}>
          <option value="">Select an option…</option>
          {q.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )}

      {q.type === 'radio' && 'options' in q && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {q.options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              style={{
                padding: '9px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                border: value === o ? '1.5px solid #D4A853' : '1.5px solid #252525',
                background: value === o ? 'rgba(212,168,83,0.1)' : '#0F0F0F',
                color: value === o ? '#D4A853' : '#888',
              }}
            >{o}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Checklist Item ───────────────────────────────────────────────────────────

function ChecklistCard({
  item, data, skipped, onChange, onToggleSkip,
}: {
  item: typeof CHECKLIST_ITEMS[number];
  data: { checked: boolean; inputs: Record<string, string> };
  skipped: boolean;
  onChange: (d: { checked: boolean; inputs: Record<string, string> }) => void;
  onToggleSkip: () => void;
}) {
  return (
    <div
      id={`checklist-${item.id}`}
      style={{ background: '#141414', border: `1.5px solid ${skipped ? '#D4A853' : data.checked ? 'rgba(76,175,80,0.3)' : '#1e1e1e'}`, borderRadius: '12px', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <button
          type="button"
          onClick={() => onChange({ ...data, checked: !data.checked })}
          style={{
            width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, marginTop: '1px',
            border: `2px solid ${data.checked ? '#4CAF50' : '#333'}`,
            background: data.checked ? '#4CAF50' : 'transparent', cursor: 'pointer', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {data.checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L4.5 8.5L10 3" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#F5F5F5', margin: '0 0 2px' }}>{item.title}</p>
          <p style={{ fontSize: '13px', color: '#777', margin: 0 }}>{item.desc}</p>
        </div>
        <SkipBtn active={skipped} onClick={onToggleSkip} />
      </div>

      {item.tutorialUrl ? (
        <a href={item.tutorialUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#D4A853', textDecoration: 'none', fontWeight: 600 }}>
          ▶ Watch the 2-min tutorial
        </a>
      ) : (
        <span style={{ fontSize: '11px', color: '#444' }}>Tutorial link coming soon {/* TODO: add Loom URL */}</span>
      )}

      {item.inputs.map((inp) => (
        <div key={inp.id}>
          <label style={{ display: 'block', fontSize: '12px', color: '#AAAAAA', marginBottom: '6px', fontWeight: 500 }}>{inp.label}</label>
          {inp.type === 'password' ? (
            <ShowHideInput
              value={data.inputs[inp.id] ?? ''}
              onChange={(v) => onChange({ ...data, inputs: { ...data.inputs, [inp.id]: v } })}
              placeholder={inp.placeholder}
            />
          ) : (
            <input
              type="text"
              value={data.inputs[inp.id] ?? ''}
              onChange={(e) => onChange({ ...data, inputs: { ...data.inputs, [inp.id]: e.target.value } })}
              placeholder={inp.placeholder}
              className="ob-input"
            />
          )}
        </div>
      ))}

      {'note' in item && item.note && (
        <p style={{ fontSize: '12px', color: '#555', margin: 0, fontStyle: 'italic' }}>{item.note}</p>
      )}
    </div>
  );
}

// ─── Main Onboarding Component ────────────────────────────────────────────────

function OnboardingContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('client');

  const [formData, setFormData] = useState<FormData>({});
  const [checklistData, setChecklistData] = useState<ChecklistData>({});
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [completionPct, setCompletionPct] = useState(0);
  const [isReturning, setIsReturning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);
  const [obConfig, setObConfig] = useState<ObConfig>({ roadmap_image_url: '', sop_creatives_url: '', sop_campaigns_url: '', calendly_url: '' });
  const [qOverrides, setQOverrides] = useState<{ id: string; label: string; placeholder: string; active: boolean }[]>([]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingData = useRef<{ form: FormData; checklist: ChecklistData; skip: string[]; files: UploadedFiles } | null>(null);

  // Load existing data and global config on mount
  useEffect(() => {
    if (!clientId) { setLoading(false); return; }
    Promise.all([
      fetch(`/api/onboarding/${clientId}`).then((r) => r.json()),
      fetch('/api/config').then((r) => r.json()).catch(() => ({ configs: {} })),
    ]).then(([clientRes, configRes]) => {
      const { data } = clientRes;
      if (data) {
        setIsReturning(true);
        setFormData(data.form_data ?? {});
        setChecklistData(data.checklist_data ?? {});
        setSkipped(new Set(data.skipped_questions ?? []));
        setUploadedFiles(data.uploaded_files ?? {});
        setCompletionPct(data.completion_percentage ?? 0);
        setHiddenSections(data.hidden_sections ?? []);
      }
      if (configRes?.configs?.onboarding) {
        setObConfig((prev) => ({ ...prev, ...configRes.configs.onboarding }));
      }
      const qRaw = configRes?.configs?.onboarding_questions?.config;
      if (qRaw) {
        try { setQOverrides(JSON.parse(qRaw)); } catch {}
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [clientId]);

  const triggerSave = useCallback((form: FormData, checklist: ChecklistData, skip: Set<string>, files: UploadedFiles) => {
    pendingData.current = { form, checklist, skip: [...skip], files };
    setSaveStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!clientId || !pendingData.current) return;
      const { form: f, checklist: c, skip: s, files: u } = pendingData.current;
      const res = await fetch(`/api/onboarding/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_data: f, checklist_data: c, skipped_questions: s, uploaded_files: u }),
      });
      if (res.ok) {
        const { completion_percentage } = await res.json();
        setCompletionPct(completion_percentage ?? 0);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('idle');
      }
    }, 2000);
  }, [clientId]);

  function updateForm(id: string, value: string) {
    const next = { ...formData, [id]: value };
    setFormData(next);
    setCompletionPct(calcPct(next, checklistData));
    triggerSave(next, checklistData, skipped, uploadedFiles);
  }

  function updateChecklist(id: string, data: { checked: boolean; inputs: Record<string, string> }) {
    const next = { ...checklistData, [id]: data };
    setChecklistData(next);
    setCompletionPct(calcPct(formData, next));
    triggerSave(formData, next, skipped, uploadedFiles);
  }

  function toggleSkip(id: string) {
    const next = new Set(skipped);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSkipped(next);
    triggerSave(formData, checklistData, next, uploadedFiles);
  }

  function addFile(category: string, file: { url: string; name: string; path: string }) {
    const next = { ...uploadedFiles, [category]: [...(uploadedFiles[category] ?? []), file] };
    setUploadedFiles(next);
    triggerSave(formData, checklistData, skipped, next);
  }

  function removeFile(category: string, path: string) {
    fetch('/api/onboarding/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId, path }) }).catch(() => {});
    const next = { ...uploadedFiles, [category]: (uploadedFiles[category] ?? []).filter((f) => f.path !== path) };
    setUploadedFiles(next);
    triggerSave(formData, checklistData, skipped, next);
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const skippedList = [...skipped];
  const clientLabel = clientId ? clientId.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';

  // Merge admin question overrides with hardcoded defaults
  type AnyQ = (typeof INTAKE_QUESTIONS)[number];
  const activeQuestions = INTAKE_QUESTIONS.map((q): AnyQ | null => {
    const ov = qOverrides.find((o) => o.id === q.id);
    if (ov && !ov.active) return null;
    if (!ov) return q;
    return { ...q, label: ov.label || q.label, placeholder: ov.placeholder ?? ('placeholder' in q ? q.placeholder : '') } as unknown as AnyQ;
  }).filter((q): q is AnyQ => q !== null);

  // Dynamic section numbering — only count sections that are visible
  const SECTION_ORDER = ['roadmap', 'contact', 'creative', 'intake', 'brand_assets', 'checklist', 'kickoff'] as const;
  const visibleSections = SECTION_ORDER.filter((id) => !hiddenSections.includes(id));
  function sNum(id: typeof SECTION_ORDER[number]): string {
    const i = visibleSections.indexOf(id);
    return i >= 0 ? String(i + 1).padStart(2, '0') : '';
  }

  // ── Invalid link ───────────────────────────────────────────────────────────
  if (!clientId) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <p style={{ color: '#D4A853', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>Monotising</p>
          <h1 style={{ color: '#F5F5F5', fontSize: '24px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>This is a client-specific page.</h1>
          <p style={{ color: '#777', fontSize: '15px', lineHeight: 1.6 }}>
            This onboarding link is unique to your clinic. If you received a link from Monotising, please use that link to access your onboarding page.
          </p>
          <p style={{ color: '#555', fontSize: '13px', marginTop: '24px' }}>Questions? Text us: <span style={{ color: '#D4A853' }}>+1 647 514 6919</span></p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#555', fontSize: '14px' }}>Loading your onboarding…</p>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: OB_STYLES }} />

      {/* Sticky progress bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#0A0A0A', borderBottom: '1px solid #141414', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ fontSize: '11px', color: '#555', whiteSpace: 'nowrap' }}>Progress</span>
        <div style={{ flex: 1, height: '4px', background: '#1a1a1a', borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${completionPct}%`, background: 'linear-gradient(90deg,#D4A853,#E8C26A)', borderRadius: '9999px', transition: 'width 0.6s ease' }} />
        </div>
        <span style={{ fontSize: '11px', color: '#D4A853', fontWeight: 700, whiteSpace: 'nowrap' }}>{completionPct}%</span>
        {saveStatus !== 'idle' && (
          <span style={{ fontSize: '11px', color: saveStatus === 'saved' ? '#4CAF50' : '#777', whiteSpace: 'nowrap', animation: saveStatus === 'saved' ? 'savedFlash 3s ease-out' : undefined }}>
            {saveStatus === 'saving' ? '⟳ Saving…' : '✓ Saved'}
          </span>
        )}
      </div>

      <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#F5F5F5', fontFamily: '-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px' }}>

          {/* ── Section 1: Welcome ──────────────────────────────────────────── */}
          <section style={{ paddingTop: '56px', paddingBottom: '56px', animation: 'obFadeIn 0.5s ease-out both' }}>
            <p style={{ fontSize: '12px', color: '#D4A853', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>Monotising</p>
            {isReturning && (
              <div style={{ background: 'rgba(76,175,80,0.07)', border: '1px solid rgba(76,175,80,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px' }}>
                <p style={{ color: '#4CAF50', fontSize: '14px', fontWeight: 600, margin: 0 }}>Welcome back — your progress has been saved. Pick up where you left off.</p>
              </div>
            )}
            <h1 style={{ fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 800, color: '#D4A853', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '12px' }}>
              Welcome to Monotising
            </h1>
            <p style={{ color: '#AAAAAA', fontSize: '16px', lineHeight: 1.6, marginBottom: '20px', maxWidth: '560px' }}>
              Everything you need to get started is on this page. Fill it out at your own pace — your progress saves automatically.
            </p>
            <div style={{ display: 'inline-block', background: '#141414', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '8px 16px' }}>
              <span style={{ color: '#555', fontSize: '12px' }}>Onboarding: </span>
              <span style={{ color: '#F5F5F5', fontSize: '12px', fontWeight: 700 }}>{clientLabel}</span>
            </div>
          </section>

          {/* ── Section 2: Roadmap ─────────────────────────────────────────── */}
          {!hiddenSections.includes('roadmap') && (
          <section style={{ paddingBottom: '56px' }}>
            <SectionHeader n={sNum('roadmap')} title="Your Paid Acquisition Roadmap" subtitle="Here's what to expect over the next 20 days." />

            <Card style={{ marginBottom: '24px', padding: 0, overflow: 'hidden' }}>
              {obConfig.roadmap_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={obConfig.roadmap_image_url} alt="20-day roadmap" style={{ width: '100%', display: 'block' }} />
              ) : (
                <div style={{ height: '280px', background: '#0d0d0d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '12px' }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="3" y="3" width="26" height="26" rx="4" stroke="#2a2a2a" strokeWidth="1.5" strokeDasharray="4 3"/><circle cx="12" cy="13" r="3" fill="#2a2a2a"/><path d="M4 25l8-8 5 5 4-3 7 6" stroke="#2a2a2a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ color: '#333', fontSize: '13px' }}>Roadmap image — upload via Admin → Onboarding Settings</span>
                </div>
              )}
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ROADMAP_STEPS.map((step) => (
                <Card key={step.n} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#D4A853', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: '2px' }}>{step.time}</span>
                    <span style={{ fontSize: '11px', color: '#444', fontWeight: 700, letterSpacing: '0.05em' }}>STEP {step.n}</span>
                  </div>
                  <div>
                    <p style={{ color: '#F5F5F5', fontWeight: 700, fontSize: '14px', margin: '0 0 4px' }}>{step.title}</p>
                    <p style={{ color: '#777', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{step.body}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
          )} {/* end roadmap */}

          {/* ── Section 3: Contact ─────────────────────────────────────────── */}
          {!hiddenSections.includes('contact') && (
          <section style={{ paddingBottom: '56px' }}>
            <SectionHeader n={sNum('contact')} title="Your Direct Line to Me" />
            <Card style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: '#555', fontSize: '13px', minWidth: '50px' }}>Phone</span>
                <a href="tel:+16475146919" style={{ color: '#D4A853', fontSize: '16px', fontWeight: 700, textDecoration: 'none' }}>+1 647 514 6919</a>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: '#555', fontSize: '13px', minWidth: '50px' }}>Email</span>
                <a href="mailto:monotising@gmail.com" style={{ color: '#D4A853', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }}>monotising@gmail.com</a>
              </div>
              <p style={{ color: '#777', fontSize: '13px', margin: 0, borderTop: '1px solid #1e1e1e', paddingTop: '12px', fontStyle: 'italic' }}>
                Reach out anytime you have a question. I'd rather you text me than wonder about something.
              </p>
            </Card>
          </section>
          )} {/* end contact */}

          {/* ── Section 4: Creative Concept ────────────────────────────────── */}
          {!hiddenSections.includes('creative') && (
          <section style={{ paddingBottom: '56px' }}>
            <SectionHeader n={sNum('creative')} title="Creative Direction" />
            <Card style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: '#AAAAAA', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                We will share a demo of 3 ads to get an idea of your brand's styling. These are starting points — they'll evolve based on performance data.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <DocPreviewButton url={obConfig.sop_creatives_url} label="How We Create High-Converting Static Creatives for Med Spas" />
                <DocPreviewButton url={obConfig.sop_campaigns_url} label="How We Structure Meta Ad Campaigns for Med Spas" />
              </div>
              <p style={{ color: '#555', fontSize: '12px', margin: 0, fontStyle: 'italic' }}>These guides are optional reading — they give you a deeper look at our process if you're curious.</p>
            </Card>
          </section>
          )} {/* end creative */}

          {/* ── Section 5: Intake Form ─────────────────────────────────────── */}
          {!hiddenSections.includes('intake') && (
          <section style={{ paddingBottom: '56px' }}>
            <SectionHeader n={sNum('intake')} title="Intake Form" subtitle="Fill out as much detail as possible. Your answers help us build campaigns tailored specifically to your clinic." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeQuestions.map((q) => (
                <QuestionCard
                  key={q.id}
                  q={q}
                  value={formData[q.id] ?? ''}
                  skipped={skipped.has(q.id)}
                  onChange={(v) => updateForm(q.id, v)}
                  onToggleSkip={() => toggleSkip(q.id)}
                  clientId={clientId}
                />
              ))}
            </div>
          </section>
          )} {/* end intake */}

          {/* ── Section 6: Brand Assets ────────────────────────────────────── */}
          {!hiddenSections.includes('brand_assets') && (
          <section style={{ paddingBottom: '56px' }}>
            <SectionHeader n={sNum('brand_assets')} title="Brand Assets" subtitle="Upload your brand files so we can match your clinic's look and feel in the ad creatives." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {UPLOAD_FIELDS.map((field) => {
                const skipId = `upload_${field.id}`;
                return (
                  <Card key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <FileUploadZone
                          fieldId={field.id}
                          label={field.label}
                          hint={field.hint}
                          accept={field.accept}
                          max={field.max}
                          clientId={clientId}
                          files={uploadedFiles[field.id] ?? []}
                          onUploaded={(f) => addFile(field.id, f)}
                          onRemove={(path) => removeFile(field.id, path)}
                        />
                      </div>
                      <SkipBtn active={skipped.has(skipId)} onClick={() => toggleSkip(skipId)} />
                    </div>
                    {skipped.has(skipId) && (
                      <div style={{ fontSize: '11px', color: '#D4A853', background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.2)', borderRadius: '6px', padding: '6px 10px' }}>
                        Marked "come back to this" — upload when ready
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
          )} {/* end brand_assets */}

          {/* ── Section 7: Access Checklist ────────────────────────────────── */}
          {!hiddenSections.includes('checklist') && (
          <section style={{ paddingBottom: '56px' }}>
            <SectionHeader n={sNum('checklist')} title="Access Checklist" subtitle="We need access to a few things to get started. Each item has a tutorial if you're not sure how." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {CHECKLIST_ITEMS.map((item) => (
                <ChecklistCard
                  key={item.id}
                  item={item}
                  data={checklistData[item.id] ?? { checked: false, inputs: {} }}
                  skipped={skipped.has(`checklist_${item.id}`)}
                  onChange={(d) => updateChecklist(item.id, d)}
                  onToggleSkip={() => toggleSkip(`checklist_${item.id}`)}
                />
              ))}
            </div>
          </section>
          )} {/* end checklist */}

          {/* ── Section 8: Kickoff Call ────────────────────────────────────── */}
          {!hiddenSections.includes('kickoff') && (
          <section style={{ paddingBottom: '56px' }}>
            <SectionHeader n={sNum('kickoff')} title="Book Your Kickoff Call" subtitle="Once you've completed the intake form and access checklist, book our kickoff call below." />
            {obConfig.calendly_url ? (
              <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden', minHeight: '600px' }}>
                <iframe src={obConfig.calendly_url} width="100%" height="600" frameBorder="0" title="Book a call" />
              </div>
            ) : (
              <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ margin: '0 auto 12px', display: 'block' }}><rect x="5" y="9" width="26" height="22" rx="4" stroke="#2a2a2a" strokeWidth="1.5"/><path d="M5 16H31" stroke="#2a2a2a" strokeWidth="1.5"/><path d="M13 5V11M23 5V11" stroke="#2a2a2a" strokeWidth="1.5" strokeLinecap="round"/><rect x="10" y="20" width="5" height="5" rx="1" fill="#D4A853" opacity="0.4"/></svg>
                <p style={{ color: '#555', fontSize: '14px', marginBottom: '4px' }}>Calendly booking will appear here</p>
                <p style={{ color: '#3a3a3a', fontSize: '12px' }}>Set your Calendly URL via Admin → Onboarding Settings</p>
              </Card>
            )}
          </section>
          )} {/* end kickoff */}

          {/* ── Section 9: Skipped Questions ──────────────────────────────── */}
          {skippedList.length > 0 && (
            <section style={{ paddingBottom: '56px' }}>
              <SectionHeader n="↩" title="Come Back To These" subtitle="Questions you've marked to complete later." />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {skippedList.map((id) => {
                  const isChecklist = id.startsWith('checklist_');
                  const qId = isChecklist ? id.replace('checklist_', '') : id;
                  const q = activeQuestions.find((x) => x.id === qId);
                  const cl = CHECKLIST_ITEMS.find((x) => x.id === qId);
                  const label = q?.label ?? cl?.title ?? id;
                  const section = isChecklist ? 'Access Checklist' : 'Intake Form';
                  const targetId = isChecklist ? `checklist-${qId}` : `question-${qId}`;
                  return (
                    <div key={id} style={{ background: '#141414', border: '1px solid rgba(212,168,83,0.2)', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: '#D4A853', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{section}</span>
                        <p style={{ color: '#AAAAAA', fontSize: '13px', margin: '2px 0 0', lineHeight: 1.4 }}>{label}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => scrollTo(targetId)}
                        style={{ padding: '7px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, border: '1px solid rgba(212,168,83,0.3)', background: 'transparent', color: '#D4A853', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        Jump to question →
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {skippedList.length === 0 && completionPct >= 80 && (
            <Card style={{ textAlign: 'center', padding: '32px', border: '1px solid rgba(76,175,80,0.3)' }}>
              <p style={{ color: '#4CAF50', fontSize: '18px', fontWeight: 700, margin: '0 0 4px' }}>🎉 Looking great!</p>
              <p style={{ color: '#777', fontSize: '14px', margin: 0 }}>You're almost done. Make sure to book your kickoff call above.</p>
            </Card>
          )}

          {/* ── Footer ────────────────────────────────────────────────────── */}
          <footer style={{ borderTop: '1px solid #141414', paddingTop: '40px', textAlign: 'center' }}>
            <p style={{ color: '#D4A853', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>Monotising</p>
            <p style={{ color: '#555', fontSize: '13px', margin: '0 0 4px' }}>Questions? Text me anytime: <a href="tel:+16475146919" style={{ color: '#AAAAAA', textDecoration: 'none' }}>+1 647 514 6919</a></p>
            <p style={{ color: '#555', fontSize: '13px', margin: 0 }}>Or email: <a href="mailto:monotising@gmail.com" style={{ color: '#AAAAAA', textDecoration: 'none' }}>monotising@gmail.com</a></p>
          </footer>

        </div>
      </div>
    </>
  );
}

// ─── Export (wrapped in Suspense for useSearchParams) ────────────────────────

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#555', fontSize: '14px' }}>Loading…</p>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
