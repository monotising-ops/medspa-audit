import { getAdminClient } from '@/lib/supabase';

// Public: fetch site configs for assessment display (cover, gate, grade tiers)
export async function GET() {
  const db = getAdminClient();

  const [configs, gradeTiers] = await Promise.all([
    db.from('site_configs').select('*'),
    db.from('grade_tiers').select('*'),
  ]);

  if (configs.error) return Response.json({ error: configs.error.message }, { status: 500 });

  // Group configs by section
  const grouped: Record<string, Record<string, string>> = {};
  for (const row of configs.data ?? []) {
    if (!grouped[row.section]) grouped[row.section] = {};
    grouped[row.section][row.key] = row.value;
  }

  return Response.json({ configs: grouped, gradeTiers: gradeTiers.data ?? [] });
}
