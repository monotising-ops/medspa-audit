'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  Upload,
  X,
  Save,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import type { AppSettings } from '@/types';
import { cn } from '@/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────

interface SettingsPanelProps {
  settings: AppSettings;
  onSave: (settings: Partial<AppSettings>) => Promise<void>;
  onUploadLogo: (file: File) => Promise<string>;
  assessmentUrl: string;
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#f5f5f5] placeholder-[#52525b] focus:outline-none focus:border-[#3b82f6] transition-colors';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-[#f5f5f5] mb-1">{children}</h3>
  );
}

function SectionDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-[#71717a] mb-4">{children}</p>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">
      {children}
    </label>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[#1f1f1f] bg-[#111111] p-5 space-y-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── Large Toggle ─────────────────────────────────────────────────────────────

interface LargeToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  labelOn: string;
  labelOff: string;
}

function LargeToggle({ checked, onChange, labelOn, labelOff }: LargeToggleProps) {
  return (
    <div className="flex items-center gap-4">
      <div
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        className="relative flex-shrink-0 rounded-full cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
        style={{
          width: 56,
          height: 30,
          backgroundColor: checked ? '#3b82f6' : '#333333',
        }}
      >
        <span
          className="absolute top-[3px] rounded-full bg-white shadow transition-transform duration-200"
          style={{
            width: 24,
            height: 24,
            left: 3,
            transform: checked ? 'translateX(26px)' : 'translateX(0)',
          }}
        />
      </div>
      <span
        className={cn(
          'text-sm font-semibold transition-colors',
          checked ? 'text-[#3b82f6]' : 'text-[#71717a]',
        )}
      >
        {checked ? labelOn : labelOff}
      </span>
    </div>
  );
}

// ─── Webhook Payload Preview ──────────────────────────────────────────────────

const SAMPLE_PAYLOAD = {
  event: 'lead_submitted',
  timestamp: new Date().toISOString(),
  lead: {
    name: 'Jane Smith',
    email: 'jane@examplespa.com',
    spa_name: 'Glow Med Spa',
    revenue_tier: '50k_100k',
    location_count: '1',
    top_treatments: ['Botox', 'Hydrafacials'],
    total_score: 47,
    max_score: 80,
    grade: 'functional',
    grade_label: 'Functional',
    domain_scores: {
      lead_gen:      { score: 10, max: 16 },
      speed_to_lead: { score: 8,  max: 16 },
      booking:       { score: 12, max: 16 },
      attribution:   { score: 9,  max: 16 },
      growth:        { score: 8,  max: 16 },
    },
    weakest_domain: 'speed_to_lead',
    results_url: 'https://yoursite.com/results/abc123',
  },
};

function WebhookPayloadPreview() {
  const json = JSON.stringify(SAMPLE_PAYLOAD, null, 2);
  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#050505] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f1f1f]">
        <span className="text-[10px] font-mono text-[#52525b] uppercase tracking-widest">
          application/json
        </span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(json).then(() =>
              toast.success('Payload copied'),
            );
          }}
          className="text-[10px] text-[#52525b] hover:text-[#f5f5f5] transition-colors flex items-center gap-1"
        >
          <Copy className="w-3 h-3" />
          Copy
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-[11px] leading-relaxed text-[#a1a1aa] font-mono whitespace-pre">
        {json}
      </pre>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function SettingsPanel({
  settings,
  onSave,
  onUploadLogo,
  assessmentUrl,
}: SettingsPanelProps) {
  // URL copy
  const [copied, setCopied] = useState(false);

  // Webhook
  const [webhookUrl, setWebhookUrl] = useState(settings.webhook_url ?? '');
  const [testingWebhook, setTestingWebhook] = useState(false);

  // Assessment status
  const [assessmentActive, setAssessmentActive] = useState(settings.assessment_active ?? true);

  // Brand
  const [accentColor, setAccentColor] = useState(settings.accent_color ?? '#3b82f6');
  const [logoUrl, setLogoUrl] = useState(settings.logo_url ?? '');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Save settings
  const [saving, setSaving] = useState(false);

  function handleCopyUrl() {
    navigator.clipboard.writeText(assessmentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleTestWebhook() {
    if (!webhookUrl.trim()) {
      toast.error('Enter a webhook URL first');
      return;
    }
    setTestingWebhook(true);
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(SAMPLE_PAYLOAD),
      });
      if (res.ok) {
        toast.success(`Webhook responded with ${res.status}`);
      } else {
        toast.error(`Webhook returned ${res.status}`);
      }
    } catch {
      toast.error('Webhook request failed (check URL or CORS)');
    } finally {
      setTestingWebhook(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await onUploadLogo(file);
      setLogoUrl(url);
      toast.success('Logo uploaded');
    } catch {
      toast.error('Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword) {
      toast.error('Enter your current password');
      return;
    }
    if (!newPassword) {
      toast.error('Enter a new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    setChangingPassword(true);
    try {
      // The parent is responsible for hashing; pass the raw value via onSave
      await onSave({ admin_password_hash: newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleSaveSettings() {
    setSaving(true);
    try {
      await onSave({
        webhook_url: webhookUrl,
        assessment_active: assessmentActive,
        accent_color: accentColor,
      });
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  // Keep hex input in sync with color picker
  function handleHexInput(val: string) {
    const clean = val.startsWith('#') ? val : `#${val}`;
    setAccentColor(clean);
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* ── Assessment URL ──────────────────────────────── */}
      <Card>
        <SectionTitle>Assessment URL</SectionTitle>
        <SectionDescription>
          Share this link with prospects to start the assessment.
        </SectionDescription>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={assessmentUrl}
            className={cn(inputClass, 'flex-1 cursor-default text-[#71717a]')}
          />
          <a
            href={assessmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] p-2 text-[#71717a] hover:text-[#f5f5f5] hover:border-[#3a3a3a] transition-colors"
            aria-label="Open URL"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={handleCopyUrl}
            className={cn(
              'flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
              copied
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-[#3b82f6] text-white hover:bg-[#2563eb]',
            )}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Link
              </>
            )}
          </button>
        </div>
      </Card>

      {/* ── Email Integration ───────────────────────────── */}
      <Card>
        <SectionTitle>Email Integration</SectionTitle>
        <SectionDescription>
          Configure a webhook to receive lead data when an assessment is submitted.
        </SectionDescription>

        <div>
          <FieldLabel>Webhook URL</FieldLabel>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hooks.zapier.com/…"
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestWebhook}
            disabled={testingWebhook || !webhookUrl.trim()}
            className="flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#a1a1aa] hover:text-[#f5f5f5] hover:border-[#3b82f6] disabled:opacity-40 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            {testingWebhook ? 'Sending…' : 'Test Webhook'}
          </button>
        </div>

        <div>
          <FieldLabel>Payload Preview</FieldLabel>
          <WebhookPayloadPreview />
        </div>
      </Card>

      {/* ── Assessment Status ───────────────────────────── */}
      <Card>
        <SectionTitle>Assessment Status</SectionTitle>
        <SectionDescription>
          When paused, visitors see a placeholder page instead of the assessment.
        </SectionDescription>

        <LargeToggle
          checked={assessmentActive}
          onChange={setAssessmentActive}
          labelOn="Assessment Active"
          labelOff="Assessment Paused"
        />

        {!assessmentActive && (
          <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 px-4 py-3">
            <p className="text-xs text-orange-400">
              The assessment is currently paused. New submissions will not be accepted.
            </p>
          </div>
        )}
      </Card>

      {/* ── Brand Settings ──────────────────────────────── */}
      <Card>
        <SectionTitle>Brand Settings</SectionTitle>
        <SectionDescription>
          Customize the accent color and logo shown in your assessment.
        </SectionDescription>

        {/* Accent color */}
        <div>
          <FieldLabel>Primary Accent Color</FieldLabel>
          <div className="flex items-center gap-3">
            {/* Swatch */}
            <div
              className="w-10 h-10 rounded-full border border-[#2a2a2a] flex-shrink-0 shadow-sm"
              style={{ backgroundColor: accentColor }}
            />
            {/* Picker */}
            <input
              type="color"
              value={accentColor.length === 7 ? accentColor : '#3b82f6'}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0"
              title="Pick color"
            />
            {/* Hex input */}
            <input
              type="text"
              value={accentColor}
              onChange={(e) => handleHexInput(e.target.value)}
              maxLength={7}
              placeholder="#3b82f6"
              className="w-28 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm font-mono text-[#f5f5f5] focus:outline-none focus:border-[#3b82f6] transition-colors"
            />
          </div>
        </div>

        {/* Logo upload */}
        <div>
          <FieldLabel>Logo</FieldLabel>
          {logoUrl && (
            <div className="mb-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="Logo"
                className="h-12 max-w-[160px] object-contain rounded-md border border-[#2a2a2a]"
              />
              <button
                type="button"
                onClick={() => setLogoUrl('')}
                className="flex items-center gap-1 text-xs text-[#71717a] hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
                Remove logo
              </button>
            </div>
          )}
          <input
            ref={logoFileRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => logoFileRef.current?.click()}
            disabled={uploadingLogo}
            className="flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#a1a1aa] hover:border-[#3b82f6] hover:text-[#f5f5f5] disabled:opacity-50 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            {uploadingLogo ? 'Uploading…' : logoUrl ? 'Replace Logo' : 'Upload Logo'}
          </button>
        </div>
      </Card>

      {/* ── Admin Password ──────────────────────────────── */}
      <Card>
        <SectionTitle>Admin Password</SectionTitle>
        <SectionDescription>
          Change the password used to access the admin panel.
        </SectionDescription>

        <div className="space-y-3">
          {/* Current password */}
          <div>
            <FieldLabel>Current Password</FieldLabel>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                autoComplete="current-password"
                className={cn(inputClass, 'pr-10')}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#a1a1aa] transition-colors"
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <FieldLabel>New Password</FieldLabel>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                className={cn(inputClass, 'pr-10')}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#a1a1aa] transition-colors"
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <FieldLabel>Confirm New Password</FieldLabel>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                className={cn(
                  inputClass,
                  'pr-10',
                  confirmPassword && newPassword && confirmPassword !== newPassword
                    ? 'border-red-500/60'
                    : '',
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#a1a1aa] transition-colors"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && newPassword && confirmPassword !== newPassword && (
              <p className="mt-1 text-xs text-red-400">Passwords do not match.</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleChangePassword}
          disabled={changingPassword}
          className="flex items-center gap-1.5 rounded-lg bg-[#111111] border border-[#2a2a2a] px-4 py-2 text-sm font-semibold text-[#f5f5f5] hover:border-[#3b82f6] hover:text-[#3b82f6] disabled:opacity-50 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          {changingPassword ? 'Changing…' : 'Change Password'}
        </button>
      </Card>

      {/* ── Save Settings ───────────────────────────────── */}
      <div className="flex items-center justify-between rounded-xl border border-[#1f1f1f] bg-[#111111] px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-[#f5f5f5]">Save Settings</p>
          <p className="text-xs text-[#52525b] mt-0.5">
            Saves webhook URL, assessment status, and accent color.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2563eb] disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
