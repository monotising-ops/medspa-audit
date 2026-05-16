// ─── Enums ────────────────────────────────────────────────────────────────────

export type RevenueTier =
  | 'under_20k'
  | '20k_50k'
  | '50k_100k'
  | '100k_150k'
  | '150k_plus';

export type LocationCount = '1' | '2_3' | '4_plus';

export type Domain =
  | 'lead_gen'
  | 'speed_to_lead'
  | 'booking'
  | 'attribution'
  | 'growth'
  | 'intake';

export type InputType = 'single_select' | 'multi_select' | 'text';

export type QuestionType = 'intake' | 'scored';

export type Grade = 'critical' | 'underperforming' | 'functional' | 'strong';

export type LeadTag = 'hot' | 'warm' | 'cool' | 'contacted' | 'booked';

export type ContentType = 'analysis' | 'best_practice' | 'tip' | 'recommendation';

export type ConfigSection = 'cover' | 'gate' | 'results_cta' | 'settings' | 'creative_comparison';

export type ChartType = 'radar' | 'bar';

// ─── Question ─────────────────────────────────────────────────────────────────

export interface AnswerOption {
  id: string;
  label: string;
  score: number;
}

export interface Question {
  id: string;
  order: number;
  type: QuestionType;
  input_type: InputType;
  domain: Domain;
  question_text: string;
  placeholder: string | null;
  image_url: string | null;
  options: AnswerOption[];
  active: boolean;
}

// ─── Lead ─────────────────────────────────────────────────────────────────────

export interface AnswerRecord {
  question_id: string;
  selected_option_index: number | number[]; // number[] for multi_select
  score: number;
  question_text?: string;
  selected_label?: string | string[];
}

export interface DomainScores {
  lead_gen: number;
  speed_to_lead: number;
  booking: number;
  attribution: number;
  growth: number;
}

export interface Lead {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string | null;
  spa_name: string;
  revenue_tier: RevenueTier;
  location_count: LocationCount;
  top_treatments: string[];
  answers: AnswerRecord[];
  domain_scores: DomainScores;
  total_score: number;
  max_score: number;
  grade: Grade;
  tags: LeadTag[];
  notes: string;
}

// ─── Results Content ──────────────────────────────────────────────────────────

export interface ResultContent {
  id: string;
  domain: Domain;
  content_type: ContentType;
  score_range_min: number;
  score_range_max: number;
  revenue_tier: RevenueTier | null;
  body: string;
  image_url: string | null;
}

// ─── Site Config ──────────────────────────────────────────────────────────────

export interface SiteConfig {
  id: string;
  section: ConfigSection;
  key: string;
  value: string;
}

export interface CoverConfig {
  headline: string;
  subtext: string;
  cta_text: string;
  trust_line: string;
  background_image_url: string;
  background_color: string;
  logo_url?: string;
  // Landing page fields
  banner_text?: string;
  show_banner?: boolean;
  trust_bullets?: string;
  ticker_text?: string;
  cover_questions_count?: number;
  hero_image_url?: string; // replaces CSS card mockups when set
}

export interface GateConfig {
  headline: string;
  subtext: string;
  cta_text: string;
  privacy_text: string;
  gate_enabled: boolean;
  show_spa_name_field?: boolean;   // default true
  spa_name_field_label?: string;   // default "Med Spa Name"
  show_phone_field?: boolean;      // default false
  phone_field_label?: string;      // default "Phone Number"
}

export interface ResultsCTAConfig {
  headline: string;
  body: string;
  primary_cta_text: string;
  primary_cta_url: string;
  secondary_cta_text: string;
  video_url: string;
  case_study_text: string;
  show_video: boolean;
  show_case_study: boolean;
  show_locked_section?: boolean;
  locked_section_title?: string;
  locked_section_lock_text?: string;
  locked_section_subtitle?: string;
  locked_section_image_url?: string;
}

export interface CreativeComparisonConfig {
  headline: string;
  row1_left_label: string;
  row1_left_image_url: string;
  row1_right_label: string;
  row1_right_image_url: string;
  row2_left_label: string;
  row2_left_image_url: string;
  row2_right_label: string;
  row2_right_image_url: string;
  show_row2: boolean;
}

export interface AppSettings {
  assessment_active: boolean;
  webhook_url: string;
  accent_color: string;
  logo_url: string;
  admin_password_hash: string;
  chart_type: ChartType;
}

// ─── Grade Tier ───────────────────────────────────────────────────────────────

export interface GradeTier {
  id: string;
  min_percent: number;
  max_percent: number;
  label: string;
  color: string;
  grade: Grade;
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export interface ScoreResult {
  total_score: number;
  max_score: number;
  domain_scores: DomainScores;
  domain_max_scores: DomainScores;
  grade: Grade;
  grade_label: string;
  grade_color: string;
  weakest_domain: keyof DomainScores;
  strongest_domain: keyof DomainScores;
  domain_percentages: DomainScores;
}

// ─── Assessment State ─────────────────────────────────────────────────────────

export type AssessmentStage = 'cover' | 'questions' | 'gate' | 'results';

export interface AssessmentState {
  stage: AssessmentStage;
  currentQuestionIndex: number;
  answers: Map<string, AnswerRecord>;
  // Intake data
  spa_name: string;
  revenue_tier: RevenueTier | null;
  location_count: LocationCount | null;
  top_treatments: string[];
  // Gate data
  name: string;
  email: string;
  // Results
  leadId: string | null;
  scoreResult: ScoreResult | null;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface LeadFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  scoreMin?: number;
  scoreMax?: number;
  revenueTier?: RevenueTier;
  grade?: Grade;
  tag?: LeadTag;
}

export interface WebhookPayload {
  event: 'lead_submitted';
  timestamp: string;
  lead: {
    name: string;
    email: string;
    spa_name: string;
    revenue_tier: RevenueTier;
    location_count: LocationCount;
    top_treatments: string[];
    total_score: number;
    max_score: number;
    grade: Grade;
    grade_label: string;
    domain_scores: {
      [K in keyof DomainScores]: { score: number; max: number };
    };
    weakest_domain: keyof DomainScores;
    results_url: string;
  };
}

// ─── Domain display helpers ───────────────────────────────────────────────────

export const DOMAIN_LABELS: Record<keyof DomainScores, string> = {
  lead_gen: 'Lead Generation',
  speed_to_lead: 'Speed-to-Lead',
  booking: 'Booking & No-Shows',
  attribution: 'Revenue Attribution',
  growth: 'Growth Systems',
};

export const REVENUE_TIER_LABELS: Record<RevenueTier, string> = {
  under_20k: 'Under $20K/mo',
  '20k_50k': '$20K–$50K/mo',
  '50k_100k': '$50K–$100K/mo',
  '100k_150k': '$100K–$150K/mo',
  '150k_plus': '$150K+/mo',
};

export const TREATMENT_OPTIONS = [
  'Botox',
  'Lip Filler',
  'Laser Hair Removal',
  'Chemical Peels',
  'Microneedling',
  'Body Contouring',
  'IV Therapy',
  'PRP Facials',
  'CoolSculpting',
  'Hydrafacials',
  'Skin Tightening',
  'Other',
] as const;

export const GRADE_COLORS: Record<Grade, string> = {
  critical: '#ef4444',
  underperforming: '#f97316',
  functional: '#eab308',
  strong: '#22c55e',
};

// ─── Info Bank ────────────────────────────────────────────────────────────────

export interface InfoBankEntry {
  id: string;
  question_id: string;
  option_id: string;
  title: string;
  body: string;
  category: 'insight' | 'warning' | 'opportunity' | 'strength';
  created_at: string;
}
