'use client';

import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import CoverPage from '@/components/assessment/CoverPage';
import QuestionCard from '@/components/assessment/QuestionCard';
import ProgressBar from '@/components/assessment/ProgressBar';
import GateModal from '@/components/assessment/GateModal';
import ResultsPage from '@/components/assessment/ResultsPage';
import { supabase } from '@/lib/supabase';
import { computeScores, defaultGradeTiers } from '@/lib/scoring';

import type {
  Question,
  AnswerRecord,
  Lead,
  ScoreResult,
  ResultContent,
  CoverConfig,
  GateConfig,
  ResultsCTAConfig,
  GradeTier,
  RevenueTier,
  LocationCount,
  DomainScores,
} from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

type Stage = 'cover' | 'questions' | 'gate' | 'results';

// ─── Revenue-tier label → enum mapping ───────────────────────────────────────

function labelToRevenueTier(label: string): RevenueTier | null {
  const lower = label.toLowerCase();
  if (lower.includes('under') || lower.includes('20k') && lower.includes('below')) return 'under_20k';
  if (lower.includes('150') || lower.includes('150k+')) return '150k_plus';
  if (lower.includes('100') && (lower.includes('150') || lower.includes('100k'))) return '100k_150k';
  if (lower.includes('50') && lower.includes('100')) return '50k_100k';
  if (lower.includes('20') && lower.includes('50')) return '20k_50k';
  // Fallback: check raw enum values too
  const enumMap: Record<string, RevenueTier> = {
    under_20k: 'under_20k',
    '20k_50k': '20k_50k',
    '50k_100k': '50k_100k',
    '100k_150k': '100k_150k',
    '150k_plus': '150k_plus',
  };
  return enumMap[label] ?? null;
}

function labelToLocationCount(label: string): LocationCount | null {
  if (label === '1' || label.startsWith('1 ') || label.includes('one')) return '1';
  if (label.includes('4') || label.includes('five') || label.toLowerCase().includes('4+')) return '4_plus';
  if (label.includes('2') || label.includes('3') || label.includes('two') || label.includes('three')) return '2_3';
  const enumMap: Record<string, LocationCount> = {
    '1': '1',
    '2_3': '2_3',
    '4_plus': '4_plus',
  };
  return enumMap[label] ?? null;
}

// ─── Default configs ──────────────────────────────────────────────────────────

function defaultCoverConfig(): CoverConfig {
  return {
    headline: 'Is Your Med Spa Leaving Revenue on the Table?',
    subtext: 'Take our 5-minute assessment and get your personalized revenue recovery report.',
    cta_text: 'Start the Assessment →',
    trust_line: 'Free · No credit card · 5 minutes',
    background_image_url: '',
    background_color: '#050505',
  };
}

function defaultGateConfig(): GateConfig {
  return {
    headline: 'Your Results Are Ready',
    subtext: 'Enter your details to unlock your full personalized report.',
    cta_text: 'Unlock My Report →',
    privacy_text: 'We respect your privacy. No spam, ever.',
    gate_enabled: true,
  };
}

function defaultCtaConfig(): ResultsCTAConfig {
  return {
    headline: 'Ready to Fix These Gaps?',
    body: "We specialize in helping med spas build revenue systems that convert leads into loyal patients. Let's talk.",
    primary_cta_text: 'Book a Free Strategy Call',
    primary_cta_url: '',
    secondary_cta_text: '',
    video_url: '',
    case_study_text: '',
    show_video: false,
    show_case_study: false,
  };
}

// ─── Config parser ────────────────────────────────────────────────────────────

