'use client';

// TODO: Connect Supabase — write form responses to 'offer_leads' table on submit
// TODO: Add Meta Pixel — map the events in lib/vsl-events.ts to Pixel + CAPI

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { track, trackOnce } from '@/lib/vsl-events';
import type { VSLConfig } from '@/types';

// ─── Palette ──────────────────────────────────────────────────────────────────

const GOLD = '#D4A853';
const GOLD_LT = '#E8C26A';
const INK = '#F5F5F5';
const MUTED = '#8A8A8A';
const CARD = '#0C0C0C';
const LINE = '#1C1A16';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  location: string;
  treatments: string[];
  spend: string;
  challenge: string;
  name: string;
  phone: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TREATMENT_OPTIONS = [
  'Botox / Anti-Wrinkle',
  'Dermal Filler',
  'Laser Treatments',
  'Microneedling',
  'Hydrafacials',
  'Body Contouring',
  'Other',
];

const SPEND_OPTIONS = [
  '$0 — not running ads',
  'Under $1,000',
  '$1,000 – $3,000',
  '$3,000 – $5,000',
  '$5,000+',
];

const CHALLENGE_OPTIONS = [
  'Not enough new patients',
  'Leads but no bookings',
  'High no-show rate',
  "Don't know if ads are working",
  'Need a better system',
];

// ─── Styles injected once ─────────────────────────────────────────────────────

const GLOBAL_STYLES = `
  @keyframes slideInRight { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes slideInLeft  { from { opacity: 0; transform: translateX(-28px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes fadeUp       { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulseRing    { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.06); opacity: .92; } }

  .offer-option-btn:hover {
    border-color: ${GOLD} !important;
    background: rgba(212,168,83,0.06) !important;
    color: ${INK} !important;
  }
  .offer-scroll::-webkit-scrollbar { display: none; }
  .offer-scroll { -ms-overflow-style: none; scrollbar-width: none; }

  .vsl-unmute { animation: pulseRing 2.4s ease-in-out infinite; }
  .vsl-unmute:active { transform: scale(0.97); }

  .vsl-ctrl {
    display: inline-flex; align-items: center; justify-content: center;
    width: 38px; height: 38px; border: none; border-radius: 9px;
    background: rgba(0,0,0,0.34); color: #fff; cursor: pointer;
    transition: background .15s ease;
  }
  .vsl-ctrl:hover { background: rgba(0,0,0,0.6); }
  .vsl-ctrl:active { transform: scale(0.94); }

  .vsl-play-btn { transition: transform .18s ease, background .18s ease; }
  .vsl-card:hover .vsl-play-btn { transform: scale(1.08); background: #fff; }

  /* Reveal-on-scroll, progressive enhancement: visible by default. */
  .reveal { animation: fadeUp .6s cubic-bezier(0.16,1,0.3,1) both; }
`;

// ─── Vertical 9:16 VSL — custom locked player ─────────────────────────────────
//
// Deliberately NOT the native player:
//   · no seek bar, and currentTime snaps back if anything jumps ahead
//   · the progress bar is cosmetic and non-linear (fast early, slow late)
//   · fullscreen expands the CONTAINER, never video.webkitEnterFullscreen,
//     because iOS native fullscreen would hand back Apple's scrub bar and
//     undo the lock
// Watch-depth tracking reads real currentTime, so the dashboard stays honest
// even though the bar is not.

const SEEK_TOLERANCE = 1.2; // seconds of drift allowed before we snap back

function Icon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={d} fill="currentColor" />
    </svg>
  );
}

