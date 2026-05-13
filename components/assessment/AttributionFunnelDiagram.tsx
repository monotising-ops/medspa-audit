'use client';

const STAGES = [
  { metric: 'REACH',    value: '52K',    color: '#6366f1' },
  { metric: 'CLICKS',   value: '1,847',  color: '#8b5cf6' },
  { metric: 'LEADS',    value: '124',    color: '#a855f7' },
  { metric: 'BOOKINGS', value: '71',     color: '#D4A847' },
  { metric: 'REVENUE',  value: '$9,352', color: '#22c55e' },
];

const BW = 76, BH = 50, GAP = 16, STEP = BW + GAP;
const VW = STAGES.length * STEP - GAP;
const VH = BH + 8;
const CY = VH / 2;

export default function AttributionFunnelDiagram() {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        style={{ display: 'block' }}
        aria-label="Meta Ads Attribution Funnel"
      >
        {STAGES.map((s, i) => {
          const x = i * STEP;
          const cx = x + BW / 2;
          const y = (VH - BH) / 2;
          return (
            <g key={s.metric}>
              {/* Arrow between boxes */}
              {i > 0 && (
                <text
                  x={x - GAP / 2}
                  y={CY + 4}
                  textAnchor="middle"
                  fill="#404040"
                  fontSize="11"
                  fontFamily="sans-serif"
                >
                  →
                </text>
              )}

              {/* Box */}
              <rect
                x={x} y={y} width={BW} height={BH} rx="6"
                fill={`${s.color}18`} stroke={s.color} strokeWidth="1.2"
              />

              {/* Metric label */}
              <text
                x={cx} y={y + 15}
                textAnchor="middle"
                fill="#606060"
                fontSize="7"
                letterSpacing="1.2"
                fontFamily="Space Grotesk, sans-serif"
              >
                {s.metric}
              </text>

              {/* Value */}
              <text
                x={cx} y={y + 36}
                textAnchor="middle"
                fill={s.color}
                fontSize="15"
                fontWeight="700"
                fontFamily="Space Grotesk, sans-serif"
              >
                {s.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
