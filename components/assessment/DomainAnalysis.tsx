'use client';

import { motion } from 'framer-motion';
import type { DomainScores } from '@/types';
import { domainScoreColor, domainBorderClass } from '@/lib/utils';

interface DomainAnalysisProps {
  domain: keyof DomainScores;
  domainScore: number;
  maxScore: number;
  pct: number;
  analysisText: string;
  bestPracticeText: string;
  tipText: string;
  imageUrl: string | null;
  domainLabel: string;
}

function statusFromPct(pct: number): { label: string; color: string } {
  if (pct <= 0.25) return { label: 'Needs Attention', color: '#ef4444' };
  if (pct <= 0.5)  return { label: 'Improving', color: '#f97316' };
  if (pct <= 0.75) return { label: 'Good', color: '#eab308' };
  return { label: 'Strong', color: '#22c55e' };
}

export default function DomainAnalysis({
  domain,
  domainScore,
  maxScore,
  pct,
  analysisText,
  bestPracticeText,
  tipText,
  imageUrl,
  domainLabel,
}: DomainAnalysisProps) {
  const borderColorClass = domainBorderClass(pct);
  const scoreColor = domainScoreColor(pct);
  const { label: statusLabel, color: statusColor } = statusFromPct(pct);

  return (
    <motion.article
      className={`relative rounded-xl border border-[#1e1e1e] bg-[#111111] p-6 border-l-4 ${borderColorClass} overflow-hidden`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="font-display text-lg font-semibold text-[#f5f5f5] leading-tight">
          {domainLabel}
        </h3>
        {/* Score pill */}
        <span
          className="shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-mono font-semibold tabular-nums"
          style={{
            backgroundColor: `${scoreColor}20`,
            color: scoreColor,
            border: `1px solid ${scoreColor}40`,
          }}
        >
          {domainScore}/{maxScore}
        </span>
      </div>

      {/* Status dot + text */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="inline-block w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: statusColor, boxShadow: `0 0 5px ${statusColor}80` }}
          aria-hidden="true"
        />
        <span
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: statusColor }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Analysis text */}
      <p
        className="text-sm text-[#a3a3a3] mb-5"
        style={{ lineHeight: 1.7 }}
      >
        {analysisText}
      </p>

      {/* Best-in-Class section */}
      {bestPracticeText && (
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#525252] mb-1.5">
            Best-in-Class
          </p>
          <p
            className="text-sm italic text-[#737373]"
            style={{ lineHeight: 1.7 }}
          >
            {bestPracticeText}
          </p>
        </div>
      )}

      {/* Image — below Best-in-Class, above Action This Week */}
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={`${domainLabel} illustration`}
          style={{
            display: 'block',
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '10px',
            marginBottom: '20px',
          }}
        />
      )}

      {/* Action This Week callout box */}
      {tipText && (
        <div
          className="rounded-lg border border-[#1e1e1e] bg-[#0d0d0d] px-4 py-3.5"
          style={{ borderLeftColor: '#3b82f6', borderLeftWidth: '3px' }}
        >
          <p className="text-sm font-bold text-[#f5f5f5] mb-1">
            Action This Week →
          </p>
          <p
            className="text-sm text-[#a3a3a3]"
            style={{ lineHeight: 1.6 }}
          >
            {tipText}
          </p>
        </div>
      )}
    </motion.article>
  );
}
