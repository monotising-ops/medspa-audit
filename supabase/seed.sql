-- ═══════════════════════════════════════════════════════════════
-- Seed Data — run AFTER schema.sql
-- ═══════════════════════════════════════════════════════════════

-- ─── Grade Tiers ──────────────────────────────────────────────
insert into grade_tiers (min_percent, max_percent, grade, label, color) values
  (0,    0.40, 'critical',       'Critical — Your marketing system is leaking revenue at every stage.',          '#ef4444'),
  (0.41, 0.60, 'underperforming','Underperforming — You have pieces but major gaps are costing you patients.', '#f97316'),
  (0.61, 0.80, 'functional',     'Functional — Your foundation works but you''re leaving growth on the table.','#eab308'),
  (0.81, 1.00, 'strong',         'Strong — Your systems are solid. Marginal gains from advanced optimization.', '#22c55e');

-- ─── Questions — Intake ───────────────────────────────────────
insert into questions ("order", type, input_type, domain, question_text, options) values
(1, 'intake', 'text', 'intake', 'What''s your med spa''s name?', '[]'),
(2, 'intake', 'single_select', 'intake', 'What''s your monthly revenue range?', '[
  {"id":"r1","label":"Under $20K","score":0},
  {"id":"r2","label":"$20K–$50K","score":0},
  {"id":"r3","label":"$50K–$100K","score":0},
  {"id":"r4","label":"$100K–$150K","score":0},
  {"id":"r5","label":"$150K+","score":0}
]'),
(3, 'intake', 'single_select', 'intake', 'How many locations do you operate?', '[
  {"id":"l1","label":"1","score":0},
  {"id":"l2","label":"2–3","score":0},
  {"id":"l3","label":"4+","score":0}
]'),
(4, 'intake', 'multi_select', 'intake', 'What are your top 3 treatments by revenue?', '[
  {"id":"t1","label":"Botox","score":0},
  {"id":"t2","label":"Lip Filler","score":0},
  {"id":"t3","label":"Laser Hair Removal","score":0},
  {"id":"t4","label":"Chemical Peels","score":0},
  {"id":"t5","label":"Microneedling","score":0},
  {"id":"t6","label":"Body Contouring","score":0},
  {"id":"t7","label":"IV Therapy","score":0},
  {"id":"t8","label":"PRP Facials","score":0},
  {"id":"t9","label":"CoolSculpting","score":0},
  {"id":"t10","label":"Hydrafacials","score":0},
  {"id":"t11","label":"Skin Tightening","score":0},
  {"id":"t12","label":"Other","score":0}
]');

-- ─── Questions — Lead Generation ──────────────────────────────
insert into questions ("order", type, input_type, domain, question_text, options) values
(5, 'scored', 'single_select', 'lead_gen', 'How are you currently generating new patient leads?', '[
  {"id":"a1a","label":"We''re not actively doing any marketing right now","score":1},
  {"id":"a1b","label":"We boost posts on Instagram/Facebook occasionally","score":1},
  {"id":"a1c","label":"We run ads but it''s one general campaign for the whole spa","score":2},
  {"id":"a1d","label":"We run treatment-specific ad campaigns with different creatives","score":4}
]'),
(6, 'scored', 'single_select', 'lead_gen', 'How often do you refresh your ad creatives?', '[
  {"id":"a2a","label":"We''ve been running the same ad for months","score":1},
  {"id":"a2b","label":"Every few months when we remember","score":2},
  {"id":"a2c","label":"Monthly","score":3},
  {"id":"a2d","label":"Every 2 weeks or more frequently","score":4}
]'),
(7, 'scored', 'single_select', 'lead_gen', 'Are you retargeting people who clicked your ads but didn''t book?', '[
  {"id":"a3a","label":"I don''t know what retargeting is","score":1},
  {"id":"a3b","label":"No, we''re not doing that","score":1},
  {"id":"a3c","label":"I think so, but I''m not sure how it''s set up","score":2},
  {"id":"a3d","label":"Yes, we have specific retargeting campaigns","score":4}
]');

