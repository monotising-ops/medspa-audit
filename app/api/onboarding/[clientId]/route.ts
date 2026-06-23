// SQL — run once in Supabase dashboard:
// CREATE TABLE client_onboarding (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   client_id TEXT UNIQUE NOT NULL,
//   client_name TEXT,
//   form_data JSONB DEFAULT '{}',
//   checklist_data JSONB DEFAULT '{}',
//   skipped_questions TEXT[] DEFAULT '{}',
//   uploaded_files JSONB DEFAULT '{}',
//   completion_percentage INTEGER DEFAULT 0,
//   created_at TIMESTAMPTZ DEFAULT NOW(),
//   updated_at TIMESTAMPTZ DEFAULT NOW()
// );
// Migration — run if table already exists:
// ALTER TABLE client_onboarding ADD COLUMN IF NOT EXISTS hidden_sections TEXT[] DEFAULT '{}';
// Also create Supabase Storage bucket named: onboarding-assets (public)

import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

const TOTAL_FIELDS = 15 + 5; // 15 intake questions + 5 checklist items

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const db = getAdminClient();
  const [clientRes, sectionsRes] = await Promise.all([
    db.from('client_onboarding').select('*').eq('client_id', clientId).maybeSingle(),
    db.from('site_configs').select('value').eq('section', 'client_sections').eq('key', clientId).maybeSingle(),
  ]);
  if (clientRes.error) return Response.json({ error: clientRes.error.message }, { status: 500 });
  let hidden_sections: string[] = [];
  if (sectionsRes.data?.value) {
    try { hidden_sections = JSON.parse(sectionsRes.data.value); } catch {}
  }
  const data = clientRes.data ? { ...clientRes.data, hidden_sections } : null;
  return Response.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const body = await request.json();
  const { form_data, checklist_data, skipped_questions, client_name, uploaded_files } = body;

  const filledForm = Object.values(form_data ?? {}).filter(
    (v) => typeof v === 'string' && (v as string).trim().length > 0
  ).length;
  const checkedItems = Object.values(checklist_data ?? {}).filter(
    (v: unknown) => (v as { checked?: boolean })?.checked
  ).length;
  const completion_percentage = Math.min(100, Math.round(((filledForm + checkedItems) / TOTAL_FIELDS) * 100));

  const db = getAdminClient();
  const { data, error } = await db
    .from('client_onboarding')
    .update({
      client_name: client_name ?? clientId,
      form_data: form_data ?? {},
      checklist_data: checklist_data ?? {},
      skipped_questions: skipped_questions ?? [],
      uploaded_files: uploaded_files ?? {},
      completion_percentage,
      updated_at: new Date().toISOString(),
    })
    .eq('client_id', clientId)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data, completion_percentage });
}
