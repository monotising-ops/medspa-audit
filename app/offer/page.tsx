'use client';

// TODO: Connect Supabase — write form responses to 'offer_leads' table on submit
// TODO: Add Meta Pixel — fire PageView on mount, Lead event on form completion
// TODO: Replace placeholder testimonial containers with real DM screenshot images
// TODO: Add actual client video embeds (Loom/YouTube URLs) in video placeholder slots
// TODO: Wire up form submit to webhook / CRM once backend is ready

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  location: string;
  treatments: string[];
  spend: string;
  challenge: string;
  name: string;
  phone: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TREATMENT_OPTIONS = [
  'Botox / Anti-Wrinkle',
  'Dermal Filler',
  'Laser Treatments',
  'Microneedling',
  'Hydrafacials',
  'Body Contouring',
  'Other',
];

const SPEND_OPTIONS = [
  '$0 — not running ads',
  'Under $1,000',
  '$1,000 – $3,000',
  '$3,000 – $5,000',
  '$5,000+',
];

const CHALLENGE_OPTIONS = [
  'Not enough new patients',
  'Leads but no bookings',
  'High no-show rate',
  "Don't know if ads are working",
  'Need a better system',
];

const CLIENT_RESULTS = [
  {
    id: 1,
    name: "Aman & Niel's Med Spa",
    location: 'Local Market',
    before: '$7,800 adspend · 1.26× ROAS',
    after: '$4,060 adspend · 4.43× ROAS · $17,700+ collected',
    highlight: '71 confirmed bookings in one month',
  },
  {
    id: 2,
    name: 'Family-Run Med Spa',
    location: 'New York, NY',
    before: '$3,200/mo · ~8 new patients/mo',
    after: '$2,800/mo · 31 new patients/mo',
    highlight: '4× new patient volume at lower spend',
  },
  {
    id: 3,
    name: 'Aesthetic Clinic',
    location: 'Toronto, ON',
    before: 'No paid advertising',
    after: '$11,000+ in bookings in first 30 days',
    highlight: 'First 5-figure month from a cold start',
  },
];

// ─── Styles injected once ─────────────────────────────────────────────────────

const GLOBAL_STYLES = `
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(28px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-28px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .offer-option-btn:hover {
    border-color: #D4A853 !important;
    background: rgba(212,168,83,0.06) !important;
    color: #F5F5F5 !important;
  }
  .offer-scroll::-webkit-scrollbar { display: none; }
  .offer-scroll { -ms-overflow-style: none; scrollbar-width: none; }
`;

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = ((step + 1) / total) * 100;
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', color: '#555', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Step {step + 1} of {total}
        </span>
        <span style={{ fontSize: '11px', color: '#555' }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: '3px', background: '#1F1F1F', borderRadius: '9999px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #D4A853, #E8C26A)',
            borderRadius: '9999px',
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  );
}

// ─── Option Button ────────────────────────────────────────────────────────────

