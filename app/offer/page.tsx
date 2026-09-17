import { getAdminClient } from '@/lib/supabase';
import { defaultVSL } from '@/lib/vsl-defaults';
import type { VSLConfig } from '@/types';
import OfferClient from './OfferClient';

// Statically rendered with the real config baked in, so the <video> src is
// present in the first byte of HTML and muted autoplay can start immediately
// instead of waiting on a client round trip to /api/config.
//
// Saving in the admin calls revalidatePath('/offer'), so edits go live at
// once rather than waiting out this window.
export const revalidate = 300;

async function loadVSL(): Promise<VSLConfig> {
  const base = defaultVSL();
  try {
    const { data, error } = await getAdminClient()
      .from('site_configs')
      .select('key,value')
      .eq('section', 'vsl');
    if (error || !data) return base;
    return { ...base, ...Object.fromEntries(data.map((r) => [r.key, r.value])) };
  } catch {
    // No credentials at build time, or the DB is unreachable — the page still
    // renders from defaults rather than failing the build.
    return base;
  }
}

export default async function OfferPage() {
  return <OfferClient vsl={await loadVSL()} />;
}
