import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  const db = getAdminClient();
  const { data, error } = await db.from('questions').select('*').order('order');
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(request: NextRequest) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  const body = await request.json();
  const db = getAdminClient();

  // Get max order
  const { data: last } = await db
    .from('questions')
    .select('order')
    .order('order', { ascending: false })
    .limit(1)
    .single();

  const newOrder = (last?.order ?? 0) + 1;
  const { data, error } = await db
    .from('questions')
    .insert({ ...body, order: newOrder })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
