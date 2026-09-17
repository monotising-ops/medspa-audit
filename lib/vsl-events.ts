// Funnel events for the /offer VSL.
//
// Two destinations:
//   1. Our own vsl_events table — first-party, cookie-free, the numbers the
//      admin dashboard reads. Most accurate, invisible to ad blockers.
//   2. The Meta Pixel — filled in by the Pixel + CAPI pass. Guarded so it
//      stays inert until then.
//
// session_id lives in sessionStorage, not a cookie: it is a random string
// scoped to one tab visit, never shared across sites, and carries no
// personal data. Nothing here needs a consent banner for US traffic.

export type VslEvent =
  | 'vsl_page_view'
  | 'vsl_unmute_click'
  | 'vsl_video_25'
  | 'vsl_video_50'
  | 'vsl_video_75'
  | 'vsl_video_complete'
  | 'vsl_testimonial_play'
  | 'vsl_form_start'
  | 'vsl_form_step'
  | 'vsl_form_submit';

interface Meta {
  step?: number;
  label?: string;
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
  }
}

const SESSION_KEY = 'vsl_sid';

function sessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // Private mode with storage disabled — events still reach the Pixel.
    return '';
  }
}

function device(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  if (/iPhone|Android.*Mobile|Mobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

function campaign() {
  if (typeof window === 'undefined') return {};
  const q = new URLSearchParams(window.location.search);
  return {
    path: window.location.pathname,
    referrer: document.referrer || undefined,
    utm_source: q.get('utm_source') ?? undefined,
    utm_medium: q.get('utm_medium') ?? undefined,
    utm_campaign: q.get('utm_campaign') ?? undefined,
    utm_content: q.get('utm_content') ?? undefined,
  };
}

function persist(event: VslEvent, meta: Meta) {
  const sid = sessionId();
  if (!sid) return;

  const body = JSON.stringify({
    session_id: sid,
    event,
    step: meta.step,
    label: meta.label,
    device: device(),
    ...campaign(),
  });

  // sendBeacon survives the page unloading mid-navigation, which matters on
  // the form-submit event. Falls back to keepalive fetch.
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const ok = navigator.sendBeacon('/api/vsl-events', new Blob([body], { type: 'application/json' }));
      if (ok) return;
    }
    void fetch('/api/vsl-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* analytics must never break the page */
  }
}

function send(event: VslEvent, meta: Meta) {
  if (typeof window === 'undefined') return;

  persist(event, meta);

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...meta });

  // Pixel wiring lands in the tracking pass; inert until fbq exists.
  window.fbq?.('trackCustom', event, meta);

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[vsl]', event, meta);
  }
}

// Video milestones and the pageview should only count once per visit.
// Form steps are allowed to repeat (people go back).
const fired = new Set<string>();

export function track(event: VslEvent, meta: Meta = {}) {
  send(event, meta);
}

export function trackOnce(event: VslEvent, meta: Meta = {}) {
  const key = meta.label ? `${event}:${meta.label}` : event;
  if (fired.has(key)) return;
  fired.add(key);
  send(event, meta);
}
