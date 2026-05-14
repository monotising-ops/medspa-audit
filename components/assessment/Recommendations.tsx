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

function PriorityBadge({ priority }: { priority: number }) {
  return (
    <div
      className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full font-mono font-bold text-lg"
      style={{
        backgroundColor: 'rgba(59,130,246,0.15)',
        border: '2px solid rgba(59,130,246,0.4)',
        color: '#3b82f6',
        boxShadow: '0 0 12px rgba(59,130,246,0.2)',
      }}
      aria-label={`Priority ${priority}`}
    >
      {priority}
    </div>
  );
}

function DomainPill({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#1e1e1e] text-[#737373] border border-[#2a2a2a]">
      {label}
    </span>
  );
}

export default function Recommendations({ recommendations }: RecommendationsProps) {
  if (!recommendations.length) return null;

  return (
    <div className="flex flex-col gap-4 w-full">
      {recommendations.map((rec, index) => (
        <motion.div
          key={`${rec.domain}-${rec.priority}`}
          className="rounded-xl border border-[#1e1e1e] bg-[#111111] p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{
            duration: 0.45,
            delay: index * 0.1,
            ease: 'easeOut',
          }}
        >
          <div className="flex items-start gap-4">
            {/* Priority circle */}
            <PriorityBadge priority={rec.priority} />

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Domain pill */}
              <div className="mb-2">
                <DomainPill label={rec.domainLabel} />
              </div>

              {/* Headline */}
              <h3
                className="font-display font-bold text-[#f5f5f5] text-base md:text-lg leading-snug mb-2"
              >
                {rec.headline}
              </h3>

              {/* Lead gen — campaign structure diagram */}
              {rec.domain === 'lead_gen' && (
                <div style={{ marginTop: '16px', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
                  <MetaAdsFlowDiagram />
                </div>
              )}

              {/* Speed to lead — Lead Dialler KPI dashboard */}
              {rec.domain === 'speed_to_lead' && (
                <div style={{ marginTop: '16px', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
                  <SpeedToLeadDiagram />
                </div>
              )}

              {/* Attribution — Meta Ads funnel metrics */}
              {rec.domain === 'attribution' && (
                <div style={{ marginTop: '16px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                  <AttributionFunnelDiagram />
                </div>
              )}

              {/* Booking — SMS reminder sequence */}
              {rec.domain === 'booking' && (
                <div style={{ marginTop: '16px', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
                  <BookingReminderDiagram />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
