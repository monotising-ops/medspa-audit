import type {
  ResultContent,
  Domain,
  RevenueTier,
  DomainScores,
  ContentType,
} from '@/types';

export function renderTemplate(
  template: string,
  vars: { spa_name: string; treatments: string }
): string {
  return template
    .replace(/\{spa_name\}/g, vars.spa_name)
    .replace(/\{treatments\}/g, vars.treatments);
}

export function findContent(
  contents: ResultContent[],
  domain: Domain,
  contentType: ContentType,
  domainScore: number,
  revenueTier: RevenueTier | null
): ResultContent | null {
  // Try revenue-tier-specific first, then fall back to null-tier (applies to all)
  const candidates = contents.filter(
    c =>
      c.domain === domain &&
      c.content_type === contentType &&
      domainScore >= c.score_range_min &&
      domainScore <= c.score_range_max
  );

  if (revenueTier) {
    const specific = candidates.find(c => c.revenue_tier === revenueTier);
    if (specific) return specific;
  }

  return candidates.find(c => c.revenue_tier === null) ?? null;
}

export function buildPersonalizationVars(
  spa_name: string,
  top_treatments: string[]
): { spa_name: string; treatments: string } {
  const treatments =
    top_treatments.length > 0
      ? top_treatments.slice(0, 3).join(', ')
      : 'your top treatments';
  return { spa_name: spa_name || 'your spa', treatments };
}

export function getDomainInsightText(
  domain: keyof DomainScores,
  pct: number,
  selectedAnswers: string[]
): string {
  const answerContext = selectedAnswers.length > 0
    ? `Based on your answers (${selectedAnswers.join(', ')}), `
    : '';

  const insights: Record<keyof DomainScores, Record<'low' | 'mid' | 'high', string>> = {
    lead_gen: {
      low: `${answerContext}your lead generation is leaving serious money on the table. Most med spas at this stage are either not advertising, or running one generic campaign hoping for the best. Treatment-specific campaigns consistently outperform broad ones by 3–5x.`,
      mid: `${answerContext}you have some lead gen activity but it's not fully optimized. Refreshing creatives regularly and adding retargeting can typically cut your cost-per-lead in half within 60 days.`,
      high: `${answerContext}your lead generation is performing well. Focus on scaling what's working and testing new creatives to maintain momentum.`,
    },
    speed_to_lead: {
      low: `${answerContext}this is likely your biggest hidden revenue leak. Research from MIT shows that responding within 5 minutes makes you 21x more likely to convert a lead vs. responding within 30 minutes. Every hour of delay costs you bookings.`,
      mid: `${answerContext}your follow-up process exists but has gaps. Building a structured multi-touch sequence (call → text → email over 5 days) can recover 30–40% of leads that don't answer the first contact.`,
      high: `${answerContext}your speed-to-lead is strong. A dedicated booking specialist with a scripted sequence is the gold standard — you're close to it.`,
    },
    booking: {
      low: `${answerContext}a 20%+ no-show rate is costing you thousands per month in lost revenue plus staff time. Automated 3-touch reminder sequences (confirmation + 24hr + 1hr) typically cut no-shows by 40–60%.`,
      mid: `${answerContext}your booking systems are partially in place. Adding an SMS reminder 1 hour before the appointment is the highest-ROI single change you can make.`,
      high: `${answerContext}your booking and no-show systems are working. Consider adding a deposit requirement for high-demand appointments to further reduce no-shows.`,
    },
    attribution: {
      low: `${answerContext}without tracking which ads produce which revenue, you're flying blind. You likely have some campaigns wasting budget and others underfunded. Full tracking from click → lead → booking → revenue is essential before scaling spend.`,
      mid: `${answerContext}you have partial visibility. Getting to full attribution (click → revenue) typically reveals that 20% of campaigns produce 80% of profitable bookings.`,
      high: `${answerContext}you have strong attribution data. This is your competitive advantage — use it to aggressively scale the campaigns with the best revenue per lead.`,
    },
    growth: {
      low: `${answerContext}you're leaving significant recurring revenue on the table. First-time patients are your most expensive acquisition — without a retention system, you pay acquisition costs repeatedly for the same result. A simple membership or follow-up sequence can 2x LTV.`,
      mid: `${answerContext}you have some retention in place. Building automated post-treatment touchpoints (at 2 weeks, 6 weeks, 3 months) for your top treatments creates a predictable rebooking pipeline.`,
      high: `${answerContext}your growth systems are solid. Focus on referral incentivization to compound organic growth from your existing satisfied patients.`,
    },
  };

  if (pct <= 0.4) return insights[domain].low;
  if (pct <= 0.7) return insights[domain].mid;
  return insights[domain].high;
}
