'use client';

import { motion } from 'framer-motion';
import type { CreativeComparisonConfig } from '@/types';

function XIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2 2L8 8M8 2L2 8" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2 5.5L4 7.5L8 3" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ImagePlaceholder() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#2a2a2a' }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="28" height="28" rx="5" stroke="#2a2a2a" strokeWidth="1.5" strokeDasharray="4 3" />
        <circle cx="13" cy="15" r="2.5" fill="#2a2a2a" />
        <path d="M5 26l8-7 5 5 4-3.5 9 7.5" stroke="#2a2a2a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: '11px', color: '#333' }}>Upload via admin</span>
    </div>
  );
}

interface PanelProps {
  label: string;
  imageUrl: string;
  variant: 'bad' | 'good';
  imageHeight: number;
}

function Panel({ label, imageUrl, variant, imageHeight }: PanelProps) {
  const color = variant === 'bad' ? '#ef4444' : '#22c55e';
  return (
    <div
      style={{
        borderRadius: '12px',
        border: `1px solid ${color}38`,
        background: `${color}06`,
        overflow: 'hidden',
        flex: 1,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          borderBottom: `1px solid ${color}20`,
          background: `${color}08`,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: `${color}18`,
            border: `1px solid ${color}40`,
            flexShrink: 0,
          }}
        >
          {variant === 'bad' ? <XIcon /> : <CheckIcon />}
        </span>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color,
            fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
          }}
        >
          {label}
        </span>
      </div>

      {/* Image area */}
      <div
        style={{
          height: `${imageHeight}px`,
          background: '#080808',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={label}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
    </div>
  );
}

interface RowProps {
  leftLabel: string;
  leftImageUrl: string;
  rightLabel: string;
  rightImageUrl: string;
  imageHeight: number;
}

function ComparisonRow({ leftLabel, leftImageUrl, rightLabel, rightImageUrl, imageHeight }: RowProps) {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <Panel label={leftLabel} imageUrl={leftImageUrl} variant="bad" imageHeight={imageHeight} />
      <Panel label={rightLabel} imageUrl={rightImageUrl} variant="good" imageHeight={imageHeight} />
    </div>
  );
}

export default function CreativeComparison({ config }: { config: CreativeComparisonConfig }) {
  return (
    <motion.div
      style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Column header labels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(239,68,68,0.25)' }} />
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ef4444', whiteSpace: 'nowrap', fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)' }}>
            What Not To Do
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(239,68,68,0.25)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(34,197,94,0.25)' }} />
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#22c55e', whiteSpace: 'nowrap', fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)' }}>
            What Works
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(34,197,94,0.25)' }} />
        </div>
      </div>

      {/* Row 1 — Ad creatives (tall) */}
      <ComparisonRow
        leftLabel={config.row1_left_label}
        leftImageUrl={config.row1_left_image_url}
        rightLabel={config.row1_right_label}
        rightImageUrl={config.row1_right_image_url}
        imageHeight={220}
      />

      {/* Row 2 — Campaign structure (shorter) */}
      {config.show_row2 && (
        <ComparisonRow
          leftLabel={config.row2_left_label}
          leftImageUrl={config.row2_left_image_url}
          rightLabel={config.row2_right_label}
          rightImageUrl={config.row2_right_image_url}
          imageHeight={150}
        />
      )}
    </motion.div>
  );
}
