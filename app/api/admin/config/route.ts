import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section');

  const db = getAdminClient();
  let query = db.from('site_configs').select('*');
  if (section) query = query.eq('section', section);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  const updates: { section: string; key: string; value: string }[] = await request.json();
  const db = getAdminClient();

  const { error } = await db
    .from('site_configs')
    .upsert(updates, { onConflict: 'section,key' });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
