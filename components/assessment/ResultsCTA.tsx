'use client';

import { motion } from 'framer-motion';
import type { ResultsCTAConfig } from '@/types';

interface ResultsCTAProps {
  config: ResultsCTAConfig;
  spaName?: string;
}

function QuoteIcon() {
  return (
    <svg
      width="32"
      height="24"
      viewBox="0 0 32 24"
      fill="none"
      aria-hidden="true"
      className="mb-3 opacity-40"
    >
      <path
        d="M0 24V14.4C0 6.4 4.8 1.6 14.4 0L16 3.2C11.2 4.8 8.8 7.2 8 11.2H14.4V24H0ZM17.6 24V14.4C17.6 6.4 22.4 1.6 32 0L33.6 3.2C28.8 4.8 26.4 7.2 25.6 11.2H32V24H17.6Z"
        fill="#D4A847"
      />
    </svg>
  );
}

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!match) return null;
  return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
}

function getLoomEmbedUrl(url: string): string | null {
  const match = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  return `https://www.loom.com/embed/${match[1]}`;
}

function getEmbedUrl(url: string): string {
  return getYouTubeEmbedUrl(url) ?? getLoomEmbedUrl(url) ?? url;
}

function LockedSection({ title, lockText, subtitle }: { title: string; lockText: string; subtitle: string }) {
  // Fake blurred rows — looks like a system/table
  const fakeRows = [
    ['Campaign Type', 'Audience', 'Budget', 'ROAS'],
    ['Botox Awareness', 'Women 28–45 Local', '$1,200/mo', '4.2×'],
    ['Filler Retargeting', 'Website Visitors 30d', '$600/mo', '6.8×'],
    ['Body Contouring', 'Lookalike Top 5%', '$800/mo', '3.9×'],
    ['Loyalty Reactivation', 'Past Patients 90d', '$400/mo', '9.1×'],
  ];

  return (
    <div style={{ marginBottom: '40px' }}>
      {/* Title */}
      <h3
        style={{
          fontSize: 'clamp(18px, 4vw, 24px)',
          fontWeight: 800,
          color: '#f5f5f5',
          lineHeight: 1.25,
          marginBottom: '20px',
          fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
          letterSpacing: '-0.02em',
          textAlign: 'center',
        }}
      >
        {title}
      </h3>

      {/* Locked blurred card */}
      <div
        style={{
          position: 'relative',
          borderRadius: '16px',
          border: '1px solid #222',
          overflow: 'hidden',
          marginBottom: '16px',
        }}
      >
        {/* Blurred fake content */}
        <div style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none', background: '#0d0d0d', padding: '0' }}>
          {fakeRows.map((row, ri) => (
            <div
              key={ri}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 2fr 1fr 1fr',
                gap: '12px',
                padding: '12px 16px',
                borderBottom: ri < fakeRows.length - 1 ? '1px solid #1a1a1a' : 'none',
                background: ri === 0 ? '#111' : ri % 2 === 0 ? '#0d0d0d' : '#0a0a0a',
              }}
            >
              {row.map((cell, ci) => (
                <span
                  key={ci}
                  style={{
                    fontSize: ri === 0 ? '10px' : '13px',
                    fontWeight: ri === 0 ? 700 : 400,
                    color: ri === 0 ? '#525252' : ci === 3 ? '#D4A847' : '#737373',
                    letterSpacing: ri === 0 ? '0.1em' : 0,
                    textTransform: ri === 0 ? 'uppercase' : 'none',
                    fontFamily: ri === 3 ? 'monospace' : 'inherit',
                  }}
                >
                  {cell}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Lock overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(5,5,5,0.55)',
            backdropFilter: 'blur(1px)',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '32px', lineHeight: 1 }}>🔒</span>
          <span
            style={{
              color: '#f5f5f5',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
            }}
          >
            {lockText}
          </span>
        </div>
      </div>

      {/* Subtitle below lock */}
      <p
        style={{
          color: '#737373',
          fontSize: '14px',
          textAlign: 'center',
          lineHeight: 1.6,
          fontFamily: 'var(--font-body, "Outfit", sans-serif)',
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

export default function ResultsCTA({ config, spaName }: ResultsCTAProps) {
  const {
    headline,
    body,
    primary_cta_text,
    primary_cta_url,
    secondary_cta_text,
    video_url,
    case_study_text,
    show_video,
    show_case_study,
    show_locked_section,
    locked_section_title,
    locked_section_lock_text,
    locked_section_subtitle,
  } = config;

  const resolvedTitle = (locked_section_title ?? '').replace('{spa_name}', spaName ?? 'Your Med Spa');

  return (
    <motion.section
      className="relative w-full overflow-hidden"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      {/* Top accent border gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: 'linear-gradient(90deg, #D4A847, rgba(212,168,71,0.4) 60%, transparent)',
        }}
      />

      <div className="px-4 pt-10 pb-12 md:px-8 flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">
        {/* Locked section */}
        {show_locked_section !== false && (
          <div className="w-full">
            <LockedSection
              title={resolvedTitle}
              lockText={locked_section_lock_text ?? 'Unlock in a free discovery call'}
              subtitle={locked_section_subtitle ?? 'Get on a 30 min call with us to reveal the exact system below'}
            />
          </div>
        )}

        {/* Headline */}
        <h2 className="font-display text-3xl md:text-4xl font-bold text-[#f5f5f5] leading-tight">
          {headline}
        </h2>

        {/* Body text */}
        {body && (
          <p className="text-[#737373] text-base md:text-lg leading-relaxed max-w-lg">
            {body}
          </p>
        )}

        {/* Primary CTA */}
        {primary_cta_text && (
          primary_cta_url ? (
            <a
              href={primary_cta_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold text-black transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
              style={{
                backgroundColor: '#D4A847',
                boxShadow: '0 0 24px rgba(212,168,71,0.35), 0 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              {primary_cta_text}
              <svg
                className="ml-2 -mr-1"
                width="16" height="16" viewBox="0 0 16 16" fill="none"
                aria-hidden="true"
              >
                <path d="M3 8H13M9 4L13 8L9 12" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          ) : (
            <button
              className="w-full md:w-auto inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold text-black transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
              style={{
                backgroundColor: '#D4A847',
                boxShadow: '0 0 24px rgba(212,168,71,0.35), 0 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              {primary_cta_text}
              <svg
                className="ml-2 -mr-1"
                width="16" height="16" viewBox="0 0 16 16" fill="none"
                aria-hidden="true"
              >
                <path d="M3 8H13M9 4L13 8L9 12" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )
        )}

        {/* Secondary CTA text */}
        {secondary_cta_text && (
          <p className="text-sm text-[#525252] text-center">
            {secondary_cta_text}
          </p>
        )}

        {/* Embedded video — prominent, full-width 16:9 */}
        {show_video && video_url && (
          <div className="w-full mt-2">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-left" style={{ color: '#D4A847' }}>
              Watch: Full Revenue Breakdown
            </p>
            <div
              className="relative w-full overflow-hidden rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a]"
              style={{ paddingBottom: '56.25%' /* 16:9 */ }}
            >
              <iframe
                src={getEmbedUrl(video_url)}
                title="Video"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Case study quote card */}
        {show_case_study && case_study_text && (
          <div
            className="w-full text-left rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] px-6 py-5 mt-2"
            style={{ borderLeftColor: '#D4A847', borderLeftWidth: '3px' }}
          >
            <QuoteIcon />
            <p
              className="text-sm md:text-base italic text-[#a3a3a3]"
              style={{ lineHeight: 1.7 }}
            >
              {case_study_text}
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
}