function parseConfigs(grouped: Record<string, Record<string, string>>) {
  const cover = grouped['cover'] ?? {};
  const gate = grouped['gate'] ?? {};
  const cta = grouped['results_cta'] ?? {};
  const settings = grouped['settings'] ?? {};

  const coverConfig: CoverConfig = {
    headline: cover.headline ?? defaultCoverConfig().headline,
    subtext: cover.subtext ?? defaultCoverConfig().subtext,
    cta_text: cover.cta_text ?? defaultCoverConfig().cta_text,
    trust_line: cover.trust_line ?? defaultCoverConfig().trust_line,
    background_image_url: cover.background_image_url ?? '',
    background_color: cover.background_color ?? '#050505',
  };

  const gateConfig: GateConfig = {
    headline: gate.headline ?? defaultGateConfig().headline,
    subtext: gate.subtext ?? defaultGateConfig().subtext,
    cta_text: gate.cta_text ?? defaultGateConfig().cta_text,
    privacy_text: gate.privacy_text ?? defaultGateConfig().privacy_text,
    gate_enabled: gate.gate_enabled !== 'false',
  };

  const ctaConfig: ResultsCTAConfig = {
    headline: cta.headline ?? defaultCtaConfig().headline,
    body: cta.body ?? defaultCtaConfig().body,
    primary_cta_text: cta.primary_cta_text ?? defaultCtaConfig().primary_cta_text,
    primary_cta_url: cta.primary_cta_url ?? '',
    secondary_cta_text: cta.secondary_cta_text ?? '',
    video_url: cta.video_url ?? '',
    case_study_text: cta.case_study_text ?? '',
    show_video: cta.show_video === 'true',
    show_case_study: cta.show_case_study === 'true',
  };

  const accentColor = settings.accent_color ?? '';
  const chartType: 'radar' | 'bar' =
    settings.chart_type === 'bar' ? 'bar' : 'radar';

  return { coverConfig, gateConfig, ctaConfig, accentColor, chartType };
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function FullScreenSpinner() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: '#050505' }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        aria-label="Loading"
        style={{ animation: 'spin 0.75s linear infinite' }}
      >
        <circle cx="20" cy="20" r="16" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
        <path
          d="M20 4a16 16 0 0 1 16 16"
          stroke="var(--accent-color, #3b82f6)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </svg>
    </div>
  );
}

// ─── Motion variants ──────────────────────────────────────────────────────────

