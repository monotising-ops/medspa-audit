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
  phone: string;
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
      const spaName = config.show_spa_name_field !== false ? data.spaName.trim() : '';
      await onUnlock(data.name.trim(), data.email.trim(), spaName);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505' }}>
      {/* Gate form — shown at top, exits when revealed */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.div
            key="gate-form"
            initial={{ opacity: 0, y: 20 }}
            animate={
              isRevealing
                ? { opacity: 0, y: -16, scale: 0.96 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ duration: 0.38, ease: 'easeOut' as const }}
            style={{ pointerEvents: isRevealing ? 'none' : 'auto' }}
          >
            <div style={{ maxWidth: '480px', margin: '0 auto', padding: '48px 16px' }}>
              <div
                className="glass-card"
                style={{
                  borderRadius: '20px',
                  padding: '40px',
                  boxShadow: '0 -20px 60px rgba(212,168,71,0.12), 0 8px 40px rgba(0,0,0,0.6)',
                }}
              >
                {/* Headline */}
                <div className="flex flex-col gap-2 text-center" style={{ marginBottom: '20px' }}>
                  <h2
                    className="text-2xl font-bold"
                    style={{
                      fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                      color: '#f5f5f5',
                    }}
                  >
                    <span style={{ color: '#D4A847', marginRight: '6px' }}>✦</span>
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
                        if (!errors.name) e.currentTarget.style.borderColor = '#D4A847';
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
                        if (!errors.email) e.currentTarget.style.borderColor = '#D4A847';
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

                  {/* Spa Name (optional) */}
                  {config.show_spa_name_field !== false && (
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="gate-spa-name"
                        className="text-xs font-medium"
                        style={{ color: '#737373', fontFamily: 'var(--font-body)' }}
                      >
                        {config.spa_name_field_label ?? 'Med Spa Name'}
                      </label>
                      <input
                        id="gate-spa-name"
                        type="text"
                        autoComplete="organization"
                        placeholder="Glow Studio"
                        {...register('spaName', { required: `${config.spa_name_field_label ?? 'Med Spa Name'} is required` })}
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                        style={{
                          background: '#0a0a0a',
                          border: `1px solid ${errors.spaName ? '#ef4444' : '#1e1e1e'}`,
                          color: '#f5f5f5',
                          fontFamily: 'var(--font-body, "Outfit", sans-serif)',
                          transition: 'border-color 0.15s',
                        }}
                        onFocus={(e) => {
                          if (!errors.spaName) e.currentTarget.style.borderColor = '#D4A847';
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
                  )}

                  {/* Phone (optional) */}
                  {config.show_phone_field && (
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="gate-phone"
                        className="text-xs font-medium"
                        style={{ color: '#737373', fontFamily: 'var(--font-body)' }}
                      >
                        {config.phone_field_label ?? 'Phone Number'}
                      </label>
                      <input
                        id="gate-phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+1 (555) 000-0000"
                        {...register('phone')}
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                        style={{
                          background: '#0a0a0a',
                          border: '1px solid #1e1e1e',
                          color: '#f5f5f5',
                          fontFamily: 'var(--font-body, "Outfit", sans-serif)',
                          transition: 'border-color 0.15s',
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#D4A847'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#1e1e1e'; }}
                      />
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl font-semibold text-base flex items-center justify-center gap-2 mt-1"
                    style={{
                      background: isSubmitting ? 'rgba(212,168,71,0.6)' : '#D4A847',
                      color: '#000000',
                      border: 'none',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                      transition: 'background 0.15s, opacity 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) e.currentTarget.style.background = '#E8C96A';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) e.currentTarget.style.background = '#D4A847';
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

                  {/* Anti-spam */}
                  <p
                    className="text-xs text-center"
                    style={{
                      color: '#737373',
                      fontFamily: 'var(--font-body, "Outfit", sans-serif)',
                      fontStyle: 'italic',
                      marginTop: '8px',
                    }}
                  >
                    We promise we don&apos;t spam you with BS &apos;marketing agency&apos; offers.
                  </p>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results below — blurred until revealed */}
      <div className={cn(isRevealed ? 'results-revealed' : 'results-blurred')}>
        {resultsComponent}
      </div>
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
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="2"
      />
      <path
        d="M8 2a6 6 0 0 1 6 6"
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}
