import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { buildCSV } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? '';
  const grade = searchParams.get('grade');
  const revenue_tier = searchParams.get('revenue_tier');
  const tag = searchParams.get('tag');
  const scoreMin = searchParams.get('score_min');
  const scoreMax = searchParams.get('score_max');
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');
  const exportCsv = searchParams.get('export') === 'csv';
  const sort = searchParams.get('sort') ?? 'created_at';
  const order = searchParams.get('order') === 'asc' ? true : false;

  const db = getAdminClient();
  let query = db.from('leads').select('*').order(sort, { ascending: order });

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,spa_name.ilike.%${search}%`
    );
  }
  if (grade) query = query.eq('grade', grade);
  if (revenue_tier) query = query.eq('revenue_tier', revenue_tier);
  if (scoreMin) query = query.gte('total_score', parseInt(scoreMin));
  if (scoreMax) query = query.lte('total_score', parseInt(scoreMax));
  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', dateTo);
  if (tag) query = query.contains('tags', [tag]);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  if (exportCsv) {
    const flat = (data ?? []).map((l) => ({
      id: l.id,
      created_at: l.created_at,
      name: l.name,
      email: l.email,
      spa_name: l.spa_name,
      revenue_tier: l.revenue_tier,
      location_count: l.location_count,
      top_treatments: (l.top_treatments ?? []).join('; '),
      total_score: l.total_score,
      max_score: l.max_score,
      grade: l.grade,
      lead_gen_score: l.domain_scores?.lead_gen ?? 0,
      speed_to_lead_score: l.domain_scores?.speed_to_lead ?? 0,
      booking_score: l.domain_scores?.booking ?? 0,
      attribution_score: l.domain_scores?.attribution ?? 0,
      growth_score: l.domain_scores?.growth ?? 0,
      tags: (l.tags ?? []).join('; '),
      notes: l.notes ?? '',
    }));
    return new Response(buildCSV(flat), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="leads.csv"',
      },
    });
  }

  return Response.json(data ?? []);
}