function OptionBtn({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="offer-option-btn"
      onClick={onClick}
      style={{
        width: '100%',
        padding: '14px 18px',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: 500,
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.15s',
        border: selected ? '1.5px solid #D4A853' : '1.5px solid #222',
        background: selected ? 'rgba(212,168,83,0.1)' : '#0F0F0F',
        color: selected ? '#D4A853' : '#999',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <span
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          border: selected ? '2px solid #D4A853' : '2px solid #333',
          background: selected ? '#D4A853' : 'transparent',
          flexShrink: 0,
          transition: 'all 0.15s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 4L3 5.5L6.5 2" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

// ─── Arrow Button ─────────────────────────────────────────────────────────────

function ArrowBtn({ onClick, disabled, label = 'Continue' }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '15px',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: 700,
        border: 'none',
        background: disabled ? '#1A1A1A' : '#D4A853',
        color: disabled ? '#444' : '#000',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '8px',
      }}
    >
      {label}
      {!disabled && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8H13M9 4L13 8L9 12" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

// ─── Multi-Step Form ──────────────────────────────────────────────────────────

function MultiStepForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<FormData>({
    location: '',
    treatments: [],
    spend: '',
    challenge: '',
    name: '',
    phone: '',
  });

  const navigate = useCallback((toStep: number, dir: 'forward' | 'back') => {
    setDirection(dir);
    setAnimKey((k) => k + 1);
    setStep(toStep);
  }, []);

  function toggleTreatment(t: string) {
    setData((prev) => ({
      ...prev,
      treatments: prev.treatments.includes(t)
        ? prev.treatments.filter((x) => x !== t)
        : [...prev.treatments, t],
    }));
  }

  function selectSpend(v: string) {
    setData((prev) => ({ ...prev, spend: v }));
    setTimeout(() => navigate(3, 'forward'), 200);
  }

  function selectChallenge(v: string) {
    setData((prev) => ({ ...prev, challenge: v }));
    setTimeout(() => navigate(4, 'forward'), 200);
  }

  async function handleSubmit() {
    setSubmitting(true);
    // TODO: Replace console.log with Supabase insert to 'offer_leads' table
    console.log('[offer_lead]', data);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('offer_lead_name', data.name);
    }
    router.push('/offer/booked');
  }

  const animStyle = {
    animation: `${direction === 'forward' ? 'slideInRight' : 'slideInLeft'} 0.35s cubic-bezier(0.16, 1, 0.3, 1) both`,
  };

  return (
    <div
      style={{
        background: '#141414',
        border: '1px solid #1F1F1F',
        borderRadius: '20px',
        padding: '32px 28px',
        maxWidth: '480px',
        width: '100%',
        margin: '0 auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}
    >
      <ProgressBar step={step} total={5} />

      {/* Back link */}
      {step > 0 && (
        <button
          type="button"
          onClick={() => navigate(step - 1, 'back')}
          style={{
            background: 'none',
            border: 'none',
            color: '#555',
            fontSize: '13px',
            cursor: 'pointer',
            padding: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L5 7L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
      )}

      <div key={animKey} style={animStyle}>
        {/* Step 0: Location */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#F5F5F5', lineHeight: 1.3, margin: 0 }}>
              Where is your clinic located?
            </h2>
            <input
              type="text"
              placeholder="Example: Toronto, New York, Miami"
              value={data.location}
              onChange={(e) => setData((p) => ({ ...p, location: e.target.value }))}
              autoFocus
              style={{
                width: '100%',
                padding: '15px 16px',
                borderRadius: '10px',
                border: `1.5px solid ${data.location ? '#D4A853' : '#222'}`,
                background: '#0F0F0F',
                color: '#F5F5F5',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#D4A853')}
              onBlur={(e) => { if (!data.location) e.currentTarget.style.borderColor = '#222'; }}
              onKeyDown={(e) => { if (e.key === 'Enter' && data.location.trim()) navigate(1, 'forward'); }}
            />
            <ArrowBtn onClick={() => navigate(1, 'forward')} disabled={!data.location.trim()} />
          </div>
        )}

        {/* Step 1: Treatments */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#F5F5F5', lineHeight: 1.3, margin: '0 0 8px' }}>
              What treatments do you primarily offer?
            </h2>
            <p style={{ fontSize: '13px', color: '#555', margin: '0 0 4px' }}>Select all that apply</p>
            {TREATMENT_OPTIONS.map((opt) => (
              <OptionBtn
                key={opt}
                label={opt}
                selected={data.treatments.includes(opt)}
                onClick={() => toggleTreatment(opt)}
              />
            ))}
            <ArrowBtn
              onClick={() => navigate(2, 'forward')}
              disabled={data.treatments.length === 0}
            />
          </div>
        )}

        {/* Step 2: Marketing spend (single select — auto advance) */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#F5F5F5', lineHeight: 1.3, margin: '0 0 8px' }}>
              How much are you currently spending on marketing per month?
            </h2>
            {SPEND_OPTIONS.map((opt) => (
              <OptionBtn
                key={opt}
                label={opt}
                selected={data.spend === opt}
                onClick={() => selectSpend(opt)}
              />
            ))}
          </div>
        )}

        {/* Step 3: Challenge (single select — auto advance) */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#F5F5F5', lineHeight: 1.3, margin: '0 0 8px' }}>
              What's your biggest challenge right now?
            </h2>
            {CHALLENGE_OPTIONS.map((opt) => (
              <OptionBtn
                key={opt}
                label={opt}
                selected={data.challenge === opt}
                onClick={() => selectChallenge(opt)}
              />
            ))}
          </div>
        )}

        {/* Step 4: Contact */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#F5F5F5', lineHeight: 1.3, margin: 0 }}>
              Last step — best name and number to reach you
            </h2>
            <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
              We'll reach out to confirm your free strategy call.
            </p>
            <input
              type="text"
              placeholder="Your first name"
              value={data.name}
              onChange={(e) => setData((p) => ({ ...p, name: e.target.value }))}
              autoFocus
              style={{
                width: '100%',
                padding: '15px 16px',
                borderRadius: '10px',
                border: `1.5px solid ${data.name ? '#D4A853' : '#222'}`,
                background: '#0F0F0F',
                color: '#F5F5F5',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#D4A853')}
              onBlur={(e) => { if (!data.name) e.currentTarget.style.borderColor = '#222'; }}
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={data.phone}
              onChange={(e) => setData((p) => ({ ...p, phone: e.target.value }))}
              style={{
                width: '100%',
                padding: '15px 16px',
                borderRadius: '10px',
                border: `1.5px solid ${data.phone ? '#D4A853' : '#222'}`,
                background: '#0F0F0F',
                color: '#F5F5F5',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#D4A853')}
              onBlur={(e) => { if (!data.phone) e.currentTarget.style.borderColor = '#222'; }}
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!data.name.trim() || !data.phone.trim() || submitting}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 700,
                border: 'none',
                background: (!data.name.trim() || !data.phone.trim() || submitting) ? '#1A1A1A' : '#D4A853',
                color: (!data.name.trim() || !data.phone.trim() || submitting) ? '#444' : '#000',
                cursor: (!data.name.trim() || !data.phone.trim() || submitting) ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                marginTop: '4px',
              }}
            >
              {submitting ? 'Sending…' : 'Book My Free Strategy Call →'}
            </button>
            <p style={{ fontSize: '12px', color: '#444', textAlign: 'center', margin: 0 }}>
              No spam, ever. We'll only use this to confirm your call.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Client Result Card ───────────────────────────────────────────────────────

function ClientResultCard({ name, location, before, after, highlight }: (typeof CLIENT_RESULTS)[0]) {
  return (
    <div
      style={{
        background: '#141414',
        border: '1px solid #1F1F1F',
        borderLeft: '3px solid #D4A853',
        borderRadius: '12px',
        padding: '24px',
        minWidth: '280px',
        flex: '0 0 auto',
        width: 'clamp(280px, 80vw, 340px)',
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <p style={{ color: '#F5F5F5', fontWeight: 700, fontSize: '15px', margin: '0 0 2px' }}>{name}</p>
        <p style={{ color: '#555', fontSize: '12px', margin: 0 }}>{location}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: '#0F0F0F', borderRadius: '8px', padding: '12px' }}>
          <p style={{ color: '#555', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' }}>Before</p>
          <p style={{ color: '#777', fontSize: '13px', margin: 0 }}>{before}</p>
        </div>
        <div style={{ background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.15)', borderRadius: '8px', padding: '12px' }}>
          <p style={{ color: '#D4A853', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' }}>After Monotising</p>
          <p style={{ color: '#F5F5F5', fontSize: '13px', margin: 0 }}>{after}</p>
        </div>
      </div>

      <p style={{ color: '#4CAF50', fontSize: '13px', fontWeight: 600, margin: 0 }}>✓ {highlight}</p>
    </div>
  );
}

// ─── Testimonial Placeholder ──────────────────────────────────────────────────

function TestimonialPlaceholder({ label }: { label: string }) {
  return (
    <div
      style={{
        background: '#141414',
        border: '1px solid #1F1F1F',
        borderRadius: '12px',
        height: '200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        minWidth: '200px',
        flex: '0 0 auto',
        width: 'clamp(200px, 60vw, 240px)',
      }}
    >
      {/* TODO: Replace with actual DM screenshot images */}
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="24" height="24" rx="4" stroke="#333" strokeWidth="1.5" strokeDasharray="4 3" />
        <circle cx="10" cy="11" r="2" fill="#333" />
        <path d="M3 21l6-5 4 4 3-2.5 7 5.5" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: '11px', color: '#444' }}>{label}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OfferPage() {
  const formRef = useRef<HTMLDivElement>(null);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#F5F5F5', fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif' }}>

        {/* ── Section 1: Hero + Form ──────────────────────────────────────────── */}
        <section style={{ padding: '48px 20px 64px', textAlign: 'center' }}>
          {/* Logo */}
          <div style={{ marginBottom: '32px', animation: 'fadeUp 0.5s ease-out both' }}>
            {/* TODO: Replace with actual Monotising logo image */}
            <span style={{
              fontSize: '13px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#D4A853',
              fontWeight: 600,
            }}>
              Monotising
            </span>
          </div>

          {/* Headline */}
          <div style={{ maxWidth: '600px', margin: '0 auto 16px', animation: 'fadeUp 0.5s 0.1s ease-out both' }}>
            <h1 style={{
              fontSize: 'clamp(30px, 6vw, 52px)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: '#F5F5F5',
              margin: 0,
            }}>
              Fill Your Med Spa Calendar With{' '}
              <span style={{ color: '#D4A853' }}>Booked Appointments</span>
              {' '}— Not Just Leads
            </h1>
          </div>

          {/* Subheadline */}
          <p style={{
            fontSize: '16px',
            color: '#4CAF50',
            fontWeight: 600,
            marginBottom: '40px',
            animation: 'fadeUp 0.5s 0.2s ease-out both',
            letterSpacing: '0.01em',
          }}>
            Only pay when patients actually book.
          </p>

          {/* Form */}
          <div ref={formRef} style={{ animation: 'fadeUp 0.5s 0.3s ease-out both' }}>
            <MultiStepForm />
          </div>

          <p style={{ fontSize: '12px', color: '#444', marginTop: '16px' }}>
            Takes 60 seconds · No credit card · Free strategy call
          </p>
        </section>

        {/* ── Section 2: Risk Reversal ───────────────────────────────────────── */}
        <section style={{
          padding: '72px 20px',
          background: 'linear-gradient(180deg, #0A0A0A 0%, #0D0D0D 50%, #0A0A0A 100%)',
          textAlign: 'center',
          borderTop: '1px solid #131313',
          borderBottom: '1px solid #131313',
        }}>
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <p style={{ fontSize: '11px', color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '20px' }}>
              Our Guarantee
            </p>
            <h2 style={{
              fontSize: 'clamp(26px, 5vw, 42px)',
              fontWeight: 800,
              color: '#F5F5F5',
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              marginBottom: '20px',
            }}>
              We put our money where our mouth is.
            </h2>
            <p style={{
              fontSize: 'clamp(16px, 3vw, 20px)',
              color: '#4CAF50',
              fontWeight: 600,
              lineHeight: 1.5,
              margin: 0,
            }}>
              If we don't deliver real, booked appointments for your clinic — you don't pay.
              That's our guarantee.
            </p>
          </div>
        </section>

        {/* ── Section 3: Client Results ──────────────────────────────────────── */}
        <section style={{ padding: '72px 0 40px' }}>
          <div style={{ textAlign: 'center', padding: '0 20px', marginBottom: '40px' }}>
            <p style={{ fontSize: '11px', color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>
              Real Results
            </p>
            <h2 style={{
              fontSize: 'clamp(22px, 4vw, 34px)',
              fontWeight: 800,
              color: '#F5F5F5',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              maxWidth: '520px',
              margin: '0 auto',
            }}>
              See why clinics across the US and Canada trust Monotising
            </h2>
          </div>

          {/* Horizontal scroll on mobile */}
          <div
            className="offer-scroll"
            style={{
              display: 'flex',
              gap: '16px',
              overflowX: 'auto',
              padding: '0 20px 20px',
            }}
          >
            {CLIENT_RESULTS.map((r) => (
              <ClientResultCard key={r.id} {...r} />
            ))}
          </div>
        </section>

        {/* ── Section 4: Testimonials ────────────────────────────────────────── */}
        <section style={{ padding: '40px 0 72px' }}>
          <div style={{ textAlign: 'center', padding: '0 20px', marginBottom: '28px' }}>
            <p style={{ color: '#AAAAAA', fontSize: '15px' }}>
              Don't take our word for it — here's what clients say
            </p>
          </div>

          {/* Horizontal scroll testimonials */}
          <div
            className="offer-scroll"
            style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '0 20px 8px' }}
          >
            <TestimonialPlaceholder label="DM screenshot 1" />
            <TestimonialPlaceholder label="DM screenshot 2" />
            <TestimonialPlaceholder label="DM screenshot 3" />
            <TestimonialPlaceholder label="DM screenshot 4" />
          </div>

          {/* TODO: Add video testimonial embed section here
              Structure: 2-col grid on desktop, single col on mobile
              Each card: dark #141414 bg, 16:9 aspect ratio iframe, name + clinic below */}
        </section>

        {/* ── Bottom CTA ─────────────────────────────────────────────────────── */}
        <section style={{
          padding: '56px 20px',
          textAlign: 'center',
          background: '#0D0D0D',
          borderTop: '1px solid #131313',
        }}>
          <p style={{ color: '#AAAAAA', fontSize: '16px', marginBottom: '24px', lineHeight: 1.5 }}>
            Ready to see if we're the right fit for your clinic?
          </p>
          <button
            type="button"
            onClick={scrollToForm}
            style={{
              padding: '16px 40px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 700,
              border: 'none',
              background: '#D4A853',
              color: '#000',
              cursor: 'pointer',
              width: '100%',
              maxWidth: '360px',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            See If We're A Fit →
          </button>
          <p style={{ fontSize: '12px', color: '#444', marginTop: '12px' }}>
            Free 20-minute call · No obligation · No hard sell
          </p>
        </section>

      </div>
    </>
  );
}
