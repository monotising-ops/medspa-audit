import { getAdminClient } from '@/lib/supabase';

export async function GET() {
  const db = getAdminClient();
  const { data, error } = await db.from('info_bank').select('*').order('created_at');
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? []);
}
