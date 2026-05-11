import type {
  Question,
  AnswerRecord,
  DomainScores,
  ScoreResult,
  Grade,
  GradeTier,
} from '@/types';

const DOMAIN_KEYS = [
  'lead_gen',
  'speed_to_lead',
  'booking',
  'attribution',
  'growth',
] as const;

export function computeScores(
  questions: Question[],
  answers: Map<string, AnswerRecord>,
  gradeTiers: GradeTier[]
): ScoreResult {
  const scored = questions.filter(q => q.type === 'scored' && q.active);

  const domain_scores: DomainScores = {
    lead_gen: 0,
    speed_to_lead: 0,
    booking: 0,
    attribution: 0,
    growth: 0,
  };

  const domain_max: DomainScores = {
    lead_gen: 0,
    speed_to_lead: 0,
    booking: 0,
    attribution: 0,
    growth: 0,
  };

  for (const q of scored) {
    const d = q.domain as keyof DomainScores;
    if (!DOMAIN_KEYS.includes(d)) continue;
    const maxOption = Math.max(...q.options.map(o => o.score), 0);
    domain_max[d] += maxOption;

    const answer = answers.get(q.id);
    if (answer) {
      domain_scores[d] += answer.score;
    }
  }

  const total_score = DOMAIN_KEYS.reduce((s, k) => s + domain_scores[k], 0);
  const max_score = DOMAIN_KEYS.reduce((s, k) => s + domain_max[k], 0);
  const pct = max_score > 0 ? total_score / max_score : 0;

  const domain_percentages: DomainScores = {
    lead_gen: domain_max.lead_gen > 0 ? domain_scores.lead_gen / domain_max.lead_gen : 0,
    speed_to_lead: domain_max.speed_to_lead > 0 ? domain_scores.speed_to_lead / domain_max.speed_to_lead : 0,
    booking: domain_max.booking > 0 ? domain_scores.booking / domain_max.booking : 0,
    attribution: domain_max.attribution > 0 ? domain_scores.attribution / domain_max.attribution : 0,
    growth: domain_max.growth > 0 ? domain_scores.growth / domain_max.growth : 0,
  };

  const tier = gradeTiers.find(t => pct >= t.min_percent && pct <= t.max_percent)
    ?? gradeTiers[0];

  const grade = tier?.grade ?? 'critical';
  const grade_label = tier?.label ?? '';
  const grade_color = tier?.color ?? '#ef4444';

  const weakest_domain = DOMAIN_KEYS.reduce((a, b) =>
    domain_percentages[a] <= domain_percentages[b] ? a : b
  );

  const strongest_domain = DOMAIN_KEYS.reduce((a, b) =>
    domain_percentages[a] >= domain_percentages[b] ? a : b
  );

  return {
    total_score,
    max_score,
    domain_scores,
    domain_max_scores: domain_max,
    grade,
    grade_label,
    grade_color,
    weakest_domain,
    strongest_domain,
    domain_percentages,
  };
}

export function defaultGradeTiers(): GradeTier[] {
  return [
    { id: '1', min_percent: 0, max_percent: 0.4, grade: 'critical', label: 'Critical — Your marketing system is leaking revenue at every stage.', color: '#ef4444' },
    { id: '2', min_percent: 0.41, max_percent: 0.6, grade: 'underperforming', label: 'Underperforming — You have pieces but major gaps are costing you patients.', color: '#f97316' },
    { id: '3', min_percent: 0.61, max_percent: 0.8, grade: 'functional', label: 'Functional — Your foundation works but you\'re leaving growth on the table.', color: '#eab308' },
    { id: '4', min_percent: 0.81, max_percent: 1, grade: 'strong', label: 'Strong — Your systems are solid. Marginal gains from advanced optimization.', color: '#22c55e' },
  ];
}
