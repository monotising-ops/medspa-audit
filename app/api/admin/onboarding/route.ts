import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;
  const db = getAdminClient();
  // Use select('*') so this works whether or not hidden_sections column exists yet.
  // Strip the heavy JSONB blobs (form_data, checklist_data, uploaded_files) before returning.
  const { data, error } = await db
    .from('client_onboarding')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const summary = (data ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ form_data, checklist_data, uploaded_files, ...rest }: Record<string, unknown>) => rest
  );
  return Response.json(summary);
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
  const { error } = await db
    .from('client_onboarding')
    .update({ hidden_sections: hidden_sections ?? [] })
    .eq('client_id', client_id);
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
