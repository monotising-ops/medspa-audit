import { getAdminClient } from '@/lib/supabase';

// Public endpoint: fetch all result contents for assessment rendering
export async function GET() {
  const db = getAdminClient();
  const { data, error } = await db.from('result_contents').select('*');
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? []);
}
