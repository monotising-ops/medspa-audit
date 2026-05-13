'use client';

const STAGES = [
  { label: 'BOOKING',   sub: 'Confirmed',      color: '#22c55e' },
  { label: 'INSTANT',   sub: 'SMS Sent',        color: '#3b82f6' },
  { label: '24H BEFORE', sub: 'Reminder',       color: '#3b82f6' },
  { label: '1H BEFORE',  sub: 'Final Reminder', color: '#3b82f6' },
];

const BW = 82, BH = 52, GAP = 14, STEP = BW + GAP;
const VW = STAGES.length * STEP - GAP;
const VH = BH + 8;
const CY = VH / 2;

export default function BookingReminderDiagram() {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        style={{ display: 'block' }}
        aria-label="Booking SMS Reminder Sequence"
      >
        {STAGES.map((s, i) => {
          const x = i * STEP;
          const cx = x + BW / 2;
          const y = (VH - BH) / 2;
          return (
            <g key={s.label}>
              {/* Arrow */}
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
                x={x} y={y} width={BW} height={BH} rx="8"
                fill={`${s.color}15`} stroke={s.color} strokeWidth="1.2"
              />

              {/* Top label */}
              <text
                x={cx} y={y + 16}
                textAnchor="middle"
                fill="#606060"
                fontSize="7"
                letterSpacing="1.2"
                fontFamily="Space Grotesk, sans-serif"
              >
                {s.label}
              </text>

              {/* Sub label */}
              <text
                x={cx} y={y + 35}
                textAnchor="middle"
                fill={s.color}
                fontSize="11"
                fontWeight="600"
                fontFamily="Space Grotesk, sans-serif"
              >
                {s.sub}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
