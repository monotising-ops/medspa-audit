'use client';

import ScoreHero from '@/components/assessment/ScoreHero';
import DomainChart from '@/components/assessment/DomainChart';
import DomainAnalysis from '@/components/assessment/DomainAnalysis';
import SystemComparison from '@/components/assessment/SystemComparison';
import Recommendations from '@/components/assessment/Recommendations';
import ResultsCTA from '@/components/assessment/ResultsCTA';
import { findContent, renderTemplate, buildPersonalizationVars, domainPctToTier, getDomainInsightText } from '@/lib/personalization';
import { DOMAIN_LABELS } from '@/types';
import type {
  Lead,
  ScoreResult,
  ResultContent,
  CoverConfig,
  ResultsCTAConfig,
  DomainScores,
} from '@/types';

const DOMAIN_KEYS = [
  'lead_gen',
  'speed_to_lead',
  'booking',
  'attribution',
  'growth',
] as const;

interface ComparisonImages {
  current?: string;
  optimized?: string;
}

interface ResultsPageProps {
  lead: Lead;
  scoreResult: ScoreResult;
  contents: ResultContent[];
  coverConfig: CoverConfig;
  ctaConfig: ResultsCTAConfig;
  chartType: 'radar' | 'bar';
  comparisonImages?: ComparisonImages[];
}

function DownloadButton({ spaName }: { spaName: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: 600,
        border: '1px solid rgba(212,168,71,0.4)',
        background: 'rgba(212,168,71,0.08)',
        color: '#D4A847',
        cursor: 'pointer',
        fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(212,168,71,0.16)';
        e.currentTarget.style.borderColor = '#D4A847';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(212,168,71,0.08)';
        e.currentTarget.style.borderColor = 'rgba(212,168,71,0.4)';
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Download Report
    </button>
  );
}

export default function ResultsPage({
  lead,
  scoreResult,
  contents,
  ctaConfig,
  chartType,
  comparisonImages,
}: ResultsPageProps) {
  const { domain_scores, domain_max_scores, domain_percentages, grade } = scoreResult;
  const personalizationVars = buildPersonalizationVars(lead.spa_name, lead.top_treatments);

  // ── Comparison images: use first entry if present ────────────────────────────
  const compImages = comparisonImages?.[0];
  const currentImageUrl = compImages?.current ?? null;
  const optimizedImageUrl = compImages?.optimized ?? null;

  // ── Build recommendations ────────────────────────────────────────────────────
  // Sort domains weakest-first by percentage
  const sortedDomains = [...DOMAIN_KEYS].sort(
    (a, b) => domain_percentages[a] - domain_percentages[b],
  );

  const topDomains = sortedDomains.slice(0, 5);

  const recommendations = topDomains
    .map((domain, idx) => {
      const pct = domain_percentages[domain];
      // Derive performance tier from how they scored on ALL questions for this domain
      const performanceTier = domainPctToTier(pct);

      // 1. Try performance-tier-specific DB content
      let content = findContent(contents, domain, 'recommendation', domain_scores[domain], performanceTier);
      // 2. Fall back to any null-tier DB content in range
      if (!content) content = findContent(contents, domain, 'recommendation', domain_scores[domain], null);

      let body: string;
      let headline: string;

      if (content) {
        body = renderTemplate(content.body, personalizationVars);
        headline = body.split('\n').find((l) => l.trim().length > 0) ?? body;
      } else {
        // 3. Hardcoded fallback — still score-based, uses domain percentage
        body = getDomainInsightText(domain, pct, []);
        headline = body.split('\n').find((l) => l.trim().length > 0) ?? body;
      }

      return {
        domain: domain as keyof DomainScores,
        domainLabel: DOMAIN_LABELS[domain],
        headline: headline.trim(),
        body: body.trim(),
        priority: idx + 1,
      };
    })
    .slice(0, 5);

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#050505', color: '#f5f5f5' }}>
      {/* ── Score Hero ──────────────────────────────────────────────────────── */}
      <ScoreHero scoreResult={scoreResult} spaName={lead.spa_name} />

      {/* ── Domain Chart ────────────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-xl font-bold mb-6"
            style={{
              fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
              color: '#f5f5f5',
            }}
          >
            Your Score Breakdown
          </h2>
          <DomainChart
            domainScores={domain_scores}
            domainMaxScores={domain_max_scores}
            chartType={chartType}
            domainPercentages={domain_percentages}
          />
        </div>
      </section>

      {/* ── Domain Analysis Cards ────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {DOMAIN_KEYS.map((domain) => {
            const domainScore = domain_scores[domain];
            const maxScore = domain_max_scores[domain];
            const pct = domain_percentages[domain];

            const analysisContent = findContent(
              contents,
              domain,
              'analysis',
              domainScore,
              lead.revenue_tier,
            );
            const bestPracticeContent = findContent(
              contents,
              domain,
              'best_practice',
              domainScore,
              lead.revenue_tier,
            );
            const tipContent = findContent(
              contents,
              domain,
              'tip',
              domainScore,
              lead.revenue_tier,
            );

            const analysisText = analysisContent
              ? renderTemplate(analysisContent.body, personalizationVars)
              : '';
            const bestPracticeText = bestPracticeContent
              ? renderTemplate(bestPracticeContent.body, personalizationVars)
              : '';
            const tipText = tipContent
              ? renderTemplate(tipContent.body, personalizationVars)
              : '';

            // Pull image from whichever content entry has one
            const imageUrl =
              analysisContent?.image_url ??
              bestPracticeContent?.image_url ??
              tipContent?.image_url ??
              null;

            return (
              <DomainAnalysis
                key={domain}
                domain={domain}
                domainScore={domainScore}
                maxScore={maxScore}
                pct={pct}
                analysisText={analysisText}
                bestPracticeText={bestPracticeText}
                tipText={tipText}
                imageUrl={imageUrl}
                domainLabel={DOMAIN_LABELS[domain]}
              />
            );
          })}
        </div>
      </section>

      {/* ── System Comparison ───────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <SystemComparison
            currentImageUrl={currentImageUrl}
            optimizedImageUrl={optimizedImageUrl}
            grade={grade}
          />
        </div>
      </section>

      {/* ── Recommendations / Action Plan ───────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-xl font-bold mb-6"
            style={{
              fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
              color: '#f5f5f5',
            }}
          >
            Your Action Plan
          </h2>
          <Recommendations recommendations={recommendations} />
        </div>
      </section>

      {/* ── Download button ──────────────────────────────────────────────────── */}
      <section className="py-6 px-4 no-print">
        <div className="max-w-3xl mx-auto flex justify-center">
          <DownloadButton spaName={lead.spa_name} />
        </div>
      </section>

      {/* ── Results CTA ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 no-print">
        <div className="max-w-3xl mx-auto">
          <ResultsCTA config={ctaConfig} spaName={lead.spa_name} />
        </div>
      </section>
    </div>
  );
}