-- ─── Questions — Speed-to-Lead ────────────────────────────────
insert into questions ("order", type, input_type, domain, question_text, options) values
(8, 'scored', 'single_select', 'speed_to_lead', 'When a lead comes in from an ad, how quickly does someone contact them?', '[
  {"id":"b1a","label":"Within a few days","score":1},
  {"id":"b1b","label":"Within a few hours","score":1},
  {"id":"b1c","label":"Within 30 minutes","score":2},
  {"id":"b1d","label":"Within 5 minutes, every time","score":4}
]'),
(9, 'scored', 'single_select', 'speed_to_lead', 'Who handles lead follow-up at your clinic?', '[
  {"id":"b2a","label":"Nobody specific — whoever''s available","score":1},
  {"id":"b2b","label":"The front desk, in between other tasks","score":2},
  {"id":"b2c","label":"A dedicated staff member","score":3},
  {"id":"b2d","label":"A trained booking specialist whose only job is converting leads","score":4}
]'),
(10, 'scored', 'single_select', 'speed_to_lead', 'If a lead doesn''t answer the first call, what happens?', '[
  {"id":"b3a","label":"Nothing — we move on","score":1},
  {"id":"b3b","label":"We might try once more if we remember","score":1},
  {"id":"b3c","label":"We have a basic follow-up (a text or email)","score":2},
  {"id":"b3d","label":"Multi-touch sequence: calls, texts, emails over several days","score":4}
]');

-- ─── Questions — Booking ──────────────────────────────────────
insert into questions ("order", type, input_type, domain, question_text, options) values
(11, 'scored', 'single_select', 'booking', 'What''s your approximate no-show rate?', '[
  {"id":"c1a","label":"Over 30%","score":1},
  {"id":"c1b","label":"20–30%","score":2},
  {"id":"c1c","label":"10–20%","score":3},
  {"id":"c1d","label":"Under 10%","score":4}
]'),
(12, 'scored', 'single_select', 'booking', 'Do you have automated appointment reminders?', '[
  {"id":"c2a","label":"No reminders at all","score":1},
  {"id":"c2b","label":"We send an email reminder","score":2},
  {"id":"c2c","label":"Text reminder 24 hours before","score":3},
  {"id":"c2d","label":"Confirmation + 24hr reminder + 1hr reminder via text","score":4}
]');

-- ─── Questions — Revenue Attribution ─────────────────────────
insert into questions ("order", type, input_type, domain, question_text, options) values
(13, 'scored', 'single_select', 'attribution', 'Can you tell exactly how much revenue came from your ads last month?', '[
  {"id":"d1a","label":"No, I have no idea","score":1},
  {"id":"d1b","label":"I have a rough sense but can''t prove it","score":2},
  {"id":"d1c","label":"My agency gives me a cost-per-lead number","score":2},
  {"id":"d1d","label":"Yes — I can track from ad click to booked appointment to revenue","score":4}
]'),
(14, 'scored', 'single_select', 'attribution', 'Do you know which treatments are most profitable to advertise?', '[
  {"id":"d2a","label":"No","score":1},
  {"id":"d2b","label":"I have a guess but no data","score":2},
  {"id":"d2c","label":"Yes, based on what my agency told me","score":2},
  {"id":"d2d","label":"Yes, based on full revenue attribution per treatment","score":4}
]');

-- ─── Questions — Growth Systems ───────────────────────────────
insert into questions ("order", type, input_type, domain, question_text, options) values
(15, 'scored', 'single_select', 'growth', 'Do you have a system for turning first-time patients into repeat patients?', '[
  {"id":"e1a","label":"No — we hope they come back","score":1},
  {"id":"e1b","label":"We send a follow-up email sometimes","score":2},
  {"id":"e1c","label":"We offer loyalty discounts or memberships","score":3},
  {"id":"e1d","label":"Structured retention program with automated touchpoints","score":4}
]');

-- ─── Site Config — Cover ──────────────────────────────────────
insert into site_configs (section, key, value) values
('cover', 'headline',          'Find Out Exactly Where Your Med Spa Is Leaking Revenue'),
('cover', 'subtext',           'Answer 11 quick questions. Get a personalized growth score, see where your bookings are breaking down, and get a strategy built for your spa — free.'),
('cover', 'cta_text',          'Get My Free Growth Audit →'),
('cover', 'trust_line',        'Takes 3 minutes · Used by 200+ med spas · Free forever'),
('cover', 'background_image_url', ''),
('cover', 'background_color',  '#050505');

-- ─── Site Config — Gate ───────────────────────────────────────
insert into site_configs (section, key, value) values
('gate', 'headline',    'Your Growth Score Is Ready'),
('gate', 'subtext',     'Enter your details below to unlock your full personalized results, strategy recommendations, and system breakdown.'),
('gate', 'cta_text',    'Reveal My Results →'),
('gate', 'privacy_text','No spam. Just your results + one follow-up with your strategy breakdown.'),
('gate', 'gate_enabled','true');

