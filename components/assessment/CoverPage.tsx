'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { CoverConfig, Question, AnswerRecord } from '@/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CoverPageProps {
  config: CoverConfig;
  intakeQuestions: Question[];
  onStart: (prefilled: Map<string, AnswerRecord>, skipCount: number) => void;
}

// ─── Headline with gold gradient on last 2 words ──────────────────────────────

function HeadlineWithGradient({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
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

// ─── Decorative Report Cards ──────────────────────────────────────────────────

function ReportCards() {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'relative', width: '100%', maxWidth: '360px', height: '240px', margin: '0 auto' }}
    >
      {/* Left card */}
      <div style={{
        position: 'absolute', left: '2%', top: '24px',
        width: '38%',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
        border: '1px solid #252525', borderRadius: '12px',
        padding: '14px', transform: 'rotate(-7deg)',
        boxShadow: '0 6px 24px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      }}>
        <div style={{ color: '#454545', fontSize: '7px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>Speed-to-Lead</div>
        <div style={{ color: '#606060', fontSize: '10px', fontWeight: 700, lineHeight: 1.3, marginBottom: '10px' }}>Response<br />Time Report</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
          {[{ w: 70 }, { w: 45 }, { w: 80 }].map((d, i) => (
            <div key={i} style={{ height: '3px', background: '#1e1e1e', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${d.w}%`, height: '100%', background: '#333', borderRadius: '2px' }} />
            </div>
          ))}
        </div>
        <div style={{ color: '#454545', fontSize: '8px' }}>Audit Score</div>
        <div style={{ color: '#606060', fontSize: '17px', fontWeight: 800, lineHeight: 1 }}>58<span style={{ fontSize: '9px', fontWeight: 400 }}>/100</span></div>
      </div>

      {/* Center card (gold accent) */}
      <div style={{
        position: 'absolute', left: '50%', top: '0',
        transform: 'translateX(-50%)',
        width: '43%',
        background: 'linear-gradient(145deg, #1c1a0e 0%, #130f08 100%)',
        border: '1px solid rgba(212,168,71,0.6)', borderRadius: '14px',
        padding: '16px', zIndex: 3,
        boxShadow: '0 0 40px rgba(212,168,71,0.18), 0 12px 40px rgba(0,0,0,0.8)',
      }}>
        <div style={{ color: '#D4A847', fontSize: '7px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '5px' }}>MONOTISING</div>
        <div style={{ color: '#f0f0f0', fontSize: '11px', fontWeight: 700, lineHeight: 1.3, marginBottom: '10px' }}>Med Spa<br />Growth Audit</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
          {[
            { label: 'Lead Gen', pct: 72, color: '#D4A847' },
            { label: 'Speed', pct: 38, color: '#ef4444' },
            { label: 'Booking', pct: 65, color: '#D4A847' },
            { label: 'Revenue', pct: 29, color: '#f97316' },
          ].map((d) => (
            <div key={d.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ color: '#737373', fontSize: '7px' }}>{d.label}</span>
                <span style={{ color: '#737373', fontSize: '7px' }}>{d.pct}%</span>
              </div>
              <div style={{ height: '3px', background: '#1e1e1e', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${d.pct}%`, height: '100%', background: d.color, borderRadius: '2px' }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '8px' }}>
          <div style={{ color: '#525252', fontSize: '7px', marginBottom: '2px' }}>Overall Score</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            <span style={{ color: '#D4A847', fontSize: '22px', fontWeight: 800, lineHeight: 1 }}>73</span>
            <span style={{ color: '#525252', fontSize: '9px' }}>/100</span>
          </div>
          <div style={{ color: '#D4A847', fontSize: '7px', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>Functional</div>
        </div>
      </div>

      {/* Right card */}
      <div style={{
        position: 'absolute', right: '2%', top: '24px',
        width: '38%',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
        border: '1px solid #252525', borderRadius: '12px',
        padding: '14px', transform: 'rotate(7deg)',
        boxShadow: '0 6px 24px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      }}>
        <div style={{ color: '#454545', fontSize: '7px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>Revenue</div>
        <div style={{ color: '#606060', fontSize: '10px', fontWeight: 700, lineHeight: 1.3, marginBottom: '10px' }}>Attribution<br />Analysis</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
          {[{ w: 55 }, { w: 80 }, { w: 35 }].map((d, i) => (
            <div key={i} style={{ height: '3px', background: '#1e1e1e', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${d.w}%`, height: '100%', background: '#333', borderRadius: '2px' }} />
            </div>
          ))}
        </div>
        <div style={{ color: '#454545', fontSize: '8px' }}>Audit Score</div>
        <div style={{ color: '#606060', fontSize: '17px', fontWeight: 800, lineHeight: 1 }}>61<span style={{ fontSize: '9px', fontWeight: 400 }}>/100</span></div>
      </div>
    </div>
  );
}

// ─── Scrolling Ticker ─────────────────────────────────────────────────────────

function Ticker({ text }: { text: string }) {
  const repeated = `${text}  ·  ${text}  ·  ${text}  ·  `;
  return (
    <div
      style={{
        overflow: 'hidden',
        borderTop: '1px solid #1a1a1a',
        padding: '10px 0',
        background: '#0a0a0a',
        whiteSpace: 'nowrap',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          animation: 'ticker-scroll 28s linear infinite',
          color: '#454545',
          fontSize: '11px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {repeated}{repeated}
      </div>
      <style>{`@keyframes ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

// ─── Trust Bullet ─────────────────────────────────────────────────────────────

function TrustBullets({ bullets }: { bullets: string[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 4px' }}>
      {bullets.filter(Boolean).map((b, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <span style={{ color: '#D4A847', fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>✓</span>
          <span style={{ color: '#737373', fontSize: '13px', lineHeight: 1.4 }}>{b}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Mini Questionnaire ───────────────────────────────────────────────────────

interface MiniQuestionnaireProps {
  questions: Question[];
  ctaText: string;
  onSubmit: (selections: Map<string, string | string[]>) => void;
}

function MiniQuestionnaire({ questions, ctaText, onSubmit }: MiniQuestionnaireProps) {
  const [selections, setSelections] = useState<Map<string, string | string[]>>(new Map());

  function select(qId: string, value: string, isMulti: boolean) {
    setSelections((prev) => {
      const next = new Map(prev);
      if (isMulti) {
        const cur = (next.get(qId) as string[] | undefined) ?? [];
        const already = cur.includes(value);
        next.set(qId, already ? cur.filter((v) => v !== value) : [...cur, value]);
      } else {
        next.set(qId, value);
      }
      return next;
    });
  }

  const canProceed = questions.every((q) => {
    const val = selections.get(q.id);
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    return val.trim().length > 0;
  });

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #111 0%, #0d0d0d 100%)',
        border: '1px solid #222',
        borderRadius: '20px',
        padding: '28px 24px',
        boxShadow: '0 -8px 40px rgba(212,168,71,0.06), 0 8px 40px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {questions.map((q) => {
          const val = selections.get(q.id);
          return (
            <div key={q.id}>
              <p style={{
                color: '#d0d0d0',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '10px',
                lineHeight: 1.4,
                fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
              }}>
                {q.question_text}
              </p>

              {q.input_type === 'text' && (
                <input
                  type="text"
                  placeholder="e.g. Glow Studio"
                  value={(val as string | undefined) ?? ''}
                  onChange={(e) =>
                    setSelections((prev) => new Map(prev).set(q.id, e.target.value))
                  }
                  style={{
                    width: '100%',
                    background: '#0a0a0a',
                    border: `1px solid ${val ? '#D4A847' : '#252525'}`,
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#f5f5f5',
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: 'var(--font-body, "Outfit", sans-serif)',
                    transition: 'border-color 0.15s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#D4A847'; }}
                  onBlur={(e) => {
                    if (!val) e.currentTarget.style.borderColor = '#252525';
                  }}
                />
              )}

              {q.input_type === 'single_select' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {q.options.map((opt) => {
                    const selected = val === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => select(q.id, opt.id, false)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: `1px solid ${selected ? '#D4A847' : '#252525'}`,
                          background: selected ? 'rgba(212,168,71,0.12)' : '#0a0a0a',
                          color: selected ? '#D4A847' : '#737373',
                          cursor: 'pointer',
                          transition: 'all 0.12s',
                          fontFamily: 'var(--font-body, "Outfit", sans-serif)',
                        }}
                        onMouseEnter={(e) => {
                          if (!selected) {
                            e.currentTarget.style.borderColor = '#4a4a4a';
                            e.currentTarget.style.color = '#a0a0a0';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selected) {
                            e.currentTarget.style.borderColor = '#252525';
                            e.currentTarget.style.color = '#737373';
                          }
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {q.input_type === 'multi_select' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {q.options.map((opt) => {
                    const curArr = (val as string[] | undefined) ?? [];
                    const selected = curArr.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => select(q.id, opt.id, true)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: `1px solid ${selected ? '#D4A847' : '#252525'}`,
                          background: selected ? 'rgba(212,168,71,0.12)' : '#0a0a0a',
                          color: selected ? '#D4A847' : '#737373',
                          cursor: 'pointer',
                          transition: 'all 0.12s',
                          fontFamily: 'var(--font-body, "Outfit", sans-serif)',
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <button
          type="button"
          disabled={!canProceed}
          onClick={() => onSubmit(selections)}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 700,
            border: 'none',
            background: canProceed ? '#D4A847' : 'rgba(212,168,71,0.25)',
            color: canProceed ? '#000' : '#7a6020',
            cursor: canProceed ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s',
            fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
          }}
          onMouseEnter={(e) => {
            if (canProceed) e.currentTarget.style.background = '#E8C96A';
          }}
          onMouseLeave={(e) => {
            if (canProceed) e.currentTarget.style.background = '#D4A847';
          }}
        >
          {ctaText}
        </button>
      </div>
    </div>
  );
}

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CoverPage({ config, intakeQuestions, onStart }: CoverPageProps) {
  function handleMiniSubmit(selections: Map<string, string | string[]>) {
    const answerMap = new Map<string, AnswerRecord>();

    intakeQuestions.forEach((q) => {
      const val = selections.get(q.id);
      if (val === undefined) return;

      if (q.input_type === 'text') {
        answerMap.set(q.id, {
          question_id: q.id,
          selected_option_index: -1,
          score: 0,
          question_text: q.question_text,
          selected_label: val as string,
        });
      } else if (q.input_type === 'single_select') {
        const idx = q.options.findIndex((o) => o.id === val);
        answerMap.set(q.id, {
          question_id: q.id,
          selected_option_index: idx,
          score: idx >= 0 ? (q.options[idx]?.score ?? 0) : 0,
          question_text: q.question_text,
          selected_label: idx >= 0 ? q.options[idx]?.label ?? '' : '',
        });
      } else if (q.input_type === 'multi_select') {
        const vals = (val as string[]) ?? [];
        const indices = vals
          .map((v) => q.options.findIndex((o) => o.id === v))
          .filter((i) => i >= 0);
        answerMap.set(q.id, {
          question_id: q.id,
          selected_option_index: indices,
          score: 0,
          question_text: q.question_text,
          selected_label: indices.map((i) => q.options[i]?.label ?? ''),
        });
      }
    });

    onStart(answerMap, intakeQuestions.length);
  }

  const bullets = (config.trust_bullets ?? '').split('\n').filter(Boolean);
  const showBanner = config.show_banner !== false && Boolean(config.banner_text);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', display: 'flex', flexDirection: 'column' }}>
      {/* ── Banner ─────────────────────────────────────────────────────────── */}
      {showBanner && (
        <div style={{
          background: 'rgba(212,168,71,0.07)',
          borderBottom: '1px solid rgba(212,168,71,0.14)',
          padding: '9px 16px',
          textAlign: 'center',
        }}>
          <span style={{
            color: '#D4A847',
            fontSize: '12px',
            letterSpacing: '0.06em',
            fontFamily: 'var(--font-body, "Outfit", sans-serif)',
          }}>
            ✦ {config.banner_text} ✦
          </span>
        </div>
      )}

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, maxWidth: '480px', margin: '0 auto', width: '100%', padding: '40px 20px 32px' }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
        >
          {/* Logo / brand */}
          <motion.div variants={itemVariants} style={{ textAlign: 'center' }}>
            {config.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.logo_url}
                alt="Logo"
                style={{ maxHeight: '44px', objectFit: 'contain', display: 'block', margin: '0 auto 8px' }}
              />
            )}
            <span style={{
              fontSize: '12px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#D4A847',
              fontWeight: 500,
              fontFamily: 'var(--font-body, "Outfit", sans-serif)',
            }}>
              Monotising
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div variants={itemVariants} style={{ textAlign: 'center' }}>
            <h1
              style={{
                fontSize: 'clamp(28px, 7vw, 42px)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: '#f5f5f5',
                margin: 0,
                fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
              }}
            >
              <HeadlineWithGradient text={config.headline} />
            </h1>
            {config.subtext && (
              <p style={{
                marginTop: '14px',
                color: '#737373',
                fontSize: '15px',
                lineHeight: 1.6,
                fontFamily: 'var(--font-body, "Outfit", sans-serif)',
              }}>
                {config.subtext}
              </p>
            )}
          </motion.div>

          {/* Product cards */}
          <motion.div variants={itemVariants}>
            <ReportCards />
          </motion.div>

          {/* Mini questionnaire or plain CTA */}
          <motion.div variants={itemVariants}>
            {intakeQuestions.length > 0 ? (
              <MiniQuestionnaire
                questions={intakeQuestions}
                ctaText={config.cta_text}
                onSubmit={handleMiniSubmit}
              />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => onStart(new Map(), 0)}
                  style={{
                    padding: '14px 40px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 700,
                    border: 'none',
                    background: '#D4A847',
                    color: '#000',
                    cursor: 'pointer',
                    minWidth: '260px',
                    fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#E8C96A'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#D4A847'; }}
                >
                  {config.cta_text}
                </button>
              </div>
            )}
          </motion.div>

          {/* Trust bullets */}
          {bullets.length > 0 && (
            <motion.div variants={itemVariants}>
              <TrustBullets bullets={bullets} />
            </motion.div>
          )}

          {/* Trust line (legacy) */}
          {config.trust_line && bullets.length === 0 && (
            <motion.div variants={itemVariants} style={{ textAlign: 'center' }}>
              <p style={{ color: '#525252', fontSize: '12px', fontFamily: 'var(--font-body, "Outfit", sans-serif)' }}>
                {config.trust_line}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Ticker ─────────────────────────────────────────────────────────── */}
      {config.ticker_text && <Ticker text={config.ticker_text} />}
    </div>
  );
}
