import type { VSLConfig } from '@/types';

// Single source of truth for VSL copy. The public page falls back to these
// when the DB is unreachable; the admin seeds its editor from them.
export function defaultVSL(): VSLConfig {
  return {
    hero_badge: 'MED SPA GROWTH SYSTEM · FREE STRATEGY CALL',
    hero_headline: 'The System That Fills Med Spa Calendars — Without Buying More Leads.',
    hero_subheadline: 'Watch the video below to see exactly how it works.',
    hero_pill_1: 'No long-term contract',
    hero_pill_2: 'Pay only for booked patients',

    video_url: '',
    video_poster_url: '',
    video_overlay_title: 'Your video has already started',
    video_overlay_cta: 'Click to listen',

    hero_cta_text: 'Book My Free Strategy Call →',
    hero_tagline: 'Takes 60 seconds · No credit card · Free strategy call',
    form_headline: 'See if your clinic is a fit',

    proof_eyebrow: 'CLIENT RESULTS',
    proof_headline: 'Clinics Already Running This System',
    proof_disclaimer:
      'These are real outcomes from clients who followed our system as built. Growth depends on execution and market. Results will vary by clinic, offer, and effort.',

    t1_name: "Aman & Niel | Med Spa",
    t1_metric: '+$17.7K Collected',
    t1_subtitle: 'On Half The Ad Spend',
    t1_body:
      'Aman and Niel were spending $7,800 a month at a 1.26× return — busy, but barely profitable. We rebuilt their offer and follow-up system instead of raising budget. They cut spend to $4,060, hit a 4.43× ROAS, and booked 71 confirmed appointments in a single month.',
    t1_video_url: '',
    t1_poster_url: '',

    t2_name: 'Family-Run Med Spa | New York, NY',
    t2_metric: '4× New Patient Volume',
    t2_subtitle: 'At A Lower Monthly Spend',
    t2_body:
      'A family clinic doing roughly 8 new patients a month off $3,200 in ads. The leads were there — the booking process was losing them. We installed speed-to-lead follow-up and rewrote the intake flow. They now average 31 new patients a month on $2,800.',
    t2_video_url: '',
    t2_poster_url: '',

    t3_name: 'Aesthetic Clinic | Toronto, ON',
    t3_metric: '+$11K In 30 Days',
    t3_subtitle: 'From A Complete Cold Start',
    t3_body:
      'No paid advertising, no list, no funnel. We built the offer, the creative, and the booking system from scratch and launched in under two weeks. The clinic collected over $11,000 in booked treatments inside the first 30 days — their first five-figure month.',
    t3_video_url: '',
    t3_poster_url: '',

    how_eyebrow: 'HOW IT WORKS',
    how_headline: 'The System Behind',
    how_headline_accent: 'Fully Booked Clinics',
    how_subtext: 'Offer. Traffic. A follow-up engine that books them. All built to put patients in your chairs.',

    step1_label: 'STEP 1 — DIAGNOSE',
    step1_item1_title: 'Why Your Best Month And Worst Month Do Not Match',
    step1_item1_body:
      'Inconsistent bookings are not bad luck or a bad algorithm. They are the sign of a clinic that only performs when you are personally chasing every lead.',
    step1_item2_title: 'We Find Where The Money Is Actually Leaking',
    step1_item2_body:
      'We audit your offer, your ad creative, and your follow-up to find the exact point patients drop off. That audit becomes the blueprint for everything we build next.',
    step1_item3_title: '',
    step1_item3_body: '',

    step2_label: 'STEP 2 — INSTALL',
    step2_item1_title: 'An Offer That Sells Itself',
    step2_item1_body:
      'We rebuild your offer so booking is the obvious choice instead of a price comparison. Everything else in the system is built on top of this.',
    step2_item2_title: 'Creative Built For Vertical Mobile Traffic',
    step2_item2_body:
      'Scripts, hooks, and ad creative made for how people actually scroll — tested against your market, not recycled from another industry.',
    step2_item3_title: 'Speed-To-Lead Follow-Up That Never Sleeps',
    step2_item3_body:
      'Every lead gets contacted in minutes, not hours, by a system that runs whether your front desk is busy or closed.',

    step3_label: 'STEP 3 — SCALE',
    step3_item1_title: 'Full Visibility Into What Is Working',
    step3_item1_body:
      'You see exactly which ads produce booked patients, which do not, and what to fix next — so growth stops being a guess and becomes a number you can track.',
    step3_item2_title: 'Spend More Only Where It Pays',
    step3_item2_body:
      'Once the system proves itself at one budget, we scale spend against confirmed bookings instead of leads, so higher spend means more patients and not just more noise.',
    step3_item3_title: '',
    step3_item3_body: '',

    footer_company: 'Monotising',
    footer_disclaimer:
      'This site is not part of the Facebook or Meta Platforms, Inc. website. Additionally, this site is not endorsed by Meta in any way. FACEBOOK and INSTAGRAM are trademarks of Meta Platforms, Inc. Results shown are not typical and depend on your market, offer, and execution.',
    footer_privacy_url: '',
    footer_terms_url: '',

    calendly_url: '',
  };
}
