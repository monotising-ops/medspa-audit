import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;
  const db = getAdminClient();
  const { data, error } = await db
    .from('client_onboarding')
    .select('client_id, client_name, completion_percentage, skipped_questions, created_at, updated_at')
    .order('updated_at', { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? []);
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

export async function DELETE(request: NextRequest) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;
  const { client_id } = await request.json();
  const db = getAdminClient();
  await db.from('client_onboarding').delete().eq('client_id', client_id);
  return Response.json({ ok: true });
}