-- ─── Site Config — Results CTA ────────────────────────────────
insert into site_configs (section, key, value) values
('results_cta', 'headline',          'Want us to build this system for your spa?'),
('results_cta', 'body',              'We specialize in building the exact revenue infrastructure your audit just diagnosed — ads, speed-to-lead, booking automation, and full attribution tracking. Most clients see positive ROI within 60 days.'),
('results_cta', 'primary_cta_text',  'Book a Free Strategy Call →'),
('results_cta', 'primary_cta_url',   'https://calendly.com/yourlink'),
('results_cta', 'secondary_cta_text','Or just reply to the email we sent you — I read every one.'),
('results_cta', 'video_url',         ''),
('results_cta', 'case_study_text',   'We built this for Glow Med Spa and generated $17,720 in 2.5 months on $4,000 ad spend (4.43x ROAS).'),
('results_cta', 'show_video',        'false'),
('results_cta', 'show_case_study',   'true');

-- ─── Site Config — Settings ───────────────────────────────────
insert into site_configs (section, key, value) values
('settings', 'assessment_active', 'true'),
('settings', 'webhook_url',       ''),
('settings', 'accent_color',      '#3b82f6'),
('settings', 'logo_url',          ''),
('settings', 'chart_type',        'bar');

-- ─── Result Contents — Lead Gen ───────────────────────────────
insert into result_contents (domain, content_type, score_range_min, score_range_max, revenue_tier, body) values
-- Analysis: low (1-5)
('lead_gen','analysis', 0, 5, null,
 'Based on your answers, your lead generation is at its earliest stage. You''re likely relying on word-of-mouth and organic posts — which caps your growth at whatever your existing patients can refer. {spa_name} has a significant opportunity to build a real acquisition engine.'),
-- Analysis: mid (6-9)
('lead_gen','analysis', 6, 9, null,
 'You have some paid activity happening at {spa_name}, but it''s not fully optimized. Running one broad campaign means your ad spend is diluted across multiple audiences who respond to different messages — Botox patients need different copy than body contouring patients.'),
-- Analysis: high (10-12)
('lead_gen','analysis', 10, 12, null,
 '{spa_name} is running a sophisticated lead generation setup. Treatment-specific campaigns with frequent creative refreshes put you in the top tier of med spa marketing. Your focus should be scaling what''s working.'),
-- Best practice
('lead_gen','best_practice', 0, 12, null,
 'Top-performing med spas run 3–5 simultaneous campaigns, each targeting a specific treatment audience with tailored creative. They refresh creatives every 2 weeks and run retargeting to recapture people who clicked but didn''t book.'),
-- Tip
('lead_gen','tip', 0, 12, null,
 'THIS WEEK: Set up one retargeting audience of people who visited your website in the last 30 days. Create an ad specifically for them — "Still thinking about [treatment]? We have appointments this week." This alone can convert 15–25% of your warm traffic.'),
-- Recommendations by revenue tier
('lead_gen','recommendation', 0, 12, 'under_20k',
 'At your current revenue level, the highest-ROI move is launching one focused campaign for {treatments}. A $500/month budget spent correctly on one treatment campaign will outperform a $2,000 spread across everything. Start narrow, prove it works, then scale.'),
('lead_gen','recommendation', 0, 12, '20k_50k',
 'You''re at a scale where treatment-specific campaigns become critical. Split your budget across your top 2 treatments ({treatments}). Each needs its own landing page, ad creative, and lead form. Mixing them kills your conversion rate.'),
('lead_gen','recommendation', 0, 12, '50k_100k',
 'At $50K+/month, you can afford to run 3–4 simultaneous campaigns with proper creative testing. Allocate 70% of budget to proven campaigns, 30% to testing new treatments and audiences. For {treatments}, test video testimonials vs. before/after images.'),
('lead_gen','recommendation', 0, 12, '100k_150k',
 'At your revenue tier, lead gen should be fully systematized. You need a dedicated media buyer (or agency), weekly creative reviews, and treatment-specific attribution. For {treatments} specifically, focus on high-ticket treatment funnels — these justify higher CPL.'),
('lead_gen','recommendation', 0, 12, '150k_plus',
 'At $150K+/month, lead gen is a growth lever, not a survival tool. Build a full creative production pipeline: produce 4–6 new ad variations monthly. Test aggressively across {treatments} and scale winners to regional or national audiences.');

