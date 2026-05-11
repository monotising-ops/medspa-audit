import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;
  const db = getAdminClient();
  const { data, error } = await db.from('info_bank').select('*').order('created_at');
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;
  const body = await request.json();
  const db = getAdminClient();
  const { data, error } = await db.from('info_bank').insert(body).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
