import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  const db = getAdminClient();
  let query = db.from('result_contents').select('*');
  if (domain) query = query.eq('domain', domain);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  const body = await request.json();
  const db = getAdminClient();
  const { data, error } = await db
    .from('result_contents')
    .insert(body)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