-- ─── Result Contents — Speed-to-Lead ─────────────────────────
insert into result_contents (domain, content_type, score_range_min, score_range_max, revenue_tier, body) values
('speed_to_lead','analysis', 0, 4, null,
 'Your current lead response setup is costing {spa_name} significant revenue. MIT research found that responding within 5 minutes makes you 21x more likely to convert a lead vs. responding in 30+ minutes. Every hour of delay is revenue walking out the door.'),
('speed_to_lead','analysis', 5, 9, null,
 '{spa_name} has some follow-up structure but there are gaps that are letting warm leads go cold. A multi-touch sequence — automated text within 2 minutes, call within 5 minutes, then a 5-day nurture — can recover 30–40% of leads that don''t respond immediately.'),
('speed_to_lead','analysis', 10, 12, null,
 '{spa_name}''s speed-to-lead is strong. Having a dedicated booking specialist with a structured sequence puts you in the top 10% of med spas. The next level is AI-assisted lead qualification before the human call.'),
('speed_to_lead','best_practice', 0, 12, null,
 'The industry gold standard: automated SMS within 90 seconds of lead submission, a trained booking specialist calls within 5 minutes, and a 7-touch multi-channel sequence (calls, texts, emails) runs automatically if they don''t respond. No lead falls through the cracks.'),
('speed_to_lead','tip', 0, 12, null,
 'THIS WEEK: Set up an automated text that fires within 2 minutes of any new lead from any source. "Hi [Name], this is [Spa Name] — we saw you''re interested in [treatment]. We have availability this week. When''s a good time to chat?" This alone can increase contact rate by 40%.'),
('speed_to_lead','recommendation', 0, 12, 'under_20k',
 'At your stage, you or one person needs to own lead response. Set up an automated SMS tool (GoHighLevel costs $97/month) that texts every lead within 2 minutes. This is the single highest-ROI investment you can make before anything else.'),
('speed_to_lead','recommendation', 0, 12, '20k_50k',
 'You need a dedicated person for lead follow-up. Even part-time (20 hrs/week) a booking specialist with a script typically increases conversion rate by 2–3x. Calculate: if you convert 2 extra leads/week at $300 avg ticket, that''s $2,400/month from a $2,000 salary.'),
('speed_to_lead','recommendation', 0, 12, '50k_100k',
 'At your revenue, a full-time booking specialist is non-negotiable. Pair them with a CRM that tracks every lead, every touchpoint, and every outcome. Set a KPI: 100% of leads contacted within 5 minutes during business hours.'),
('speed_to_lead','recommendation', 0, 12, '100k_150k',
 'Build a speed-to-lead SOP and train your team to it. Consider 24/7 coverage for high-traffic campaigns — weekend ad spend without weekend response is wasted budget. For {spa_name}, an after-hours AI chatbot that books consultations is worth exploring.'),
('speed_to_lead','recommendation', 0, 12, '150k_plus',
 'At your scale, automate as much of the qualification process as possible before the human call. An AI chatbot can handle initial qualification (treatment interest, budget, timeline) so your specialist only talks to pre-qualified leads, dramatically increasing close rate.');

-- ─── Result Contents — Booking ────────────────────────────────
insert into result_contents (domain, content_type, score_range_min, score_range_max, revenue_tier, body) values
('booking','analysis', 0, 4, null,
 'A no-show rate above 20% is a major revenue leak at {spa_name}. If you see 50 patients/month and 20% no-show, that''s 10 empty appointments — likely $3,000–$5,000 in lost revenue monthly just from no-shows, before accounting for the staff time wasted.'),
('booking','analysis', 5, 6, null,
 '{spa_name} has basic booking infrastructure but there are gaps. Adding an SMS reminder 1 hour before the appointment is the single highest-ROI change you can make — it typically drops no-shows by 30–40% on its own.'),
('booking','analysis', 7, 8, null,
 '{spa_name}''s booking and reminder system is working well. Your 3-touch reminder sequence (confirmation + 24hr + 1hr) is exactly what top practices run. Consider adding a deposit requirement for high-demand appointments to eliminate the remaining no-shows.'),
('booking','best_practice', 0, 8, null,
 'Top med spas run a 3-touch reminder system: immediate booking confirmation via text + email, a 24-hour reminder with a 1-click reschedule link, and a 1-hour reminder. This combination consistently drives no-show rates below 8%.'),
('booking','tip', 0, 8, null,
 'THIS WEEK: Add a 1-hour-before SMS reminder to your booking system. Most practice management software (Vagaro, Jane, Mindbody) supports this natively. If yours doesn''t, use a Zapier integration to send it from Twilio. Cost: ~$0.01 per text.'),
