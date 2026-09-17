'use client';

// TODO: Add Meta Pixel — fire CompleteRegistration event on mount
// TODO: Replace placeholder testimonial containers with real screenshot images
// TODO: Verify form data was submitted (redirect to /offer if sessionStorage is empty)

import { useEffect, useState } from 'react';
import { defaultVSL } from '@/lib/vsl-defaults';
import type { VSLConfig } from '@/types';

const CALENDLY_FALLBACK = 'https://calendly.com/your-link-here';

const BOOKED_STYLES = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes checkPop {
    0%   { transform: scale(0); opacity: 0; }
    60%  { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }
`;

function TestimonialPlaceholder({ label }: { label: string }) {
  return (
    <div
      style={{
        background: '#141414',
        border: '1px solid #1F1F1F',
        borderRadius: '12px',
        height: '180px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
    >
      {/* TODO: Replace with actual DM screenshot image */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="3" stroke="#333" strokeWidth="1.5" strokeDasharray="3 2.5" />
        <circle cx="9" cy="9" r="1.5" fill="#333" />
        <path d="M3 18l5-4 3 3 2.5-2 5 4" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: '11px', color: '#444' }}>{label}</span>
    </div>
  );
}

export default function BookedPage() {
  const [name, setName] = useState('');
  const [vsl, setVsl] = useState<VSLConfig>(defaultVSL());
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    const n = sessionStorage.getItem('offer_lead_name');
    if (n) setName(n);
    fetch('/api/config')
      .then((r) => r.json())
      .then(({ configs }) => { if (configs?.vsl) setVsl((prev) => ({ ...prev, ...configs.vsl })); })
      .catch(() => {})
      .finally(() => setConfigLoaded(true));
  }, []);

  const calendlyUrl = vsl.calendly_url || CALENDLY_FALLBACK;
  const hasCalendly = Boolean(vsl.calendly_url) && !calendlyUrl.includes('your-link-here');

  useEffect(() => {
    if (!hasCalendly) return;
    const SRC = 'https://assets.calendly.com/assets/external/widget.js';
    if (document.querySelector(`script[src="${SRC}"]`)) return;
    const el = document.createElement('script');
    el.src = SRC;
    el.async = true;
    document.body.appendChild(el);
  }, [hasCalendly]);

  const whatToExpect = ([1, 2, 3] as const)
    .map((n, i) => ({
      n: String(i + 1).padStart(2, '0'),
      title: vsl[`booked_expect${n}_title`],
      body: vsl[`booked_expect${n}_body`],
    }))
    .filter((x) => x.title.trim());

  const proofStats = ([1, 2, 3, 4] as const)
    .map((n) => ({ value: vsl[`booked_stat${n}_value`], label: vsl[`booked_stat${n}_label`] }))
    .filter((x) => x.value.trim());

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: BOOKED_STYLES }} />
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        color: '#F5F5F5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
      }}>

        {/* ── Section 1: Confirmation header ──────────────────────────────────── */}
        <section style={{ padding: '56px 20px 48px', textAlign: 'center', animation: 'fadeUp 0.5s ease-out both' }}>
          {/* Check icon */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(76,175,80,0.12)',
            border: '1.5px solid rgba(76,175,80,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: 'checkPop 0.5s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both',
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 14L11 19L22 8" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <p style={{ fontSize: '12px', color: '#4CAF50', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
            You&rsquo;re in
          </p>

          <h1 style={{
            fontSize: 'clamp(26px, 5vw, 44px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            color: '#F5F5F5',
            marginBottom: '12px',
          }}>
            {name ? vsl.booked_headline.replace('{name}', name) : vsl.booked_headline_fallback}
          </h1>

          <p style={{ fontSize: '16px', color: '#AAAAAA', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}>
            {vsl.booked_subtext}
          </p>
        </section>

        {/* ── Section 2: Calendly embed ────────────────────────────────────────── */}
        <section style={{ padding: '0 20px 64px', maxWidth: '760px', margin: '0 auto', animation: 'fadeUp 0.5s 0.15s ease-out both' }}>
          {hasCalendly ? (
            <>
              <div
                className="calendly-inline-widget"
                data-url={`${calendlyUrl}?hide_gdpr_banner=1&background_color=0a0a0a&text_color=f5f5f5&primary_color=d4a853`}
                style={{ minWidth: '320px', height: '700px', borderRadius: '16px', overflow: 'hidden' }}
              />
              <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '13px', color: '#555' }}>
                Calendar not loading?{' '}
                <a href={calendlyUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#D4A853', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  Open it in a new tab
                </a>
              </p>
            </>
          ) : (
            <div style={{
              background: '#141414',
              border: '1px solid #1F1F1F',
              borderRadius: '16px',
              minHeight: configLoaded ? '320px' : '700px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              padding: '40px 24px',
              textAlign: 'center',
            }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <rect x="6" y="10" width="28" height="26" rx="4" stroke="#333" strokeWidth="1.8" />
                <path d="M6 18H34" stroke="#333" strokeWidth="1.8" />
                <path d="M14 6V12M26 6V12" stroke="#333" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              {configLoaded ? (
                <div>
                  <p style={{ color: '#AAAAAA', fontSize: '15px', marginBottom: '4px' }}>No calendar connected yet</p>
                  <p style={{ color: '#555', fontSize: '13px' }}>Add your Calendly URL in Admin → VSL Landing Page → Lead form</p>
                </div>
              ) : (
                <p style={{ color: '#555', fontSize: '14px' }}>Loading your calendar…</p>
              )}
            </div>
          )}
        </section>

        {/* ── Section 3: What to expect ────────────────────────────────────────── */}
        <section style={{
          padding: '64px 20px',
          background: '#0D0D0D',
          borderTop: '1px solid #131313',
          borderBottom: '1px solid #131313',
        }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <p style={{ fontSize: '11px', color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px', textAlign: 'center' }}>
              {vsl.booked_expect_eyebrow}
            </p>
            <h2 style={{
              fontSize: 'clamp(22px, 4vw, 32px)',
              fontWeight: 800,
              color: '#F5F5F5',
              letterSpacing: '-0.02em',
              marginBottom: '40px',
              textAlign: 'center',
            }}>
              {vsl.booked_expect_headline}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {whatToExpect.map((item) => (
                <div
                  key={item.n}
                  style={{
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'flex-start',
                  }}
                >
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#D4A853',
                    letterSpacing: '0.05em',
                    paddingTop: '3px',
                    flexShrink: 0,
                    width: '24px',
                  }}>
                    {item.n}
                  </span>
                  <div>
                    <p style={{ color: '#F5F5F5', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{item.title}</p>
                    <p style={{ color: '#777', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 4: Proof stats ───────────────────────────────────────────── */}
        <section style={{ padding: '64px 20px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <p style={{ color: '#AAAAAA', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>
              While you wait — here's what our system produces for med spas:
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '48px',
            }}>
              {proofStats.map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: '#141414',
                    border: '1px solid #1F1F1F',
                    borderRadius: '12px',
                    padding: '20px 16px',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ color: '#D4A853', fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>{s.value}</p>
                  <p style={{ color: '#666', fontSize: '12px', margin: 0, lineHeight: 1.4 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Testimonial placeholders */}
            <p style={{ color: '#555', fontSize: '13px', textAlign: 'center', marginBottom: '20px' }}>
              From clients just like yours:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <TestimonialPlaceholder label="DM screenshot" />
              <TestimonialPlaceholder label="DM screenshot" />
            </div>
            {/* TODO: Add additional testimonial images/case study metrics here */}
          </div>
        </section>

      </div>
    </>
  );
}