const PATH_PLAY = 'M8 5.5l11 6.5-11 6.5v-13z';
const PATH_PAUSE = 'M7 5h3.2v14H7V5zm6.8 0H17v14h-3.2V5z';
const PATH_SOUND = 'M11 5L6 9H3v6h3l5 4V5zm3.6 3.2a1 1 0 0 1 1.4.2 5.8 5.8 0 0 1 0 7.2 1 1 0 0 1-1.6-1.2 3.8 3.8 0 0 0 0-4.8 1 1 0 0 1 .2-1.4z';
const PATH_MUTED = 'M11 5L6 9H3v6h3l5 4V5zm4.3 4.3l1.4 1.4 1.4-1.4 1.4 1.4-1.4 1.4 1.4 1.4-1.4 1.4-1.4-1.4-1.4 1.4-1.4-1.4 1.4-1.4-1.4-1.4 1.4-1.4z';
const PATH_EXPAND = 'M4 9V4h5v2H6v3H4zm11-5h5v5h-2V6h-3V4zM4 15h2v3h3v2H4v-5zm14 0h2v5h-5v-2h3v-3z';
const PATH_SHRINK = 'M9 4h2v5H6V7h3V4zm4 0h2v3h3v2h-5V4zM6 15h5v5H9v-3H6v-2zm7 0h5v2h-3v3h-2v-5z';