('booking','recommendation', 0, 8, 'under_20k',
 'Set up a free or low-cost booking system with built-in reminders (Vagaro starts at $25/month). Enable all reminder types: confirmation, 24hr, and 1hr. This is the fastest ROI improvement available to {spa_name}.'),
('booking','recommendation', 0, 8, '50k_100k',
 'At your volume, no-show optimization is worth significant investment. A $2,000 reduction in monthly no-shows (5–8 appointments) justifies almost any tool. Implement a deposit policy for Botox and filler appointments — these are your highest-demand, highest-no-show treatments.'),
('booking','recommendation', 0, 8, '150k_plus',
 'Build a full waitlist system so every no-show is immediately filled. When a cancellation comes in, the system should auto-text your waitlist and fill the slot within minutes. At your volume, this alone could recover $8,000–$15,000/month in lost revenue.');

-- ─── Result Contents — Attribution ───────────────────────────
insert into result_contents (domain, content_type, score_range_min, score_range_max, revenue_tier, body) values
('attribution','analysis', 0, 3, null,
 'Without revenue attribution, {spa_name} is likely funding campaigns that don''t perform and underfunding ones that do. Most practices in this situation discover, once they set up tracking, that 20% of their campaigns produce 80% of their bookings.'),
('attribution','analysis', 4, 6, null,
 '{spa_name} has partial visibility but the gaps are costing you optimization opportunities. Cost-per-lead is a vanity metric if you don''t know which leads become paying patients. Full tracking from click → booking → revenue changes every decision you make.'),
('attribution','analysis', 7, 8, null,
 '{spa_name} has strong attribution data — this is a genuine competitive advantage. Most of your competitors are flying blind. Use your data aggressively: double down on the treatments with the best revenue-per-click and cut the underperformers.'),
('attribution','best_practice', 0, 8, null,
 'Full revenue attribution tracks: which ad was clicked → which lead was generated → which consultation was booked → which appointment was kept → what revenue was collected. This requires a CRM with UTM tracking connected to your booking system. GoHighLevel, HubSpot, and Salesforce all do this.'),
('attribution','tip', 0, 8, null,
 'THIS WEEK: Add UTM parameters to every link in your ads (utm_source=facebook&utm_medium=paid&utm_campaign=botox-july). Even without a full CRM, you''ll see in Google Analytics which campaigns drive website traffic. It''s a start.'),
('attribution','recommendation', 0, 8, null,
 'Build a simple attribution spreadsheet tracking: lead source, treatment interest, booked (Y/N), showed (Y/N), revenue. Even manual tracking for 30 days will reveal which campaigns are producing revenue vs. just leads. For {treatments}, this data will surprise you.');

-- ─── Result Contents — Growth ─────────────────────────────────
insert into result_contents (domain, content_type, score_range_min, score_range_max, revenue_tier, body) values
('growth','analysis', 0, 2, null,
 '{spa_name} is paying full acquisition cost every time a patient returns — or losing them entirely. First-time patient acquisition costs 5–7x more than retaining an existing patient. Without a retention system, every patient who doesn''t come back represents wasted ad spend.'),
('growth','analysis', 3, 3, null,
 '{spa_name} has some retention infrastructure. Loyalty programs and memberships are valuable — the next step is automating post-treatment touchpoints so retention happens consistently, not just when staff remember to mention it.'),
('growth','analysis', 4, 4, null,
 '{spa_name}''s retention system is working. Automated touchpoints and a structured program mean you''re compounding value from every patient you acquire. Focus on referral incentivization to accelerate organic growth.'),
('growth','best_practice', 0, 4, null,
 'Top practices run a post-treatment nurture sequence: a "how are you feeling?" text 3 days after treatment, a rebooking prompt 6 weeks later (timed for the treatment cycle), and a loyalty reward notification at 3 months. This runs automatically and produces 40–60% rebooking rates.'),
('growth','tip', 0, 4, null,
 'THIS WEEK: Text every patient who visited in the last 60 days: "Hi [Name], just checking in from [Spa Name] — how are you feeling after your [treatment]? We have availability for a touch-up this month if you''re interested." This one message typically generates 5–10% immediate rebooking.'),
('growth','recommendation', 0, 4, null,
 'Build a 90-day patient nurture sequence for {treatments}. Day 3: care check-in. Day 30: rebooking prompt. Day 60: treatment upgrade offer. Day 90: loyalty reward. This runs automatically and turns one-time patients into annual revenue streams for {spa_name}.');
