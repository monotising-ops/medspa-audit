'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Grade } from '@/types';

interface SystemComparisonProps {
  currentImageUrl: string | null;
  optimizedImageUrl: string | null;
  grade: Grade;
}

// ─── Text-based funnel diagram steps ─────────────────────────────────────────

interface Step {
  label: string;
  broken?: boolean;
  gap?: boolean; // renders a visual gap / broken link
}

const BROKEN_STEPS: Step[] = [
  { label: 'Ad' },
  { label: 'Click' },
  { label: 'Lead' },
  { label: '???' },
  { label: '', gap: true },    // broken chain marker
  { label: 'Maybe a call', broken: true },
  { label: 'No tracking', broken: true },
];

const OPTIMIZED_STEPS: Step[] = [
  { label: 'Ad' },
  { label: 'Click' },
  { label: 'Lead' },
  { label: '5-Min Response' },
  { label: 'Qualification' },
  { label: 'Booking' },
  { label: '3× Reminders' },
  { label: 'Show' },
  { label: 'Revenue Tracked' },
];

// Broken chain icon
function BrokenChainIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="mx-auto">
      <path d="M7 13L13 7" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 7L13 13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="10" cy="10" r="8" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 6L5 8.5L9.5 4" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 3L9 9M9 3L3 9" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function BrokenDiagram() {
  return (
    <div className="flex flex-col items-center gap-0 py-2">
      {BROKEN_STEPS.map((step, i) => {
        if (step.gap) {
          return (
            <div key={i} className="flex flex-col items-center gap-0.5 py-1">
              <div className="w-px h-3 bg-[#333]" />
              <BrokenChainIcon />
              <div className="w-px h-3 bg-[#333]" />
            </div>
          );
        }
        const isBroken = step.broken;
        const isLast = i === BROKEN_STEPS.length - 1;

        return (
          <div key={i} className="flex flex-col items-center">
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 w-44"
              style={{
                backgroundColor: isBroken ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isBroken ? 'rgba(239,68,68,0.3)' : '#1e1e1e'}`,
              }}
            >
              <span className="shrink-0">
                {isBroken ? <XIcon /> : (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <circle cx="6" cy="6" r="5" stroke="#525252" strokeWidth="1.5"/>
                  </svg>
                )}
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: isBroken ? '#ef4444' : '#737373' }}
              >
                {step.label}
              </span>
            </div>
            {!isLast && !step.gap && (
              <div
                className="w-px h-4"
                style={{ background: isBroken ? 'rgba(239,68,68,0.3)' : '#333' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OptimizedDiagram() {
  return (
    <div className="flex flex-col items-center gap-0 py-2">
      {OPTIMIZED_STEPS.map((step, i) => {
        const isLast = i === OPTIMIZED_STEPS.length - 1;
        return (
          <div key={i} className="flex flex-col items-center">
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 w-44"
              style={{
                backgroundColor: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.25)',
              }}
            >
              <span className="shrink-0">
                <CheckIcon />
              </span>
              <span className="text-xs font-medium" style={{ color: '#22c55e' }}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className="w-px h-4" style={{ background: 'rgba(34,197,94,0.3)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Panel component ──────────────────────────────────────────────────────────

interface PanelProps {
  title: string;
  badge: string;
  badgeColor: string;
  borderColor: string;
  imageUrl: string | null;
  imageAlt: string;
  diagram: React.ReactNode;
  delay?: number;
}

function Panel({
  title,
  badge,
  badgeColor,
  borderColor,
  imageUrl,
  imageAlt,
  diagram,
  delay = 0,
}: PanelProps) {
  return (
    <motion.div
      className="flex-1 min-w-0 rounded-xl border bg-[#111111] overflow-hidden"
      style={{ borderColor }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor, backgroundColor: `${borderColor}10` }}
      >
        <h3 className="text-sm font-display font-semibold text-[#f5f5f5]">
          {title}
        </h3>
        <span
          className="text-xs font-semibold rounded-full px-2.5 py-0.5"
          style={{
            backgroundColor: `${badgeColor}20`,
            color: badgeColor,
            border: `1px solid ${badgeColor}40`,
          }}
        >
          {badge}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col items-center">
        {imageUrl ? (
          <div className="relative w-full rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={600}
              height={400}
              className="w-full object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ) : (
          diagram
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function SystemComparison({
  currentImageUrl,
  optimizedImageUrl,
}: SystemComparisonProps) {
  return (
    <motion.section
      className="w-full"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <Panel
          title="Your Current System"
          badge="Your System"
          badgeColor="#ef4444"
          borderColor="rgba(239,68,68,0.3)"
          imageUrl={currentImageUrl}
          imageAlt="Your current lead management system"
          diagram={<BrokenDiagram />}
          delay={0}
        />
        <Panel
          title="A Revenue-Optimized System"
          badge="Optimized System"
          badgeColor="#22c55e"
          borderColor="rgba(34,197,94,0.3)"
          imageUrl={optimizedImageUrl}
          imageAlt="Revenue-optimized system"
          diagram={<OptimizedDiagram />}
          delay={0.1}
        />
      </div>
    </motion.section>
  );
}