function VerticalVSL({ vsl }: { vsl: VSLConfig }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const maxWatched = useRef(0);
  const unmutedRef = useRef(false);

  const [unmuted, setUnmuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false); // CSS pseudo-fullscreen (iOS)
  const [nativeFs, setNativeFs] = useState(false); // real Fullscreen API

  const hasVideo = Boolean(vsl.video_url);
  const isFull = expanded || nativeFs;

  // Curve exponent: <1 makes the bar run ahead early then visibly slow down.
  const curve = (() => {
    const n = Number.parseFloat(vsl.video_progress_curve);
    return Number.isFinite(n) ? Math.min(Math.max(n, 0.1), 1) : 0.45;
  })();

  // ── Autoplay, hardened ────────────────────────────────────────────
  // Muted autoplay is the only kind mobile allows, and iOS Low Power Mode
  // blocks even that — the overlay is the fallback when this loses.
  const attemptPlay = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.paused) return;
    if (!unmutedRef.current) v.muted = true; // set imperatively, before play()
    v.play().then(() => setPlaying(true)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!hasVideo) return;
    const v = videoRef.current;
    if (!v) return;

    attemptPlay();

    const retry = () => attemptPlay();
    v.addEventListener('canplay', retry);
    v.addEventListener('loadeddata', retry);
    // First interaction anywhere on the page counts as the user gesture.
    document.addEventListener('touchstart', retry, { passive: true, once: true });
    document.addEventListener('pointerdown', retry, { once: true });

    return () => {
      v.removeEventListener('canplay', retry);
      v.removeEventListener('loadeddata', retry);
      document.removeEventListener('touchstart', retry);
      document.removeEventListener('pointerdown', retry);
    };
  }, [hasVideo, attemptPlay]);

  // ── Keep the real Fullscreen API state in sync ────────────────────
  useEffect(() => {
    const onChange = () => setNativeFs(document.fullscreenElement === wrapRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // ── Lock body scroll behind pseudo-fullscreen ─────────────────────
  useEffect(() => {
    if (!expanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [expanded]);

  // ── Seek lock + cosmetic progress + real milestones ───────────────
  const clampSeek = useCallback(() => {
    const v = videoRef.current;
    if (!v) return true;
    if (v.currentTime > maxWatched.current + SEEK_TOLERANCE) {
      v.currentTime = maxWatched.current;
      return false;
    }
    return true;
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    if (!clampSeek()) return;

    maxWatched.current = Math.max(maxWatched.current, v.currentTime);

    const linear = Math.min(v.currentTime / v.duration, 1);
    setProgress(Math.min(Math.pow(linear, curve), 1));

    // Milestones use REAL elapsed time, never the curved bar.
    if (unmutedRef.current) {
      if (linear >= 0.25) trackOnce('vsl_video_25');
      if (linear >= 0.5) trackOnce('vsl_video_50');
      if (linear >= 0.75) trackOnce('vsl_video_75');
    }
  }, [clampSeek, curve]);

  // ── Actions ───────────────────────────────────────────────────────
  function goFullscreen() {
    const el = wrapRef.current;
    if (!el) return;
    // Fullscreen the CONTAINER so our controls survive. iOS Safari does not
    // support this on a div, so it falls through to pseudo-fullscreen.
    if (typeof el.requestFullscreen === 'function') {
      el.requestFullscreen().catch(() => setExpanded(true));
    } else {
      setExpanded(true);
    }
  }

  function exitFullscreen() {
    if (document.fullscreenElement && typeof document.exitFullscreen === 'function') {
      void document.exitFullscreen().catch(() => {});
    }
    setExpanded(false);
  }

  function handleUnmute() {
    const v = videoRef.current;
    if (!v) return;

    track('vsl_unmute_click');
    unmutedRef.current = true;
    setUnmuted(true);

    // Restart with sound — the silent preroll does not count as watching.
    v.currentTime = 0;
    maxWatched.current = 0;
    v.muted = false;
    v.volume = 1;
    setMuted(false);
    v.play().then(() => setPlaying(true)).catch(() => {});

    goFullscreen();
  }

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      v.pause();
      setPlaying(false);
    }
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    setMuted(next);
    if (!next) unmutedRef.current = true;
  }

  const frame: React.CSSProperties = isFull
    ? {
        position: 'fixed', inset: 0, zIndex: 9999, width: '100%', height: '100%',
        maxWidth: 'none', margin: 0, borderRadius: 0, border: 'none',
        background: '#000', overflow: 'hidden',
      }
    : {
        position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto',
        aspectRatio: '9 / 16', borderRadius: '18px', overflow: 'hidden',
        background: '#111', border: `1px solid ${LINE}`,
        boxShadow: '0 24px 70px -20px rgba(0,0,0,0.9)',
      };

  if (!hasVideo) {
    return (
      <div style={frame}>
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '24px', textAlign: 'center' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="3" stroke="#3A3428" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M10 9l5 3-5 3V9z" fill="#3A3428" />
          </svg>
          <p style={{ fontSize: '12px', color: '#4A4438', margin: 0, lineHeight: 1.5 }}>
            Paste your 9:16 video URL in<br />Admin → VSL Landing Page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapRef} style={frame}>
      <video
        ref={videoRef}
        src={vsl.video_url}
        poster={vsl.video_poster_url || undefined}
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        controls={false}
        onTimeUpdate={handleTimeUpdate}
        onSeeking={clampSeek}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); trackOnce('vsl_video_complete'); }}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          width: '100%', height: '100%',
          objectFit: isFull ? 'contain' : 'cover',
          display: 'block', background: '#000',
        }}
      />

      {/* Tap the video body to pause/resume — only once they have committed. */}
      {unmuted && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Pause video' : 'Play video'}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}
        />
      )}

      {/* Unmute overlay — also the Low Power Mode fallback. */}
      {!unmuted && (
        <button
          type="button"
          onClick={handleUnmute}
          aria-label={`${vsl.video_overlay_title}. ${vsl.video_overlay_cta}`}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            border: 'none', background: 'rgba(0,0,0,0.12)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          }}
        >
          <span
            className="vsl-unmute"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
              background: 'rgba(214,40,29,0.92)', padding: '18px 22px', borderRadius: '6px',
              width: '100%', maxWidth: '320px', boxShadow: '0 10px 40px -8px rgba(0,0,0,0.7)',
            }}
          >
            <span style={{ color: '#fff', fontSize: '16px', fontWeight: 700, lineHeight: 1.25, textAlign: 'center' }}>
              {vsl.video_overlay_title}
            </span>
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M11 5L6 9H3v6h3l5 4V5z" fill="#fff" />
              <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
              <path d="M3 3l18 18" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <span style={{ color: '#fff', fontSize: '17px', fontWeight: 700 }}>
              {vsl.video_overlay_cta}
            </span>
          </span>
        </button>
      )}

      {/* Control bar: pause · mute · fullscreen. No scrubber, by design. */}
      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', gap: 0,
          background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.72))',
          paddingTop: '28px', pointerEvents: 'none',
        }}
      >
        {unmuted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 8px 6px', pointerEvents: 'auto' }}>
            <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} className="vsl-ctrl">
              <Icon d={playing ? PATH_PAUSE : PATH_PLAY} />
            </button>
            <button type="button" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'} className="vsl-ctrl">
              <Icon d={muted ? PATH_MUTED : PATH_SOUND} />
            </button>
            <button
              type="button"
              onClick={isFull ? exitFullscreen : goFullscreen}
              aria-label={isFull ? 'Exit fullscreen' : 'Fullscreen'}
              className="vsl-ctrl"
              style={{ marginLeft: 'auto' }}
            >
              <Icon d={isFull ? PATH_SHRINK : PATH_EXPAND} />
            </button>
          </div>
        )}

        {/* Cosmetic, non-linear, non-interactive. */}
        <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.14)' }} aria-hidden="true">
          <div
            style={{
              height: '100%', width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LT})`,
              transition: 'width .3s linear',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Testimonial card ─────────────────────────────────────────────────────────

interface Testimonial {
  name: string;
  metric: string;
  subtitle: string;
  body: string;
  videoUrl: string;
  posterUrl: string;
}

function TestimonialCard({ t }: { t: Testimonial }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function play() {
    const v = ref.current;
    if (!v) return;
    trackOnce('vsl_testimonial_play', { label: t.name });
    v.muted = false;
    void v.play().catch(() => {});
    setPlaying(true);
  }

  return (
    <div
      className="vsl-card"
      style={{
        background: CARD,
        border: `1px solid ${LINE}`,
        borderRadius: '16px',
        padding: '22px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <h3 style={{ margin: 0, color: INK, fontSize: '21px', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.015em' }}>
        {t.name}
      </h3>

      <p style={{ margin: 0, color: GOLD_LT, fontSize: '27px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
        {t.metric}
      </p>

      {t.subtitle && (
        <p style={{ margin: 0, color: '#A9873F', fontSize: '15px', fontWeight: 600, lineHeight: 1.35 }}>
          {t.subtitle}
        </p>
      )}

      {t.body && (
        <p style={{ margin: 0, color: '#9A9A9A', fontSize: '15px', lineHeight: 1.68 }}>
          {t.body}
        </p>
      )}

      {(t.videoUrl || t.posterUrl) && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 10',
            borderRadius: '10px',
            overflow: 'hidden',
            background: '#000',
            border: `1px solid ${LINE}`,
            marginTop: '2px',
          }}
        >
          {t.videoUrl ? (
            <video
              ref={ref}
              src={t.videoUrl}
              poster={t.posterUrl || undefined}
              playsInline
              preload="metadata"
              controls={playing}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={t.posterUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          )}

          {t.videoUrl && !playing && (
            <button
              type="button"
              onClick={play}
              aria-label={`Play ${t.name} case study`}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.18)', border: 'none', cursor: 'pointer',
              }}
            >
              <span
                className="vsl-play-btn"
                style={{
                  width: '62px', height: '62px', borderRadius: '50%', background: 'rgba(255,255,255,0.94)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 26px -4px rgba(0,0,0,0.6)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M8 5.5l11 6.5-11 6.5v-13z" fill="#0A0A0A" />
                </svg>
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── How it works — vertical gold rail ────────────────────────────────────────

interface StepItem { title: string; body: string }
interface StepGroup { label: string; items: StepItem[] }

function GoldCheck() {
  return (
    <span
      style={{
        position: 'relative',
        zIndex: 1,
        flexShrink: 0,
        width: '38px',
        height: '38px',
        borderRadius: '9px',
        background: `linear-gradient(145deg, ${GOLD_LT}, #B98C33)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 0 18px -2px rgba(212,168,83,0.45)`,
      }}
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" stroke="#161206" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function HowItWorks({ vsl, groups }: { vsl: VSLConfig; groups: StepGroup[] }) {
  return (
    <section style={{ padding: '64px 20px 56px', borderTop: `1px solid ${LINE}` }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <p
          style={{
            margin: 0, textAlign: 'center', color: GOLD, fontSize: '12px',
            fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
          }}
        >
          {vsl.how_eyebrow}
        </p>

        <h2
          style={{
            margin: '14px 0 0', textAlign: 'center', color: INK,
            fontSize: 'clamp(28px, 7vw, 40px)', fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.03em',
          }}
        >
          {vsl.how_headline}{' '}
          <span style={{ color: GOLD_LT, display: 'inline-block' }}>{vsl.how_headline_accent}</span>
        </h2>

        {vsl.how_subtext && (
          <p style={{ margin: '16px auto 0', maxWidth: '520px', textAlign: 'center', color: MUTED, fontSize: '16px', lineHeight: 1.6 }}>
            {vsl.how_subtext}
          </p>
        )}

        {/* The rail */}
        <div style={{ position: 'relative', marginTop: '44px', paddingLeft: '4px' }}>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', left: '22px', top: '8px', bottom: '8px', width: '2px',
              background: `linear-gradient(180deg, ${GOLD} 0%, rgba(212,168,83,0.35) 100%)`,
            }}
          />

          {groups.map((g) => (
            <div key={g.label} style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 22px', paddingLeft: '42px' }}>
                <span
                  style={{
                    position: 'relative', zIndex: 1,
                    background: 'rgba(212,168,83,0.09)',
                    border: `1px solid rgba(212,168,83,0.42)`,
                    color: GOLD_LT, fontSize: '11.5px', fontWeight: 700,
                    letterSpacing: '0.13em', textTransform: 'uppercase',
                    padding: '8px 16px', borderRadius: '9999px',
                  }}
                >
                  {g.label}
                </span>
              </div>

              {g.items.map((it) => (
                <div key={it.title} style={{ display: 'flex', gap: '18px', marginBottom: '30px' }}>
                  <GoldCheck />
                  <div style={{ paddingTop: '1px' }}>
                    <h4 style={{ margin: 0, color: INK, fontSize: '18.5px', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.015em' }}>
                      {it.title}
                    </h4>
                    <p style={{ margin: '7px 0 0', color: '#8F8F8F', fontSize: '15px', lineHeight: 1.62 }}>
                      {it.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ vsl }: { vsl: VSLConfig }) {
  const year = new Date().getFullYear();
  return (
    <footer style={{ borderTop: `1px solid ${LINE}`, padding: '40px 20px 52px', background: '#050505' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ margin: 0, color: GOLD_LT, fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em' }}>
          {vsl.footer_company}
        </p>

        <p style={{ margin: '16px 0 0', color: '#5E5E5E', fontSize: '12.5px', lineHeight: 1.7 }}>
          {vsl.footer_disclaimer}
        </p>

        <div style={{ marginTop: '20px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {vsl.footer_privacy_url && (
            <a href={vsl.footer_privacy_url} style={{ color: '#7A7A7A', fontSize: '13px', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              Privacy Policy
            </a>
          )}
          {vsl.footer_terms_url && (
            <a href={vsl.footer_terms_url} style={{ color: '#7A7A7A', fontSize: '13px', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              Terms
            </a>
          )}
        </div>

        <p style={{ margin: '22px 0 0', color: '#3D3D3D', fontSize: '12px' }}>
          © {year} {vsl.footer_company}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = ((step + 1) / total) * 100;
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', color: '#555', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Step {step + 1} of {total}
        </span>
        <span style={{ fontSize: '11px', color: '#555' }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: '3px', background: '#1F1F1F', borderRadius: '9999px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #D4A853, #E8C26A)',
            borderRadius: '9999px',
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  );
}

// ─── Option Button ────────────────────────────────────────────────────────────

function OptionBtn({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="offer-option-btn"
      onClick={onClick}
      style={{
        width: '100%',
        padding: '14px 18px',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: 500,
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.15s',
        border: selected ? '1.5px solid #D4A853' : '1.5px solid #222',
        background: selected ? 'rgba(212,168,83,0.1)' : '#0F0F0F',
        color: selected ? '#D4A853' : '#999',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <span
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          border: selected ? '2px solid #D4A853' : '2px solid #333',
          background: selected ? '#D4A853' : 'transparent',
          flexShrink: 0,
          transition: 'all 0.15s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 4L3 5.5L6.5 2" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

// ─── Arrow Button ─────────────────────────────────────────────────────────────

function ArrowBtn({ onClick, disabled, label = 'Continue' }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '15px',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: 700,
        border: 'none',
        background: disabled ? '#1A1A1A' : '#D4A853',
        color: disabled ? '#444' : '#000',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '8px',
      }}
    >
      {label}
      {!disabled && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8H13M9 4L13 8L9 12" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}


// ─── Multi-Step Form ──────────────────────────────────────────────────────────

function MultiStepForm({ ctaText = 'Book My Free Strategy Call →' }: { ctaText?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<FormData>({
    location: '',
    treatments: [],
    spend: '',
    challenge: '',
    name: '',
    phone: '',
  });

  useEffect(() => { trackOnce('vsl_form_start'); }, []);

  const navigate = useCallback((toStep: number, dir: 'forward' | 'back') => {
    track('vsl_form_step', { step: toStep });
    setDirection(dir);
    setAnimKey((k) => k + 1);
    setStep(toStep);
  }, []);

  function toggleTreatment(t: string) {
    setData((prev) => ({
      ...prev,
      treatments: prev.treatments.includes(t)
        ? prev.treatments.filter((x) => x !== t)
        : [...prev.treatments, t],
    }));
  }

  function selectSpend(v: string) {
    setData((prev) => ({ ...prev, spend: v }));
    setTimeout(() => navigate(3, 'forward'), 200);
  }

  function selectChallenge(v: string) {
    setData((prev) => ({ ...prev, challenge: v }));
    setTimeout(() => navigate(4, 'forward'), 200);
  }

  async function handleSubmit() {
    setSubmitting(true);
    track('vsl_form_submit');
    // TODO: Replace console.log with Supabase insert to 'offer_leads' table
    console.log('[offer_lead]', data);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('offer_lead_name', data.name);
    }
    router.push('/offer/booked');
  }

  const animStyle = {
    animation: `${direction === 'forward' ? 'slideInRight' : 'slideInLeft'} 0.35s cubic-bezier(0.16, 1, 0.3, 1) both`,
  };

  return (
    <div
      style={{
        background: '#141414',
        border: '1px solid #1F1F1F',
        borderRadius: '20px',
        padding: '32px 28px',
        maxWidth: '480px',
        width: '100%',
        margin: '0 auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}
    >
      <ProgressBar step={step} total={5} />

      {/* Back link */}
      {step > 0 && (
        <button
          type="button"
          onClick={() => navigate(step - 1, 'back')}
          style={{
            background: 'none',
            border: 'none',
            color: '#555',
            fontSize: '13px',
            cursor: 'pointer',
            padding: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L5 7L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
      )}

      <div key={animKey} style={animStyle}>
        {/* Step 0: Location */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#F5F5F5', lineHeight: 1.3, margin: 0 }}>
              Where is your clinic located?
            </h2>
            <input
              type="text"
              placeholder="Example: Toronto, New York, Miami"
              value={data.location}
              onChange={(e) => setData((p) => ({ ...p, location: e.target.value }))}
              autoFocus
              style={{
                width: '100%',
                padding: '15px 16px',
                borderRadius: '10px',
                border: `1.5px solid ${data.location ? '#D4A853' : '#222'}`,
                background: '#0F0F0F',
                color: '#F5F5F5',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#D4A853')}
              onBlur={(e) => { if (!data.location) e.currentTarget.style.borderColor = '#222'; }}
              onKeyDown={(e) => { if (e.key === 'Enter' && data.location.trim()) navigate(1, 'forward'); }}
            />
            <ArrowBtn onClick={() => navigate(1, 'forward')} disabled={!data.location.trim()} />
          </div>
        )}

        {/* Step 1: Treatments */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#F5F5F5', lineHeight: 1.3, margin: '0 0 8px' }}>
              What treatments do you primarily offer?
            </h2>
            <p style={{ fontSize: '13px', color: '#555', margin: '0 0 4px' }}>Select all that apply</p>
            {TREATMENT_OPTIONS.map((opt) => (
              <OptionBtn
                key={opt}
                label={opt}
                selected={data.treatments.includes(opt)}
                onClick={() => toggleTreatment(opt)}
              />
            ))}
            <ArrowBtn
              onClick={() => navigate(2, 'forward')}
              disabled={data.treatments.length === 0}
            />
          </div>
        )}

        {/* Step 2: Marketing spend (single select — auto advance) */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#F5F5F5', lineHeight: 1.3, margin: '0 0 8px' }}>
              How much are you currently spending on marketing per month?
            </h2>
            {SPEND_OPTIONS.map((opt) => (
              <OptionBtn
                key={opt}
                label={opt}
                selected={data.spend === opt}
                onClick={() => selectSpend(opt)}
              />
            ))}
          </div>
        )}

        {/* Step 3: Challenge (single select — auto advance) */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#F5F5F5', lineHeight: 1.3, margin: '0 0 8px' }}>
              What's your biggest challenge right now?
            </h2>
            {CHALLENGE_OPTIONS.map((opt) => (
              <OptionBtn
                key={opt}
                label={opt}
                selected={data.challenge === opt}
                onClick={() => selectChallenge(opt)}
              />
            ))}
          </div>
        )}

        {/* Step 4: Contact */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#F5F5F5', lineHeight: 1.3, margin: 0 }}>
              Last step — best name and number to reach you
            </h2>
            <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
              We'll reach out to confirm your free strategy call.
            </p>
            <input
              type="text"
              placeholder="Your first name"
              value={data.name}
              onChange={(e) => setData((p) => ({ ...p, name: e.target.value }))}
              autoFocus
              style={{
                width: '100%',
                padding: '15px 16px',
                borderRadius: '10px',
                border: `1.5px solid ${data.name ? '#D4A853' : '#222'}`,
                background: '#0F0F0F',
                color: '#F5F5F5',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#D4A853')}
              onBlur={(e) => { if (!data.name) e.currentTarget.style.borderColor = '#222'; }}
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={data.phone}
              onChange={(e) => setData((p) => ({ ...p, phone: e.target.value }))}
              style={{
                width: '100%',
                padding: '15px 16px',
                borderRadius: '10px',
                border: `1.5px solid ${data.phone ? '#D4A853' : '#222'}`,
                background: '#0F0F0F',
                color: '#F5F5F5',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#D4A853')}
              onBlur={(e) => { if (!data.phone) e.currentTarget.style.borderColor = '#222'; }}
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!data.name.trim() || !data.phone.trim() || submitting}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 700,
                border: 'none',
                background: (!data.name.trim() || !data.phone.trim() || submitting) ? '#1A1A1A' : '#D4A853',
                color: (!data.name.trim() || !data.phone.trim() || submitting) ? '#444' : '#000',
                cursor: (!data.name.trim() || !data.phone.trim() || submitting) ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                marginTop: '4px',
              }}
            >
              {submitting ? 'Sending…' : ctaText}
            </button>
            <p style={{ fontSize: '12px', color: '#444', textAlign: 'center', margin: 0 }}>
              No spam, ever. We'll only use this to confirm your call.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OfferClient({ vsl }: { vsl: VSLConfig }) {
  useEffect(() => {
    trackOnce('vsl_page_view');
  }, []);

  const testimonials: Testimonial[] = ([1, 2, 3] as const)
    .map((n) => ({
      name: vsl[`t${n}_name`],
      metric: vsl[`t${n}_metric`],
      subtitle: vsl[`t${n}_subtitle`],
      body: vsl[`t${n}_body`],
      videoUrl: vsl[`t${n}_video_url`],
      posterUrl: vsl[`t${n}_poster_url`],
    }))
    .filter((t) => t.name || t.metric);

  const stepGroups: StepGroup[] = ([1, 2, 3] as const)
    .map((n) => ({
      label: vsl[`step${n}_label`],
      items: ([1, 2, 3] as const)
        .map((m) => ({ title: vsl[`step${n}_item${m}_title`], body: vsl[`step${n}_item${m}_body`] }))
        .filter((it) => it.title.trim()),
    }))
    .filter((g) => g.label.trim() && g.items.length > 0);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        color: INK,
        fontFamily: "'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />

      {/* ── Hero + VSL ───────────────────────────────────────────────── */}
      <section
        style={{
          padding: '34px 20px 44px',
          background: 'radial-gradient(120% 70% at 50% 0%, #161208 0%, #000 62%)',
        }}
      >
        <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
          {vsl.hero_badge && (
            <span
              className="reveal"
              style={{
                display: 'inline-block',
                border: `1px solid rgba(212,168,83,0.38)`,
                background: 'rgba(212,168,83,0.07)',
                color: GOLD_LT,
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '9px 18px',
                borderRadius: '9999px',
              }}
            >
              {vsl.hero_badge}
            </span>
          )}

          <h1
            className="reveal"
            style={{
              margin: '22px 0 0',
              fontSize: 'clamp(30px, 8vw, 46px)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.035em',
              color: INK,
            }}
          >
            {vsl.hero_headline}
          </h1>

          {vsl.hero_subheadline && (
            <p style={{ margin: '18px auto 0', maxWidth: '420px', color: '#A5A5A5', fontSize: '17px', lineHeight: 1.5 }}>
              {vsl.hero_subheadline}
            </p>
          )}

          {(vsl.hero_pill_1 || vsl.hero_pill_2) && (
            <div style={{ marginTop: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              {[vsl.hero_pill_1, vsl.hero_pill_2].filter(Boolean).map((p) => (
                <span
                  key={p}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '9px',
                    background: 'rgba(212,168,83,0.1)',
                    border: `1px solid rgba(212,168,83,0.42)`,
                    color: GOLD_LT, fontSize: '14.5px', fontWeight: 700,
                    padding: '10px 20px', borderRadius: '9999px',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" stroke={GOLD_LT} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* The main event */}
        <div style={{ marginTop: '32px' }}>
          <VerticalVSL vsl={vsl} />
        </div>
      </section>

      {/* ── Lead form ────────────────────────────────────────────────── */}
      <section style={{ padding: '8px 20px 60px' }}>
        {vsl.form_headline && (
          <h2
            style={{
              maxWidth: '480px', margin: '0 auto 22px', textAlign: 'center', color: INK,
              fontSize: 'clamp(22px, 5.5vw, 28px)', fontWeight: 800, lineHeight: 1.18, letterSpacing: '-0.025em',
            }}
          >
            {vsl.form_headline}
          </h2>
        )}
        <MultiStepForm ctaText={vsl.hero_cta_text} />
        {vsl.hero_tagline && (
          <p style={{ margin: '18px auto 0', textAlign: 'center', color: '#5A5A5A', fontSize: '13px' }}>
            {vsl.hero_tagline}
          </p>
        )}
      </section>

      {/* ── Client results ───────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section style={{ padding: '58px 20px 54px', borderTop: `1px solid ${LINE}`, background: '#030303' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            {vsl.proof_eyebrow && (
              <p
                style={{
                  margin: 0, textAlign: 'center', color: GOLD, fontSize: '12px',
                  fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
                }}
              >
                {vsl.proof_eyebrow}
              </p>
            )}
            {vsl.proof_headline && (
              <h2
                style={{
                  margin: '14px 0 36px', textAlign: 'center', color: INK,
                  fontSize: 'clamp(26px, 6.5vw, 36px)', fontWeight: 800, lineHeight: 1.14, letterSpacing: '-0.03em',
                }}
              >
                {vsl.proof_headline}
              </h2>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {testimonials.map((t) => (
                <TestimonialCard key={t.name} t={t} />
              ))}
            </div>

            {vsl.proof_disclaimer && (
              <p style={{ margin: '32px auto 0', maxWidth: '540px', textAlign: 'center', color: '#5A5A5A', fontSize: '13px', lineHeight: 1.65 }}>
                {vsl.proof_disclaimer}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── How it works ─────────────────────────────────────────────── */}
      {stepGroups.length > 0 && <HowItWorks vsl={vsl} groups={stepGroups} />}

      <Footer vsl={vsl} />
    </div>
  );
}
