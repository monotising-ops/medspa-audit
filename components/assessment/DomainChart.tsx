'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { DomainScores } from '@/types';
import { formatDomain, domainScoreColor } from '@/lib/utils';

interface DomainChartProps {
  domainScores: DomainScores;
  domainMaxScores: DomainScores;
  chartType: 'radar' | 'bar';
  domainPercentages: DomainScores;
}

type DomainKey = keyof DomainScores;
const DOMAIN_KEYS: DomainKey[] = [
  'lead_gen',
  'speed_to_lead',
  'booking',
  'attribution',
  'growth',
];

// ─── Bar Chart (custom CSS/div implementation) ────────────────────────────────

interface BarRowProps {
  domainKey: DomainKey;
  score: number;
  max: number;
  pct: number;
  index: number;
}

function BarRow({ domainKey, score, max, pct, index }: BarRowProps) {
  const fillColor = domainScoreColor(pct);
  const pctDisplay = Math.round(pct * 100);

  return (
    <motion.div
      className="flex items-center gap-3 w-full"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
    >
      {/* Domain name */}
      <div className="w-36 md:w-44 shrink-0 text-right">
        <span className="text-xs md:text-sm text-[#737373] font-medium leading-tight">
          {formatDomain(domainKey)}
        </span>
      </div>

      {/* Bar track */}
      <div className="flex-1 relative h-2 rounded-full bg-[#1e1e1e] overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ backgroundColor: fillColor }}
          initial={{ width: '0%' }}
          animate={{ width: `${pctDisplay}%` }}
          transition={{ duration: 0.7, delay: index * 0.08 + 0.2, ease: 'easeOut' }}
        />
      </div>

      {/* Score label */}
      <div className="w-12 shrink-0">
        <span
          className="text-xs font-mono tabular-nums font-semibold"
          style={{ color: fillColor }}
        >
          {score}/{max}
        </span>
      </div>
    </motion.div>
  );
}

function BarChart({ domainScores, domainMaxScores, domainPercentages }: Omit<DomainChartProps, 'chartType'>) {
  return (
    <div className="flex flex-col gap-4 w-full py-2">
      {DOMAIN_KEYS.map((key, i) => (
        <BarRow
          key={key}
          domainKey={key}
          score={domainScores[key]}
          max={domainMaxScores[key]}
          pct={domainPercentages[key]}
          index={i}
        />
      ))}
    </div>
  );
}

// ─── Radar Chart ─────────────────────────────────────────────────────────────

interface CustomRadarTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { fullMark: number; domain: string } }>;
}

function CustomRadarTooltip({ active, payload }: CustomRadarTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-[#111111] border border-[#1e1e1e] rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-[#f5f5f5] font-medium">{item.payload.domain}</p>
      <p className="text-[#737373] mt-0.5">
        Score: <span className="text-[#f5f5f5] font-mono">{item.value}</span>
        <span className="text-[#525252]">/{item.payload.fullMark}</span>
      </p>
    </div>
  );
}

function RadarChartComponent({ domainScores, domainMaxScores, domainPercentages }: Omit<DomainChartProps, 'chartType'>) {
  const data = useMemo(() =>
    DOMAIN_KEYS.map((key) => ({
      domain: formatDomain(key),
      score: domainScores[key],
      fullMark: domainMaxScores[key],
      pct: domainPercentages[key],
    })),
    [domainScores, domainMaxScores, domainPercentages]
  );

  // Average percentage to pick fill color
  const avgPct = useMemo(() => {
    const sum = DOMAIN_KEYS.reduce((acc, k) => acc + domainPercentages[k], 0);
    return sum / DOMAIN_KEYS.length;
  }, [domainPercentages]);

  const fillColor = domainScoreColor(avgPct);

  return (
    <motion.div
      className="w-full h-72 md:h-80"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid
            stroke="#1e1e1e"
            strokeWidth={1}
          />
          <PolarAngleAxis
            dataKey="domain"
            tick={{ fill: '#737373', fontSize: 11, fontFamily: 'Outfit, sans-serif' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 'dataMax']}
            tick={{ fill: '#525252', fontSize: 9 }}
            stroke="transparent"
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke={fillColor}
            strokeWidth={2}
            fill={fillColor}
            fillOpacity={0.18}
            dot={{ fill: fillColor, r: 4, strokeWidth: 0 }}
            activeDot={{ fill: fillColor, r: 5, strokeWidth: 2, stroke: '#050505' }}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />
          <Tooltip content={<CustomRadarTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

// ─── Weakest Domain Callout ───────────────────────────────────────────────────

function WeakestCallout({ domainPercentages, domainScores, domainMaxScores }: Omit<DomainChartProps, 'chartType'>) {
  const weakest = useMemo(() => {
    return DOMAIN_KEYS.reduce((min, key) =>
      domainPercentages[key] < domainPercentages[min] ? key : min,
      DOMAIN_KEYS[0]
    );
  }, [domainPercentages]);

  const pct = domainPercentages[weakest];
  const color = domainScoreColor(pct);

  return (
    <div
      className="mt-5 flex items-start gap-3 rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-4 py-3"
      style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
    >
      <svg
        className="mt-0.5 shrink-0"
        width="14" height="14" viewBox="0 0 14 14" fill="none"
        aria-hidden="true"
      >
        <circle cx="7" cy="7" r="7" fill={color} fillOpacity="0.2" />
        <circle cx="7" cy="7" r="3" fill={color} />
      </svg>
      <div>
        <p className="text-xs font-semibold text-[#f5f5f5]">
          Weakest area: {formatDomain(weakest)}
        </p>
        <p className="text-xs text-[#737373] mt-0.5">
          Scored <span className="font-mono text-[#f5f5f5]">{domainScores[weakest]}/{domainMaxScores[weakest]}</span>{' '}
          ({Math.round(pct * 100)}%) — your highest-leverage growth opportunity.
        </p>
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function DomainChart({
  domainScores,
  domainMaxScores,
  chartType,
  domainPercentages,
}: DomainChartProps) {
  return (
    <div className="w-full">
      {chartType === 'bar' ? (
        <BarChart
          domainScores={domainScores}
          domainMaxScores={domainMaxScores}
          domainPercentages={domainPercentages}
        />
      ) : (
        <RadarChartComponent
          domainScores={domainScores}
          domainMaxScores={domainMaxScores}
          domainPercentages={domainPercentages}
        />
      )}
      <WeakestCallout
        domainScores={domainScores}
        domainMaxScores={domainMaxScores}
        domainPercentages={domainPercentages}
      />
    </div>
  );
}
