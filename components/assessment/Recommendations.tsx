'use client';

import { motion } from 'framer-motion';
import type { DomainScores } from '@/types';
import MetaAdsFlowDiagram from '@/components/assessment/MetaAdsFlowDiagram';
import AttributionFunnelDiagram from '@/components/assessment/AttributionFunnelDiagram';
import BookingReminderDiagram from '@/components/assessment/BookingReminderDiagram';
import SpeedToLeadDiagram from '@/components/assessment/SpeedToLeadDiagram';

interface Recommendation {
  domain: keyof DomainScores;
  domainLabel: string;
  headline: string;
  body: string;
  priority: number;
}

interface RecommendationsProps {
  recommendations: Recommendation[];
}

const PRIORITY_COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#22c55e'];
const PRIORITY_LABELS = ['Critical Fix', 'High Priority', 'Important', 'Worth Doing', 'Optimize'];

const BORDER_CLASSES = [
  'border-l-[#ef4444]',
  'border-l-[#f97316]',
  'border-l-[#eab308]',
  'border-l-[#3b82f6]',
  'border-l-[#22c55e]',
];

export default function Recommendations({ recommendations }: RecommendationsProps) {
  if (!recommendations.length) return null;

  return (
    <div className="flex flex-col gap-6 w-full">
      {recommendations.map((rec, index) => {
        const color = PRIORITY_COLORS[index] ?? '#3b82f6';
        const borderClass = BORDER_CLASSES[index] ?? 'border-l-[#3b82f6]';
        const priorityLabel = PRIORITY_LABELS[index] ?? 'Action Item';

        return (
          <motion.article
            key={`${rec.domain}-${rec.priority}`}
            className={`relative rounded-xl border border-[#1e1e1e] bg-[#111111] p-6 border-l-4 ${borderClass} overflow-hidden`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
          >
            {/* Header: domain name + priority pill */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-display text-lg font-semibold text-[#f5f5f5] leading-tight">
                {rec.domainLabel}
              </h3>
              <span
                className="shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-mono font-semibold tabular-nums"
                style={{
                  backgroundColor: `${color}20`,
                  color,
                  border: `1px solid ${color}40`,
                }}
              >
                #{rec.priority}
              </span>
            </div>

            {/* Priority status dot + label */}
            <div className="flex items-center gap-2 mb-4">
              <span
                className="inline-block w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}80` }}
                aria-hidden="true"
              />
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color }}
              >
                {priorityLabel}
              </span>
            </div>

            {/* Recommendation text */}
            <p className="text-sm text-[#a3a3a3] mb-5" style={{ lineHeight: 1.7 }}>
              {rec.headline}
            </p>

            {/* Diagrams */}
            {rec.domain === 'lead_gen' && (
              <div style={{ maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                <MetaAdsFlowDiagram />
              </div>
            )}
            {rec.domain === 'speed_to_lead' && (
              <div style={{ maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                <SpeedToLeadDiagram />
              </div>
            )}
            {rec.domain === 'attribution' && (
              <div style={{ maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                <AttributionFunnelDiagram />
              </div>
            )}
            {rec.domain === 'booking' && (
              <div style={{ maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                <BookingReminderDiagram />
              </div>
            )}
          </motion.article>
        );
      })}
    </div>
  );
}
