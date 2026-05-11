import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export async function GET() {
  const db = getAdminClient();
  const { data, error } = await db
    .from('questions')
    .select('*')
    .eq('active', true)
    .order('order');

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
