import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  const { id } = await params;
  const body = await request.json();
  const db = getAdminClient();

  const { data, error } = await db
    .from('leads')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
