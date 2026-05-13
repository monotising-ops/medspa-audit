import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import type { Lead, WebhookPayload } from '@/types';
import { DOMAIN_LABELS } from '@/types';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const db = getAdminClient();

  // Strip webhook-only fields that don't exist as DB columns
  const { grade_label, domain_max, weakest_domain, ...insertData } = body;

  const { data: lead, error } = await db
    .from('leads')
    .insert(insertData)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Fire webhook if configured
  const { data: webhookRow } = await db
    .from('site_configs')
    .select('value')
    .eq('section', 'settings')
    .eq('key', 'webhook_url')
    .single();

  const webhookUrl = webhookRow?.value;
  if (webhookUrl) {
    const l = lead as Lead;
    const payload: WebhookPayload = {
      event: 'lead_submitted',
      timestamp: new Date().toISOString(),
      lead: {
        name: l.name,
        email: l.email,
        spa_name: l.spa_name,
        revenue_tier: l.revenue_tier,
        location_count: l.location_count,
        top_treatments: l.top_treatments,
        total_score: l.total_score,
        max_score: l.max_score,
        grade: l.grade,
        grade_label: body.grade_label ?? '',
        domain_scores: {
          lead_gen: { score: l.domain_scores.lead_gen, max: body.domain_max?.lead_gen ?? 12 },
          speed_to_lead: { score: l.domain_scores.speed_to_lead, max: body.domain_max?.speed_to_lead ?? 12 },
          booking: { score: l.domain_scores.booking, max: body.domain_max?.booking ?? 8 },
          attribution: { score: l.domain_scores.attribution, max: body.domain_max?.attribution ?? 8 },
          growth: { score: l.domain_scores.growth, max: body.domain_max?.growth ?? 4 },
        },
        weakest_domain: body.weakest_domain ?? 'lead_gen',
        results_url: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/results/${l.id}`,
      },
    };
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => null); // fire-and-forget
  }

  return Response.json({ id: lead.id }, { status: 201 });
}
