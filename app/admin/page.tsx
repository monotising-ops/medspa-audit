'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import SequenceEditor from '@/components/admin/SequenceEditor';
import QuestionManager from '@/components/admin/QuestionManager';
import ResultsContentManager from '@/components/admin/ResultsContentManager';
import LeadsTable from '@/components/admin/LeadsTable';
import SettingsPanel from '@/components/admin/SettingsPanel';
import InfoBank from '@/components/admin/InfoBank';
import type {
  Question,
  Lead,
  ResultContent,
  GradeTier,
  CoverConfig,
  GateConfig,
  ResultsCTAConfig,
  CreativeComparisonConfig,
  AppSettings,
  InfoBankEntry,
} from '@/types';

type Tab = 'sequence' | 'questions' | 'content' | 'infobank' | 'leads' | 'settings';

function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      onLogin(password);
    } else {
      setError('Incorrect password');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Admin Access
        </h1>
        <p className="text-[#737373] text-sm mb-6">Med Spa Growth Audit Dashboard</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#1e1e1e] text-white placeholder-[#525252] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6]"
            autoFocus
          />
          {error && <p className="text-[#ef4444] text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-[#3b82f6] text-white rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-50 hover:bg-[#2563eb] transition-colors"
          >
            {loading ? 'Checking...' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'sequence', label: 'Sequence Editor' },
  { id: 'questions', label: 'Questions' },
  { id: 'content', label: 'Results Content' },
  { id: 'infobank', label: 'Info Bank' },
  { id: 'leads', label: 'Leads' },
  { id: 'settings', label: 'Settings' },
];

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('leads');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contents, setContents] = useState<ResultContent[]>([]);
  const [gradeTiers, setGradeTiers] = useState<GradeTier[]>([]);
  const [coverConfig, setCoverConfig] = useState<CoverConfig>({
    headline: '', subtext: '', cta_text: '', trust_line: '', background_image_url: '', background_color: '#050505',
  });
  const [gateConfig, setGateConfig] = useState<GateConfig>({
    headline: '', subtext: '', cta_text: '', privacy_text: '', gate_enabled: true,
  });
  const [ctaConfig, setCtaConfig] = useState<ResultsCTAConfig>({
    headline: '', body: '', primary_cta_text: '', primary_cta_url: '', secondary_cta_text: '',
    video_url: '', case_study_text: '', show_video: false, show_case_study: true,
  });
  const [creativeComparisonConfig, setCreativeComparisonConfig] = useState<CreativeComparisonConfig>({
    headline: '', row1_left_label: '', row1_left_image_url: '', row1_right_label: '', row1_right_image_url: '',
    row2_left_label: '', row2_left_image_url: '', row2_right_label: '', row2_right_image_url: '', show_row2: true,
  });
  const [appSettings, setAppSettings] = useState<AppSettings>({
    assessment_active: true, webhook_url: '', accent_color: '#3b82f6', logo_url: '', admin_password_hash: '', chart_type: 'bar',
  });
  const [infoBankEntries, setInfoBankEntries] = useState<InfoBankEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-admin-token': token ?? '',
  }), [token]);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [qRes, lRes, cRes, configRes, ibRes] = await Promise.all([
        fetch('/api/admin/questions', { headers: authHeaders() }),
        fetch('/api/admin/leads', { headers: authHeaders() }),
        fetch('/api/admin/content', { headers: authHeaders() }),
        fetch('/api/config'),
        fetch('/api/admin/info-bank', { headers: authHeaders() }),
      ]);
      if (qRes.ok) setQuestions(await qRes.json());
      if (lRes.ok) setLeads(await lRes.json());
      if (cRes.ok) setContents(await cRes.json());
      if (ibRes.ok) setInfoBankEntries(await ibRes.json());
      if (configRes.ok) {
        const { configs, gradeTiers: gt } = await configRes.json();
        setGradeTiers(gt ?? []);
        if (configs.cover) setCoverConfig(configs.cover as CoverConfig);
        if (configs.gate) setGateConfig({
          ...configs.gate,
          gate_enabled: configs.gate.gate_enabled !== 'false',
          show_spa_name_field: configs.gate.show_spa_name_field !== 'false',
          show_phone_field: configs.gate.show_phone_field === 'true',
        });
        if (configs.results_cta) setCtaConfig({ ...configs.results_cta, show_video: configs.results_cta.show_video === 'true', show_case_study: configs.results_cta.show_case_study !== 'false' });
        if (configs.creative_comparison) setCreativeComparisonConfig({ ...configs.creative_comparison, show_row2: configs.creative_comparison.show_row2 !== 'false' });
        if (configs.settings) setAppSettings({ ...configs.settings, assessment_active: configs.settings.assessment_active !== 'false', show_video: false, show_case_study: true });
      }
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders]);

  useEffect(() => {
    if (token) fetchAll();
  }, [token, fetchAll]);

  async function saveConfig(section: string, data: Record<string, string>) {
    const updates = Object.entries(data).map(([key, value]) => ({ section, key, value: String(value) }));
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to save');
  }

  async function uploadImage(file: File, folder: string): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    const res = await fetch('/api/admin/upload', { method: 'POST', headers: { 'x-admin-token': token ?? '' }, body: fd });
    if (!res.ok) throw new Error('Upload failed');
    const { url } = await res.json();
    return url;
  }

  if (!token) return <LoginScreen onLogin={setToken} />;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-[#737373] text-sm">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <div className="border-b border-[#1e1e1e] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Growth Audit Admin
          </h1>
          <p className="text-[#525252] text-xs mt-0.5">Manage your assessment content and leads</p>
        </div>
        <button
          onClick={() => setToken(null)}
          className="text-[#737373] hover:text-white text-sm transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Tab bar */}
      <div className="border-b border-[#1e1e1e] px-6 flex gap-0 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id
                ? 'border-[#3b82f6] text-white'
                : 'border-transparent text-[#737373] hover:text-[#f5f5f5]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6">
        {tab === 'sequence' && (
          <SequenceEditor
            coverConfig={coverConfig}
            gateConfig={gateConfig}
            ctaConfig={ctaConfig}
            creativeComparisonConfig={creativeComparisonConfig}
            onSaveCover={async (c) => { await saveConfig('cover', c as unknown as Record<string, string>); setCoverConfig(c); }}
            onSaveGate={async (g) => { await saveConfig('gate', { ...g, gate_enabled: String(g.gate_enabled), show_spa_name_field: String(g.show_spa_name_field), show_phone_field: String(g.show_phone_field) }); setGateConfig(g); }}
            onSaveCTA={async (c) => { await saveConfig('results_cta', { ...c, show_video: String(c.show_video), show_case_study: String(c.show_case_study), show_locked_section: String(c.show_locked_section) }); setCtaConfig(c); }}
            onSaveCreativeComparison={async (c) => { await saveConfig('creative_comparison', { ...c, show_row2: String(c.show_row2) }); setCreativeComparisonConfig(c); }}
            onUploadImage={uploadImage}
          />
        )}
        {tab === 'questions' && (
          <QuestionManager
            questions={questions}
            onReorder={async (qs) => {
              setQuestions(qs);
              await Promise.all(
                qs.map((q, i) =>
                  fetch(`/api/admin/questions/${q.id}`, {
                    method: 'PATCH',
                    headers: authHeaders(),
                    body: JSON.stringify({ order: i + 1 }),
                  })
                )
              );
            }}
            onUpdate={async (q) => {
              const res = await fetch(`/api/admin/questions/${q.id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(q) });
              if (!res.ok) throw new Error('Update failed');
              const updated = await res.json();
              setQuestions((qs) => qs.map((x) => (x.id === q.id ? updated : x)));
            }}
            onCreate={async (q) => {
              const res = await fetch('/api/admin/questions', { method: 'POST', headers: authHeaders(), body: JSON.stringify(q) });
              if (!res.ok) throw new Error('Create failed');
              const created = await res.json();
              setQuestions((qs) => [...qs, created]);
              return created;
            }}
            onDelete={async (id) => {
              await fetch(`/api/admin/questions/${id}`, { method: 'DELETE', headers: authHeaders() });
              setQuestions((qs) => qs.filter((q) => q.id !== id));
            }}
            onToggleActive={async (id, active) => {
              await fetch(`/api/admin/questions/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ active }) });
              setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, active } : q)));
            }}
            onUploadImage={async (file, qId) => uploadImage(file, `questions/${qId}`)}
          />
        )}
        {tab === 'content' && (
          <ResultsContentManager
            contents={contents}
            gradeTiers={gradeTiers}
            onUpdate={async (id, data) => {
              const res = await fetch(`/api/admin/content/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data) });
              if (!res.ok) throw new Error('Update failed');
              const updated = await res.json();
              setContents((cs) => cs.map((c) => (c.id === id ? updated : c)));
            }}
            onCreate={async (data) => {
              const res = await fetch('/api/admin/content', { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
              if (!res.ok) throw new Error('Create failed');
              const created = await res.json();
              setContents((cs) => [...cs, created]);
              return created;
            }}
            onDelete={async (id) => {
              await fetch(`/api/admin/content/${id}`, { method: 'DELETE', headers: authHeaders() });
              setContents((cs) => cs.filter((c) => c.id !== id));
            }}
            onUpdateGradeTier={async (id, data) => {
              const res = await fetch(`/api/admin/grade-tiers/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data) });
              if (!res.ok) throw new Error('Update failed');
              setGradeTiers((ts) => ts.map((t) => (t.id === id ? { ...t, ...data } : t)));
            }}
            onUploadImage={async (file, domain) => uploadImage(file, `content/${domain}`)}
          />
        )}
        {tab === 'infobank' && (
          <InfoBank
            questions={questions}
            entries={infoBankEntries}
            onCreate={async (entry) => {
              const res = await fetch('/api/admin/info-bank', { method: 'POST', headers: authHeaders(), body: JSON.stringify(entry) });
              if (!res.ok) throw new Error('Failed');
              const created = await res.json();
              setInfoBankEntries(prev => [...prev, created]);
              return created;
            }}
            onUpdate={async (id, data) => {
              const res = await fetch(`/api/admin/info-bank/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data) });
              if (!res.ok) throw new Error('Failed');
              const updated = await res.json();
              setInfoBankEntries(prev => prev.map(e => e.id === id ? updated : e));
            }}
            onDelete={async (id) => {
              await fetch(`/api/admin/info-bank/${id}`, { method: 'DELETE', headers: authHeaders() });
              setInfoBankEntries(prev => prev.filter(e => e.id !== id));
            }}
          />
        )}
        {tab === 'leads' && (
          <LeadsTable
            leads={leads}
            onUpdateLead={async (id, updates) => {
              const res = await fetch(`/api/admin/leads/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(updates) });
              if (!res.ok) throw new Error('Update failed');
              const updated = await res.json();
              setLeads((ls) => ls.map((l) => (l.id === id ? updated : l)));
            }}
            onExportCSV={() => {
              const params = new URLSearchParams({ export: 'csv' });
              const link = document.createElement('a');
              link.href = `/api/admin/leads?${params}&x-admin-token=${token}`;
              link.download = 'leads.csv';
              link.click();
            }}
            onRefresh={fetchAll}
          />
        )}
        {tab === 'settings' && (
          <SettingsPanel
            settings={appSettings}
            onSave={async (s: Partial<AppSettings>) => {
              const data = Object.entries(s).reduce<Record<string, string>>((acc, [k, v]) => {
                acc[k] = String(v);
                return acc;
              }, {});
              await saveConfig('settings', data);
              setAppSettings((prev) => ({ ...prev, ...s }));
            }}
            onUploadLogo={async (file: File) => uploadImage(file, 'brand')}
            assessmentUrl={typeof window !== 'undefined' ? window.location.origin : ''}
          />
        )}
      </div>
    </div>
  );
}
