'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);
  const fillWidth = `${(current / total) * 100}%`;

  return (
    <div className={cn('w-full px-4 pt-4 pb-2')}>
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-sm font-medium"
          style={{ color: '#737373', fontFamily: 'var(--font-body)' }}
        >
          Question {current} of {total}
        </span>
        <span
          className="text-xs tabular-nums"
          style={{ color: '#525252', fontFamily: 'var(--font-mono, monospace)' }}
        >
          {percentage}%
        </span>
      </div>

      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: '4px', backgroundColor: '#1e1e1e' }}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Question ${current} of ${total}`}
      >
        <div
          className="h-full rounded-full progress-fill"
          style={{
            width: fillWidth,
            background: 'var(--accent-color, #3b82f6)',
            transition: 'width 0.4s ease-out',
            willChange: 'width',
          }}
        />
      </div>
    </div>
  );
}
