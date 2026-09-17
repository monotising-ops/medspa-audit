import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

// Public write endpoint for /offer funnel events. Accepts only the known
// event names and a fixed set of columns, so a scraped endpoint cannot be
// used to write arbitrary rows.

const ALLOWED = new Set([
  'vsl_page_view',
  'vsl_unmute_click',
  'vsl_video_25',
  'vsl_video_50',
  'vsl_video_75',
  'vsl_video_complete',
  'vsl_testimonial_play',
  'vsl_form_start',
  'vsl_form_step',
  'vsl_form_submit',
]);

function str(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Bad JSON' }, { status: 400 });
  }

  const event = str(payload.event, 64);
  const sessionId = str(payload.session_id, 128);

  if (!event || !ALLOWED.has(event)) return Response.json({ error: 'Unknown event' }, { status: 400 });
  if (!sessionId) return Response.json({ error: 'Missing session' }, { status: 400 });

  const step =
    typeof payload.step === 'number' && Number.isFinite(payload.step) ? Math.trunc(payload.step) : null;

  const row = {
    session_id: sessionId,
    event,
    step,
    label: str(payload.label, 120),
    device: str(payload.device, 20),
    path: str(payload.path, 200),
    referrer: str(payload.referrer, 400),
    utm_source: str(payload.utm_source, 120),
    utm_medium: str(payload.utm_medium, 120),
    utm_campaign: str(payload.utm_campaign, 160),
    utm_content: str(payload.utm_content, 160),
  };

  const { error } = await getAdminClient().from('vsl_events').insert(row);

  // Never surface analytics failures to the visitor's page.
  if (error) {
    console.error('[vsl-events]', error.message);
    return Response.json({ ok: false }, { status: 202 });
  }
  return Response.json({ ok: true }, { status: 202 });
}