const stageVariants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' as const } },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AssessmentPage() {
  // ── Stage ───────────────────────────────────────────────────────────────────
  const [stage, setStage] = useState<Stage>('cover');

  // ── Question flow ───────────────────────────────────────────────────────────
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, AnswerRecord>>(new Map());

  // ── Intake data ─────────────────────────────────────────────────────────────
  const [spaName, setSpaName] = useState('');
  const [revenueTier, setRevenueTier] = useState<RevenueTier | null>(null);
  const [locationCount, setLocationCount] = useState<LocationCount | null>(null);
  const [topTreatments, setTopTreatments] = useState<string[]>([]);

  // ── Gate ────────────────────────────────────────────────────────────────────
  const [gateName, setGateName] = useState('');
  const [gateEmail, setGateEmail] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  // ── Results ─────────────────────────────────────────────────────────────────
  const [submittedLead, setSubmittedLead] = useState<Lead | null>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);

  // ── Remote data ─────────────────────────────────────────────────────────────
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [contents, setContents] = useState<ResultContent[]>([]);
  const [coverConfig, setCoverConfig] = useState<CoverConfig>(defaultCoverConfig());
  const [gateConfig, setGateConfig] = useState<GateConfig>(defaultGateConfig());
  const [ctaConfig, setCtaConfig] = useState<ResultsCTAConfig>(defaultCtaConfig());
  const [gradeTiers, setGradeTiers] = useState<GradeTier[]>(defaultGradeTiers());
  const [chartType, setChartType] = useState<'radar' | 'bar'>('radar');
  const [accentColor, setAccentColor] = useState('');

  // ── On mount: fetch everything ───────────────────────────────────────────────
  useEffect(() => {
    async function bootstrap() {
      try {
        const [questionsRes, configRes, { data: contentsData }] = await Promise.all([
          fetch('/api/questions').then((r) => r.json()),
          fetch('/api/config').then((r) => r.json()),
          supabase.from('result_contents').select('*'),
        ]);

        if (Array.isArray(questionsRes)) {
          setQuestions(questionsRes);
        }

        if (configRes.configs) {
          const parsed = parseConfigs(configRes.configs as Record<string, Record<string, string>>);
          setCoverConfig(parsed.coverConfig);
          setGateConfig(parsed.gateConfig);
          setCtaConfig(parsed.ctaConfig);
          setChartType(parsed.chartType);
          if (parsed.accentColor) {
            setAccentColor(parsed.accentColor);
            document.documentElement.style.setProperty('--accent-color', parsed.accentColor);
          }
        }

        if (configRes.gradeTiers && Array.isArray(configRes.gradeTiers) && configRes.gradeTiers.length > 0) {
          setGradeTiers(configRes.gradeTiers);
        }

        if (contentsData) {
          setContents(contentsData as ResultContent[]);
        }
      } catch (err) {
        console.error('Assessment bootstrap error:', err);
      } finally {
        setLoadingQuestions(false);
      }
    }

    bootstrap();
  }, []);

  // ── Apply accentColor to CSS variable when it changes ───────────────────────
  useEffect(() => {
    if (accentColor) {
      document.documentElement.style.setProperty('--accent-color', accentColor);
    }
  }, [accentColor]);

  // ── Intake question detection helpers ────────────────────────────────────────

  // Detect intake question order positions (0-indexed within intake questions)
  function getIntakeQuestionOrder(question: Question): number {
    const intakeQuestions = questions
      .filter((q) => q.type === 'intake')
      .sort((a, b) => a.order - b.order);
    return intakeQuestions.findIndex((q) => q.id === question.id);
  }

  // ── Handle answer submission ─────────────────────────────────────────────────
  const handleAnswer = useCallback(
    (optionIndex: number | number[], score: number) => {
      const question = questions[currentQuestionIndex];
      if (!question) return;

      // Build labels
      let selectedLabel: string | string[] | undefined;
      if (question.input_type === 'multi_select' && Array.isArray(optionIndex)) {
        selectedLabel = optionIndex.map((i) => question.options[i]?.label ?? '');
      } else if (typeof optionIndex === 'number' && optionIndex >= 0) {
        selectedLabel = question.options[optionIndex]?.label;
      }

      const record: AnswerRecord = {
        question_id: question.id,
        selected_option_index: optionIndex,
        score,
        question_text: question.question_text,
        selected_label: selectedLabel,
      };

      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(question.id, record);
        return next;
      });

      // Handle intake questions
      if (question.type === 'intake') {
        const intakeOrder = getIntakeQuestionOrder(question);

        if (intakeOrder === 1 && typeof optionIndex === 'number' && optionIndex >= 0) {
          // Q2: revenue tier
          const label = question.options[optionIndex]?.label ?? '';
          const tier = labelToRevenueTier(label);
          if (tier) setRevenueTier(tier);
        } else if (intakeOrder === 2 && typeof optionIndex === 'number' && optionIndex >= 0) {
          // Q3: location count
          const label = question.options[optionIndex]?.label ?? '';
          const loc = labelToLocationCount(label);
          if (loc) setLocationCount(loc);
        } else if (intakeOrder === 3 && Array.isArray(optionIndex)) {
          // Q4: top treatments (multi-select)
          const labels = optionIndex.map((i) => question.options[i]?.label ?? '').filter(Boolean);
          setTopTreatments(labels);
        }
      }

      // Advance
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex >= questions.length) {
        // Compute scores then go to gate (or results if gate disabled)
        const updatedAnswers = new Map(answers);
        updatedAnswers.set(question.id, record);
        const computed = computeScores(questions, updatedAnswers, gradeTiers);
        setScoreResult(computed);

        if (!gateConfig.gate_enabled) {
          // Skip gate — submit a minimal lead immediately
          submitLead('', '', spaName || 'Your Spa', computed, updatedAnswers).then(() => {
            setStage('results');
          });
        } else {
          setStage('gate');
        }
      } else {
        setCurrentQuestionIndex(nextIndex);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questions, currentQuestionIndex, answers, gradeTiers, gateConfig, spaName],
  );

  // ── Handle text answer (intake Q1 — spa name) ────────────────────────────────
  const handleTextAnswer = useCallback(
    (text: string) => {
      const question = questions[currentQuestionIndex];
      if (!question) return;

      const intakeOrder = getIntakeQuestionOrder(question);
      // Q1 of intake = spa name
      if (intakeOrder === 0) {
        setSpaName(text);
      }

      // Also store in answers map with text as label
      const record: AnswerRecord = {
        question_id: question.id,
        selected_option_index: -1,
        score: 0,
        question_text: question.question_text,
        selected_label: text,
      };
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(question.id, record);
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questions, currentQuestionIndex],
  );

  // ── Submit lead to API ────────────────────────────────────────────────────────
  async function submitLead(
    name: string,
    email: string,
    finalSpaName: string,
    computed: ScoreResult,
    finalAnswers: Map<string, AnswerRecord>,
  ): Promise<void> {
    const answersArray = Array.from(finalAnswers.values());

    const domainMax = computed.domain_max_scores;

    const payload = {
      name,
      email,
      spa_name: finalSpaName,
      revenue_tier: revenueTier ?? 'under_20k',
      location_count: locationCount ?? '1',
      top_treatments: topTreatments,
      answers: answersArray,
      domain_scores: computed.domain_scores as unknown as Record<string, number>,
      total_score: computed.total_score,
      max_score: computed.max_score,
      grade: computed.grade,
      tags: [],
      notes: '',
      // Extra fields consumed by the webhook builder
      grade_label: computed.grade_label,
      domain_max: domainMax as unknown as Record<string, number>,
      weakest_domain: computed.weakest_domain,
    };

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('Failed to submit lead:', await res.text());
      return;
    }

    const json = await res.json();

    // Build a Lead-shaped object for local display
    const lead: Lead = {
      id: json.id ?? '',
      created_at: new Date().toISOString(),
      name,
      email,
      spa_name: finalSpaName,
      revenue_tier: revenueTier ?? 'under_20k',
      location_count: locationCount ?? '1',
      top_treatments: topTreatments,
      answers: answersArray,
      domain_scores: computed.domain_scores as DomainScores,
      total_score: computed.total_score,
      max_score: computed.max_score,
      grade: computed.grade,
      tags: [],
      notes: '',
    };

    setSubmittedLead(lead);
    setGateName(name);
    setGateEmail(email);
  }

  // ── Gate unlock handler ──────────────────────────────────────────────────────
  const handleUnlock = useCallback(
    async (name: string, email: string, finalSpaName: string) => {
      if (!scoreResult) return;

      await submitLead(name, email, finalSpaName || spaName || 'Your Spa', scoreResult, answers);

      setIsRevealing(true);
      setTimeout(() => {
        setIsRevealed(true);
        setStage('results');
      }, 800);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scoreResult, spaName, answers, revenueTier, locationCount, topTreatments],
  );

  // ── Back handler ─────────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    setCurrentQuestionIndex((i) => Math.max(0, i - 1));
  }, []);

  // ── Loading guard ────────────────────────────────────────────────────────────
  if (loadingQuestions) {
    return <FullScreenSpinner />;
  }

  const currentQuestion = questions[currentQuestionIndex];

  // ── Build a preview lead for the gate backdrop ────────────────────────────────
  const previewLead: Lead = {
    id: '',
    created_at: new Date().toISOString(),
    name: gateName,
    email: gateEmail,
    spa_name: spaName || 'Your Spa',
    revenue_tier: revenueTier ?? 'under_20k',
    location_count: locationCount ?? '1',
    top_treatments: topTreatments,
    answers: Array.from(answers.values()),
    domain_scores: scoreResult?.domain_scores ?? {
      lead_gen: 0,
      speed_to_lead: 0,
      booking: 0,
      attribution: 0,
      growth: 0,
    },
    total_score: scoreResult?.total_score ?? 0,
    max_score: scoreResult?.max_score ?? 0,
    grade: scoreResult?.grade ?? 'critical',
    tags: [],
    notes: '',
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: '#050505', color: '#f5f5f5' }}
    >
      <AnimatePresence mode="wait">
        {stage === 'cover' && (
          <motion.div
            key="cover"
            variants={stageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CoverPage
              config={coverConfig}
              onStart={() => setStage('questions')}
            />
          </motion.div>
        )}

        {stage === 'questions' && currentQuestion && (
          <motion.div
            key="questions"
            variants={stageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen flex flex-col"
            style={{ backgroundColor: '#050505' }}
          >
            {/* Fixed progress bar */}
            <div
              className="fixed top-0 left-0 right-0 z-50"
              style={{ backgroundColor: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(8px)' }}
            >
              <div className="max-w-[480px] mx-auto">
                <ProgressBar
                  current={currentQuestionIndex + 1}
                  total={questions.length}
                />
              </div>
            </div>

            {/* Question content */}
            <div className="flex flex-1 items-center justify-center px-4 pt-20 pb-8">
              <div className="w-full max-w-[480px]">
                <QuestionCard
                  question={currentQuestion}
                  onAnswer={handleAnswer}
                  onBack={handleBack}
                  currentIndex={currentQuestionIndex}
                  totalQuestions={questions.length}
                  existingAnswer={answers.get(currentQuestion.id)}
                  onTextAnswer={handleTextAnswer}
                />
              </div>
            </div>
          </motion.div>
        )}

        {stage === 'gate' && scoreResult && (
          <motion.div
            key="gate"
            variants={stageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <GateModal
              config={gateConfig}
              prefillSpaName={spaName}
              isRevealing={isRevealing}
              isRevealed={isRevealed}
              onUnlock={handleUnlock}
              resultsComponent={
                <ResultsPage
                  lead={previewLead}
                  scoreResult={scoreResult}
                  contents={contents}
                  coverConfig={coverConfig}
                  ctaConfig={ctaConfig}
                  chartType={chartType}
                />
              }
            />
          </motion.div>
        )}

        {stage === 'results' && scoreResult && (submittedLead ?? previewLead) && (
          <motion.div
            key="results"
            variants={stageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ResultsPage
              lead={submittedLead ?? previewLead}
              scoreResult={scoreResult}
              contents={contents}
              coverConfig={coverConfig}
              ctaConfig={ctaConfig}
              chartType={chartType}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
