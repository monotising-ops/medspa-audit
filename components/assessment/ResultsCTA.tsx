'use client';

import { motion } from 'framer-motion';
import type { ResultsCTAConfig } from '@/types';

interface ResultsCTAProps {
  config: ResultsCTAConfig;
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
        fill="#3b82f6"
      />
    </svg>
  );
}

export default function ResultsCTA({ config }: ResultsCTAProps) {
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
  } = config;

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
          background: 'linear-gradient(90deg, #3b82f6, rgba(59,130,246,0.4) 60%, transparent)',
        }}
      />

      <div className="px-4 pt-10 pb-12 md:px-8 flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">
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
              className="w-full md:w-auto inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
              style={{
                backgroundColor: '#3b82f6',
                boxShadow: '0 0 24px rgba(59,130,246,0.35), 0 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              {primary_cta_text}
              <svg
                className="ml-2 -mr-1"
                width="16" height="16" viewBox="0 0 16 16" fill="none"
                aria-hidden="true"
              >
                <path d="M3 8H13M9 4L13 8L9 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          ) : (
            <button
              className="w-full md:w-auto inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
              style={{
                backgroundColor: '#3b82f6',
                boxShadow: '0 0 24px rgba(59,130,246,0.35), 0 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              {primary_cta_text}
              <svg
                className="ml-2 -mr-1"
                width="16" height="16" viewBox="0 0 16 16" fill="none"
                aria-hidden="true"
              >
                <path d="M3 8H13M9 4L13 8L9 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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

        {/* Embedded video */}
        {show_video && video_url && (
          <div className="w-full mt-2">
            <div
              className="relative w-full overflow-hidden rounded-xl border border-[#1e1e1e] bg-[#0a0a0a]"
              style={{ paddingBottom: '56.25%' /* 16:9 */ }}
            >
              <iframe
                src={video_url}
                title="Video"
                className="absolute inset-0 w-full h-full rounded-xl"
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
            style={{ borderLeftColor: '#3b82f6', borderLeftWidth: '3px' }}
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
