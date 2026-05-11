'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { ScoreResult } from '@/types';
import { formatDomain } from '@/lib/utils';

interface ScoreHeroProps {
  scoreResult: ScoreResult;
  spaName: string;
}

function useCountUp(target: number, duration: number, enabled: boolean) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    startTimeRef.current = null;

    const tick = (now: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = now;
      }
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration, enabled]);

  return value;
}

export default function ScoreHero({ scoreResult, spaName }: ScoreHeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayScore = useCountUp(scoreResult.total_score, 1500, mounted);

  const { grade_color, total_score, max_score, grade_label, weakest_domain } = scoreResult;

  // Radial gradient background with grade color at 10% opacity at top center
  const gradientStyle = {
    background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${grade_color}1a, transparent 70%), #050505`,
  } as React.CSSProperties;

  const glowStyle = {
    color: grade_color,
    textShadow: `0 0 40px ${grade_color}80, 0 0 80px ${grade_color}40`,
  } as React.CSSProperties;

  return (
    <motion.section
      className="relative w-full overflow-hidden py-16 md:py-24 px-4"
      style={gradientStyle}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {/* Subtle top border */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${grade_color}40, transparent)` }}
      />

      <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-4">
        {/* Spa name */}
        <p className="text-sm font-mono uppercase tracking-widest text-[#525252]">
          {spaName}
        </p>

        {/* Giant score number with count-up */}
        <div className="relative flex flex-col items-center">
          <span
            className="score-number text-8xl md:text-9xl font-bold leading-none tabular-nums select-none"
            style={glowStyle}
            aria-live="polite"
            aria-label={`Score: ${total_score} out of ${max_score}`}
          >
            {displayScore}
          </span>

          {/* X / max below the big number */}
          <span className="score-number text-lg md:text-xl text-[#525252] mt-2 tabular-nums">
            {total_score}<span className="text-[#333]">/</span>{max_score}
          </span>
        </div>

        {/* Grade label */}
        <div className="flex items-center gap-2 mt-2">
          <span
            className="text-xl font-display font-semibold tracking-wide"
            style={{ color: grade_color }}
          >
            {grade_label}
          </span>
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: grade_color, boxShadow: `0 0 6px ${grade_color}` }}
          />
        </div>

        {/* Weakest domain summary */}
        <p className="text-sm md:text-base text-[#737373] mt-1 max-w-md leading-relaxed">
          Your biggest opportunity is in{' '}
          <span className="text-[#f5f5f5] font-medium">
            {formatDomain(weakest_domain)}
          </span>
          .
        </p>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #050505)' }}
      />
    </motion.section>
  );
}
