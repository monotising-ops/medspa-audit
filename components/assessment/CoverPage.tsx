'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { CoverConfig } from '@/types';

interface CoverPageProps {
  config: CoverConfig;
  onStart: () => void;
}

// Split headline to wrap the last word(s) in gradient text
function HeadlineWithGradient({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  // Wrap last 2 words (or 1 if short) in gradient
  const splitAt = words.length > 3 ? words.length - 2 : words.length - 1;
  const plain = words.slice(0, splitAt).join(' ');
  const gradient = words.slice(splitAt).join(' ');
  return (
    <>
      {plain && <span>{plain} </span>}
      <span
        style={{
          background: 'linear-gradient(135deg, #D4A847 0%, #E8C96A 50%, #B8922E 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {gradient}
      </span>
    </>
  );
}

const BLOB_CONFIG = [
  {
    width: 480,
    height: 480,
    color: 'rgba(212,168,71,0.10)',
    top: '-15%',
    left: '30%',
    duration: 18,
    xRange: 30,
    yRange: 20,
  },
  {
    width: 360,
    height: 360,
    color: 'rgba(184,146,46,0.07)',
    top: '55%',
    left: '-10%',
    duration: 22,
    xRange: 25,
    yRange: 30,
  },
  {
    width: 300,
    height: 300,
    color: 'rgba(212,168,71,0.08)',
    top: '60%',
    left: '70%',
    duration: 26,
    xRange: 20,
    yRange: 25,
  },
  {
    width: 200,
    height: 200,
    color: 'rgba(184,146,46,0.07)',
    top: '20%',
    left: '80%',
    duration: 14,
    xRange: 15,
    yRange: 20,
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

export default function CoverPage({ config, onStart }: CoverPageProps) {
  const hasBackground = Boolean(config.background_image_url);

  return (
    <div
      className={cn('gradient-mesh relative min-h-screen w-full overflow-hidden')}
      style={
        hasBackground
          ? {
              backgroundImage: `linear-gradient(rgba(5,5,5,0.72) 0%, rgba(5,5,5,0.85) 100%), url(${config.background_image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* Floating blob backgrounds */}
      {BLOB_CONFIG.map((blob, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          initial={{ x: 0, y: 0 }}
          animate={{
            x: [0, blob.xRange, -blob.xRange / 2, blob.xRange / 3, 0],
            y: [0, -blob.yRange, blob.yRange / 2, -blob.yRange / 3, 0],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            top: blob.top,
            left: blob.left,
            width: blob.width,
            height: blob.height,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${blob.color}, transparent 70%)`,
            willChange: 'transform',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ))}

      {/* Content */}
      <div
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center gap-6 max-w-2xl w-full"
        >
          {/* Logo / Company name */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-2"
            style={{ marginBottom: '8px' }}
          >
            {config.logo_url ? (
              <img
                src={config.logo_url}
                alt="Company logo"
                style={{
                  maxHeight: '48px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            ) : null}
            <span
              style={{
                fontSize: '14px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#D4A847',
                fontWeight: 500,
                fontFamily: 'var(--font-body, "Outfit", sans-serif)',
              }}
            >
              Monotising
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold leading-tight tracking-tight"
            style={{
              fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
              color: '#f5f5f5',
            }}
          >
            <HeadlineWithGradient text={config.headline} />
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={itemVariants}
            className="text-lg leading-relaxed max-w-lg"
            style={{
              color: '#737373',
              fontFamily: 'var(--font-body, "Outfit", sans-serif)',
            }}
          >
            {config.subtext}
          </motion.p>

          {/* CTA Button */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
            <button
              onClick={onStart}
              className="group relative overflow-hidden rounded-xl font-semibold text-lg transition-all duration-200"
              style={{
                background: '#D4A847',
                color: '#000000',
                border: 'none',
                cursor: 'pointer',
                minWidth: '280px',
                padding: '14px 32px',
                fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                boxShadow: '0 0 0 0 rgba(212,168,71,0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E8C96A';
                e.currentTarget.style.boxShadow = '0 0 0 8px rgba(212,168,71,0.15), 0 0 32px rgba(212,168,71,0.25)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#D4A847';
                e.currentTarget.style.boxShadow = '0 0 0 0 rgba(212,168,71,0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span className="relative z-10">{config.cta_text}</span>
              {/* Shimmer overlay on hover */}
              <span
                aria-hidden="true"
                className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                }}
              />
            </button>

            {/* Trust line */}
            {config.trust_line && (
              <p
                className="text-sm"
                style={{
                  color: '#525252',
                  fontFamily: 'var(--font-body, "Outfit", sans-serif)',
                }}
              >
                {config.trust_line}
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
