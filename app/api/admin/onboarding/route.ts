import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;
  const db = getAdminClient();
  const [clientsRes, sectionsRes] = await Promise.all([
    db.from('client_onboarding')
      .select('client_id, client_name, completion_percentage, skipped_questions, created_at, updated_at')
      .order('updated_at', { ascending: false }),
    db.from('site_configs').select('key, value').eq('section', 'client_sections'),
  ]);
  if (clientsRes.error) return Response.json({ error: clientsRes.error.message }, { status: 500 });
  const hiddenMap: Record<string, string[]> = {};
  for (const row of sectionsRes.data ?? []) {
    try { hiddenMap[row.key] = JSON.parse(row.value); } catch {}
  }
  const records = (clientsRes.data ?? []).map((r) => ({
    ...r,
    hidden_sections: hiddenMap[r.client_id] ?? [],
  }));
  return Response.json(records);
}

export async function POST(request: NextRequest) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;
  const { client_id, client_name } = await request.json();
  if (!client_id) return Response.json({ error: 'client_id required' }, { status: 400 });
  const db = getAdminClient();
  const { data, error } = await db
    .from('client_onboarding')
    .insert({
      client_id,
      client_name: client_name ?? client_id,
      form_data: {},
      checklist_data: {},
      skipped_questions: [],
      uploaded_files: {},
      completion_percentage: 0,
    })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function PATCH(request: NextRequest) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;
  const { client_id, hidden_sections } = await request.json();
  if (!client_id) return Response.json({ error: 'client_id required' }, { status: 400 });
  const db = getAdminClient();
  // Store hidden_sections in site_configs so no migration is required
  const { error } = await db
    .from('site_configs')
    .upsert(
      { section: 'client_sections', key: client_id, value: JSON.stringify(hidden_sections ?? []) },
      { onConflict: 'section,key' }
    );
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;
  const { client_id } = await request.json();
  const db = getAdminClient();
  await db.from('client_onboarding').delete().eq('client_id', client_id);
  return Response.json({ ok: true });
}
