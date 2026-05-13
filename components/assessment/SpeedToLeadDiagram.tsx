'use client';

const STATS = [
  { label: 'TOTAL LEADS', value: '106', sub: '24 Hours',      color: '#D4A847' },
  { label: 'NEW / UNCALLED', value: '1',  sub: 'Waiting',     color: '#f97316' },
  { label: 'BOOKED',       value: '95',  sub: '24 Hours',     color: '#22c55e' },
  { label: 'CONVERSION',   value: '92%', sub: 'Close Rate',   color: '#22c55e' },
];

const BW = 84, BH = 62, GAP = 10, STEP = BW + GAP;
const VW = STATS.length * STEP - GAP;
const VH = BH + 28; // room for header label

export default function SpeedToLeadDiagram() {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        style={{ display: 'block' }}
        aria-label="Lead Dialler Dashboard Stats"
      >
        {/* Header bar */}
        <rect x={0} y={0} width={VW} height={20} rx="5"
          fill="rgba(212,168,71,0.06)" stroke="rgba(212,168,71,0.2)" strokeWidth="1" />
        <text x={8} y={13.5} fill="#D4A847" fontSize="7.5" fontWeight="700"
          letterSpacing="1.2" fontFamily="Space Grotesk, sans-serif">
          MONOTISING · LEAD DIALLER
        </text>
        <text x={VW - 8} y={13.5} textAnchor="end" fill="#525252" fontSize="7"
          fontFamily="Space Grotesk, sans-serif">
          24 Hours
        </text>

        {/* KPI cards */}
        {STATS.map((s, i) => {
          const x = i * STEP;
          const y = 26;
          const cx = x + BW / 2;
          return (
            <g key={s.label}>
              <rect x={x} y={y} width={BW} height={BH} rx="6"
                fill={`${s.color}10`} stroke={`${s.color}35`} strokeWidth="1.2" />

              {/* Metric label */}
              <text x={cx} y={y + 14} textAnchor="middle" fill="#525252"
                fontSize="6.5" letterSpacing="0.8"
                fontFamily="Space Grotesk, sans-serif">
                {s.label}
              </text>

              {/* Big value */}
              <text x={cx} y={y + 38} textAnchor="middle" fill={s.color}
                fontSize="20" fontWeight="800"
                fontFamily="Space Grotesk, sans-serif">
                {s.value}
              </text>

              {/* Sub label */}
              <text x={cx} y={y + 53} textAnchor="middle" fill="#404040"
                fontSize="7" fontFamily="Space Grotesk, sans-serif">
                {s.sub}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
