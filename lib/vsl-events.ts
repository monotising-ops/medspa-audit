// Funnel events for the /offer VSL.
//
// Every event is emitted here and nowhere else, so the Meta Pixel + CAPI pass
// only has to fill in `send()` — no hunting through the page for call sites.
// Until then these are no-ops in production and visible in the console in dev.

export type VslEvent =
  | 'vsl_page_view'
  | 'vsl_unmute_click'
  | 'vsl_video_25'
  | 'vsl_video_50'
  | 'vsl_video_75'
  | 'vsl_video_complete'
  | 'vsl_form_start'
  | 'vsl_form_step'
  | 'vsl_form_submit';

type Payload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Payload[];
    fbq?: (...args: unknown[]) => void;
  }
}

function send(event: VslEvent, data: Payload) {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...data });

  // Pixel wiring lands in the tracking pass; guarded so it is inert until then.
  window.fbq?.('trackCustom', event, data);

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[vsl]', event, data);
  }
}

// Events that should only ever fire once per pageview (video milestones,
// page view itself). Form steps are allowed to repeat.
const fired = new Set<string>();

export function track(event: VslEvent, data: Payload = {}) {
  send(event, data);
}

export function trackOnce(event: VslEvent, data: Payload = {}) {
  if (fired.has(event)) return;
  fired.add(event);
  send(event, data);
}
