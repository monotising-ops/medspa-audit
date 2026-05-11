'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import type { GateConfig } from '@/types';

interface GateFormValues {
  name: string;
  email: string;
  spaName: string;
}

interface GateModalProps {
  resultsComponent: React.ReactNode;
  onUnlock: (name: string, email: string, spaName: string) => Promise<void>;
  prefillSpaName?: string;
  config: GateConfig;
  isRevealing: boolean;
  isRevealed: boolean;
}

export default function GateModal({
  resultsComponent,
  onUnlock,
  prefillSpaName,
  config,
  isRevealing,
  isRevealed,
}: GateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GateFormValues>({
    defaultValues: {
      name: '',
      email: '',
      spaName: prefillSpaName ?? '',
    },
  });

  async function onSubmit(data: GateFormValues) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onUnlock(data.name.trim(), data.email.trim(), data.spaName.trim());
    } finally {
      setIsSubmitting(false);
    }
  }

  const showGate = !isRevealed;

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Results layer (blurred until revealed) */}
      <div
        className={cn(
          isRevealed ? 'results-revealed' : 'results-blurred',
        )}
      >
        {resultsComponent}
      </div>

      {/* Dark overlay — fades out on reveal */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 1 }}
        animate={{ opacity: isRevealed ? 0 : 0.7 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          pointerEvents: 'none',
          zIndex: 40,
        }}
      />

      {/* Gate card — centered, above overlay */}
      <AnimatePresence>
        {showGate && (
          <motion.div
            key="gate-card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={
              isRevealing
                ? { opacity: 0, scale: 0.88, y: -16 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={{ opacity: 0, scale: 0.88, y: -16 }}
            transition={{ duration: 0.38, ease: 'easeOut' as const }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              pointerEvents: isRevealing ? 'none' : 'auto',
            }}
          >
            <div
              className="glass-card rounded-2xl w-full max-w-md flex flex-col gap-5 p-7"
              style={{
                boxShadow:
                  '0 -20px 60px rgba(59,130,246,0.15), 0 8px 40px rgba(0,0,0,0.6)',
              }}
            >
              {/* Headline */}
              <div className="flex flex-col gap-2 text-center">
                <h2
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                    color: '#f5f5f5',
                  }}
                >
                  {config.headline}
                </h2>
                <p
                  className="text-sm"
                  style={{
                    color: '#737373',
                    fontFamily: 'var(--font-body, "Outfit", sans-serif)',
                  }}
                >
                  {config.subtext}
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-3"
              >
                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="gate-name"
                    className="text-xs font-medium"
                    style={{ color: '#737373', fontFamily: 'var(--font-body)' }}
                  >
                    Your Name
                  </label>
                  <input
                    id="gate-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Smith"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                      background: '#0a0a0a',
                      border: `1px solid ${errors.name ? '#ef4444' : '#1e1e1e'}`,
                      color: '#f5f5f5',
                      fontFamily: 'var(--font-body, "Outfit", sans-serif)',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={(e) => {
                      if (!errors.name) e.currentTarget.style.borderColor = 'var(--accent-color, #3b82f6)';
                    }}
                    onBlur={(e) => {
                      if (!errors.name) e.currentTarget.style.borderColor = '#1e1e1e';
                    }}
                  />
                  {errors.name && (
                    <span className="text-xs" style={{ color: '#ef4444' }}>
                      {errors.name.message}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="gate-email"
                    className="text-xs font-medium"
                    style={{ color: '#737373', fontFamily: 'var(--font-body)' }}
                  >
                    Email Address
                  </label>
                  <input
                    id="gate-email"
                    type="email"
                    autoComplete="email"
                    placeholder="jane@medspa.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Enter a valid email address',
                      },
                    })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                      background: '#0a0a0a',
                      border: `1px solid ${errors.email ? '#ef4444' : '#1e1e1e'}`,
                      color: '#f5f5f5',
                      fontFamily: 'var(--font-body, "Outfit", sans-serif)',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={(e) => {
                      if (!errors.email) e.currentTarget.style.borderColor = 'var(--accent-color, #3b82f6)';
                    }}
                    onBlur={(e) => {
                      if (!errors.email) e.currentTarget.style.borderColor = '#1e1e1e';
                    }}
                  />
                  {errors.email && (
                    <span className="text-xs" style={{ color: '#ef4444' }}>
                      {errors.email.message}
                    </span>
                  )}
                </div>

                {/* Med Spa Name */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="gate-spa-name"
                    className="text-xs font-medium"
                    style={{ color: '#737373', fontFamily: 'var(--font-body)' }}
                  >
                    Med Spa Name
                  </label>
                  <input
                    id="gate-spa-name"
                    type="text"
                    autoComplete="organization"
                    placeholder="Glow Studio"
                    {...register('spaName', { required: 'Med spa name is required' })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                      background: '#0a0a0a',
                      border: `1px solid ${errors.spaName ? '#ef4444' : '#1e1e1e'}`,
                      color: '#f5f5f5',
                      fontFamily: 'var(--font-body, "Outfit", sans-serif)',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={(e) => {
                      if (!errors.spaName) e.currentTarget.style.borderColor = 'var(--accent-color, #3b82f6)';
                    }}
                    onBlur={(e) => {
                      if (!errors.spaName) e.currentTarget.style.borderColor = '#1e1e1e';
                    }}
                  />
                  {errors.spaName && (
                    <span className="text-xs" style={{ color: '#ef4444' }}>
                      {errors.spaName.message}
                    </span>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl font-semibold text-base flex items-center justify-center gap-2 mt-1"
                  style={{
                    background: isSubmitting
                      ? 'rgba(59,130,246,0.6)'
                      : 'var(--accent-color, #3b82f6)',
                    color: '#fff',
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                    transition: 'background 0.15s, opacity 0.15s',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner />
                      Unlocking…
                    </>
                  ) : (
                    config.cta_text
                  )}
                </button>

                {/* Privacy */}
                {config.privacy_text && (
                  <p
                    className="text-xs text-center mt-0.5"
                    style={{
                      color: '#525252',
                      fontFamily: 'var(--font-body, "Outfit", sans-serif)',
                    }}
                  >
                    {config.privacy_text}
                  </p>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ animation: 'spin 0.75s linear infinite' }}
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="2"
      />
      <path
        d="M8 2a6 6 0 0 1 6 6"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}
