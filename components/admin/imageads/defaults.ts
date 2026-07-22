// ═══════════════════════════════════════════════════════════════
// Image Ads Guide — admin-side defaults
// Mirrors the creative-audit app's built-in content so the editors
// show real current values before anything is saved to the DB.
// Saving writes these (as edited) into site_configs under ia_* sections,
// which the creative-audit app then reads and merges over its own defaults.
// ═══════════════════════════════════════════════════════════════

export interface IAOption { id: string; label: string; score: number }
export interface IAQuestion {
  id: string;
  order: number;
  type: 'intake' | 'scored';
  input_type: 'single_select' | 'text';
  domain: string | null;
  question_text: string;
  helper?: string;
  placeholder?: string;
  optional?: boolean;
  options: IAOption[];
}

export const IA_LANDING_DEFAULT = {
  headline: 'Find out why your ads are attracting price shoppers instead of patients.',
  subhead:
    'Answer 5 questions about your ads. Get a free breakdown of what’s costing you bookings — and the exact fixes, ranked by impact.',
  meta: 'Takes under 90 seconds. Built specifically for med spas.',
  trust:
    'I’ve spent 2 years running ads exclusively for med spas. This is the same first-pass diagnostic I run on every account.',
  cta: 'Start the scorecard',
};

export const IA_GATE_DEFAULT = {
  headline: 'Your creative score is ready.',
  subhead: 'Enter your details to unlock your full breakdown and the ranked fixes.',
  cta: 'Unlock my breakdown',
};

export const IA_CTA_DEFAULT = {
  headline: 'Want me to look at your actual ads and tell you what I’d change?',
  body: 'I work with med spas exclusively. Book a 15-minute call and I’ll walk your account with you.',
  primary_text: 'Book a 15-minute call',
  primary_url: 'https://calendly.com/monotising/15min',
  secondary: 'Or just reply to the email I sent — I read every one.',
};

export const IA_RESULTS_DEFAULT = {
  grade_critical: 'Your ads are attracting the wrong patients — and it’s costing you on every click.',
  grade_leaking: 'Your ads work, but the offer and design are filtering out your best patients.',
  grade_functional: 'Solid foundation. You’re leaving real money on the table in framing and testing.',
  grade_strong: 'Your creative is ahead of most clinics. Gains from here come from volume and testing depth.',
  price_headline: 'Your ad is doing exactly what you asked it to do. That’s the problem.',
  price_body:
    'When the first thing a patient sees is a price, you attract the person shopping five clinics for the cheapest needle. They book once, they don’t rebook, and they never buy the package. You didn’t get a bad patient — you ran an ad that recruited one.',
  attention_title: 'Now count what’s on your ad.',
  attention_body:
    'Open your last ad and count how many things are asking for attention: phone number, logo, price, CTA button, website URL, address, social handles, multiple lines of copy.',
};

export const IA_PROOF_DEFAULT = [
  { value: '$17,720', label: 'generated in 2.5 months' },
  { value: '$4,000', label: 'ad spend' },
  { value: '4.43x', label: 'ROAS' },
  { value: '231', label: 'leads' },
  { value: '8', label: 'campaigns, treatment-segmented' },
];

export const IA_IMAGES_DEFAULT = {
  before_url: '',
  after_url: '',
  attention_cluttered_url: '',
  attention_clean_url: '',
};

export const IA_QUESTIONS_DEFAULT: IAQuestion[] = [
  { id: 'i-1', order: 0, type: 'intake', input_type: 'text', domain: null, question_text: 'What’s your med spa’s name?', placeholder: 'e.g. Glow Aesthetics', options: [] },
  { id: 'i-2', order: 1, type: 'intake', input_type: 'text', domain: null, question_text: 'Where do you struggle most right now?', helper: 'Say it however you’d say it out loud — this is the part I actually read first.', placeholder: 'e.g. no-show rates, lead quality / price shoppers, getting patients to return, low booking rate, ads not converting…', options: [] },
  { id: 'i-3', order: 2, type: 'intake', input_type: 'text', domain: null, optional: true, question_text: 'Want me to look at your actual ads?', helper: 'Drop your Instagram handle and I’ll pull them up. Totally optional.', placeholder: '@yourhandle', options: [] },
  { id: 'q1', order: 3, type: 'scored', input_type: 'single_select', domain: 'offer_framing', question_text: 'What’s the main headline on most of your ads?', options: [
    { id: 'q1_a', label: 'The price or discount — “$99 Botox,” “50% Off Laser”', score: 1 },
    { id: 'q1_b', label: 'The treatment name — “Microneedling Available Now”', score: 2 },
    { id: 'q1_c', label: 'The result the patient gets — “Smoother skin in one session”', score: 3 },
    { id: 'q1_d', label: 'The result, with the offer sitting second as a new-patient perk', score: 4 },
  ] },
  { id: 'q2', order: 4, type: 'scored', input_type: 'single_select', domain: 'offer_framing', question_text: 'How do you frame your discounts?', options: [
    { id: 'q2_a', label: 'Straight percentage or dollar off, front and centre', score: 1 },
    { id: 'q2_b', label: 'Seasonal or holiday sale framing', score: 2 },
    { id: 'q2_c', label: 'New-patient offer or first-visit pricing', score: 3 },
    { id: 'q2_d', label: 'Framed as a perk with original value shown alongside it (strikethrough pricing)', score: 4 },
  ] },
  { id: 'q3', order: 5, type: 'scored', input_type: 'single_select', domain: 'urgency', question_text: 'What does your urgency line say?', options: [
    { id: 'q3_a', label: 'Nothing — there’s no urgency in the ad', score: 1 },
    { id: 'q3_b', label: '“Limited time only” / “Book now” / “Don’t miss out”', score: 1 },
    { id: 'q3_c', label: 'A general timeframe like “this month”', score: 3 },
    { id: 'q3_d', label: 'A specific, real deadline with a date or day', score: 4 },
  ] },
  { id: 'q4', order: 6, type: 'scored', input_type: 'single_select', domain: 'imagery', question_text: 'What imagery are you using?', options: [
    { id: 'q4_a', label: 'Stock photos or graphics', score: 1 },
    { id: 'q4_b', label: 'Equipment or product shots', score: 2 },
    { id: 'q4_c', label: 'Some real client photos, inconsistently', score: 3 },
    { id: 'q4_d', label: 'Real before-and-afters or real treatment moments, consistently', score: 4 },
  ] },
  { id: 'q5', order: 7, type: 'scored', input_type: 'single_select', domain: 'testing', question_text: 'When you change an ad, what usually changes?', options: [
    { id: 'q5_a', label: 'The price or the discount', score: 1 },
    { id: 'q5_b', label: 'The image, keeping the same copy', score: 2 },
    { id: 'q5_c', label: 'The headline or hook', score: 3 },
    { id: 'q5_d', label: 'The entire angle — different pain point, different promise, different visual', score: 4 },
  ] },
];

// Merge saved section values over defaults.
export function withDefaults<T extends Record<string, string>>(base: T, saved?: Record<string, string>): T {
  if (!saved) return base;
  const out = { ...base };
  for (const k of Object.keys(base) as (keyof T)[]) {
    const v = saved[k as string];
    if (typeof v === 'string' && v.length > 0) out[k] = v as T[keyof T];
  }
  return out;
}
