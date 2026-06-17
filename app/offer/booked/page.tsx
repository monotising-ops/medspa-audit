'use client';

// TODO: Add Calendly embed URL — replace CALENDLY_PLACEHOLDER_URL with actual link
// TODO: Add Meta Pixel — fire CompleteRegistration event on mount
// TODO: Replace placeholder testimonial containers with real screenshot images
// TODO: Verify form data was submitted (redirect to /offer if sessionStorage is empty)

import { useEffect, useState } from 'react';

const CALENDLY_PLACEHOLDER_URL = 'https://calendly.com/your-link-here'; // TODO: replace with real URL

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

const WHAT_TO_EXPECT = [
  {
    n: '01',
    title: 'We look at your current setup',
    body: "We'll review what's working and where patients are dropping off — together, in real time.",
  },
  {
    n: '02',
    title: 'I show you the exact system',
    body: 'You\'ll see our full booking framework with real client numbers and live campaign examples.',
  },
  {
    n: '03',
    title: 'We figure out if there\'s a fit',
    body: 'No pressure, no pitch deck. If there\'s an opportunity, we\'ll both know it by the end of the call.',
  },
];

const PROOF_STATS = [
  { value: '4.43×', label: 'Avg ROAS for active clients' },
  { value: '71', label: 'Bookings in a single month' },
  { value: '$17.7k', label: 'Revenue from $4k adspend' },
  { value: '92%', label: 'Lead-to-booking conversion' },
];

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

  useEffect(() => {
    const n = sessionStorage.getItem('offer_lead_name');
    if (n) setName(n);
  }, []);

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
            {name ? `${name}, one last step.` : 'One last step.'}
          </h1>

          <p style={{ fontSize: '16px', color: '#AAAAAA', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}>
            Pick a time below for your free 20-minute strategy call. We'll look at your current setup and show you exactly how our system works.
          </p>
        </section>

        {/* ── Section 2: Calendly embed ────────────────────────────────────────── */}
        <section style={{ padding: '0 20px 64px', maxWidth: '760px', margin: '0 auto', animation: 'fadeUp 0.5s 0.15s ease-out both' }}>
          {/* TODO: Replace this placeholder with actual Calendly embed script:
              <div class="calendly-inline-widget" data-url="CALENDLY_PLACEHOLDER_URL"
                   style="min-width:320px;height:700px;" />
              <script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async />
          */}
          <div style={{
            background: '#141414',
            border: '1px solid #1F1F1F',
            borderRadius: '16px',
            minHeight: '520px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '40px 24px',
            textAlign: 'center',
          }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <rect x="6" y="10" width="28" height="26" rx="4" stroke="#333" strokeWidth="1.8" />
              <path d="M6 18H34" stroke="#333" strokeWidth="1.8" />
              <path d="M14 6V12M26 6V12" stroke="#333" strokeWidth="1.8" strokeLinecap="round" />
              <rect x="12" y="22" width="5" height="5" rx="1" fill="#D4A853" opacity="0.5" />
              <rect x="21" y="22" width="5" height="5" rx="1" fill="#D4A853" opacity="0.3" />
            </svg>
            <div>
              <p style={{ color: '#AAAAAA', fontSize: '15px', marginBottom: '4px' }}>Calendly calendar will appear here</p>
              <p style={{ color: '#555', fontSize: '13px' }}>Paste your Calendly URL in the TODO above</p>
            </div>
            <a
              href={CALENDLY_PLACEHOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 28px',
                borderRadius: '10px',
                background: '#D4A853',
                color: '#000',
                fontSize: '15px',
                fontWeight: 700,
                textDecoration: 'none',
                marginTop: '8px',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              Book a Call →
            </a>
          </div>
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
              On the Call
            </p>
            <h2 style={{
              fontSize: 'clamp(22px, 4vw, 32px)',
              fontWeight: 800,
              color: '#F5F5F5',
              letterSpacing: '-0.02em',
              marginBottom: '40px',
              textAlign: 'center',
            }}>
              What to expect in 20 minutes
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {WHAT_TO_EXPECT.map((item) => (
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
              {PROOF_STATS.map((s) => (
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
