import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Grade, DomainScores } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function gradeColor(grade: Grade): string {
  const map: Record<Grade, string> = {
    critical: '#ef4444',
    underperforming: '#f97316',
    functional: '#eab308',
    strong: '#22c55e',
  };
  return map[grade];
}

export function domainScoreColor(pct: number): string {
  if (pct <= 0.4) return '#ef4444';
  if (pct <= 0.6) return '#f97316';
  if (pct <= 0.8) return '#eab308';
  return '#22c55e';
}

export function domainBorderClass(pct: number): string {
  if (pct <= 0.4) return 'domain-red';
  if (pct <= 0.6) return 'domain-orange';
  if (pct <= 0.8) return 'domain-amber';
  return 'domain-green';
}

export function formatRevenueTier(tier: string): string {
  const map: Record<string, string> = {
    under_20k: 'Under $20K/mo',
    '20k_50k': '$20K–$50K/mo',
    '50k_100k': '$50K–$100K/mo',
    '100k_150k': '$100K–$150K/mo',
    '150k_plus': '$150K+/mo',
  };
  return map[tier] ?? tier;
}

export function formatDomain(domain: keyof DomainScores): string {
  const map: Record<keyof DomainScores, string> = {
    lead_gen: 'Lead Generation',
    speed_to_lead: 'Speed-to-Lead',
    booking: 'Booking & No-Shows',
    attribution: 'Revenue Attribution',
    growth: 'Growth Systems',
  };
  return map[domain];
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function csvEscape(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function buildCSV(leads: Record<string, unknown>[]): string {
  if (!leads.length) return '';
  const headers = Object.keys(leads[0]);
  const rows = leads.map(lead =>
    headers.map(h => csvEscape(String(lead[h] ?? ''))).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}
