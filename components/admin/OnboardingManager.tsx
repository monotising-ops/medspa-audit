'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface OnboardingRecord {
  client_id: string;
  client_name: string;
  completion_percentage: number;
  skipped_questions: string[];
  created_at: string;
  updated_at: string;
}

interface ResponsesModalProps {
  clientId: string;
  clientName: string;
  token: string;
  onClose: () => void;
}

function ResponsesModal({ clientId, clientName, token, onClose }: ResponsesModalProps) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/onboarding/${clientId}`)
      .then((r) => r.json())
      .then(({ data: d }) => setData(d))
      .catch(() => toast.error('Failed to load responses'))
      .finally(() => setLoading(false));
  }, [clientId]);

  const formData = data ? (data as { form_data?: Record<string, string> }).form_data ?? {} : {};
  const checklistData = data ? (data as { checklist_data?: Record<string, { checked?: boolean; notes?: string }> }).checklist_data ?? {} : {};
  const uploadedFiles = data ? (data as { uploaded_files?: Record<string, { url: string; name: string }[]> }).uploaded_files ?? {} : {};

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#0d0d0d',
        border: '1px solid #1a1a1a',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Modal header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#f5f5f5', fontWeight: 700, fontSize: '15px', margin: 0 }}>{clientName}</p>
            <p style={{ color: '#525252', fontSize: '12px', margin: '4px 0 0' }}>Onboarding Responses · {clientId}</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '4px' }}
          >
            ×
          </button>
        </div>

        {/* Modal body */}
        <div style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {loading && <p style={{ color: '#525252', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>Loading…</p>}

          {!loading && (
            <>
              {/* Intake form answers */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#525252', margin: '0 0 12px' }}>
                  Intake Form
                </p>
                {Object.keys(formData).length === 0 ? (
                  <p style={{ color: '#444', fontSize: '13px' }}>No answers yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(formData).map(([key, val]) => (
                      <div key={key} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '10px 14px' }}>
                        <p style={{ color: '#737373', fontSize: '11px', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{key.replace(/_/g, ' ')}</p>
                        <p style={{ color: '#f5f5f5', fontSize: '13px', margin: 0, whiteSpace: 'pre-wrap' }}>{String(val || '—')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Access checklist */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#525252', margin: '0 0 12px' }}>
                  Access Checklist
                </p>
                {Object.keys(checklistData).length === 0 ? (
                  <p style={{ color: '#444', fontSize: '13px' }}>No checklist items completed.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(checklistData).map(([key, val]) => (
                      <div key={key} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{
                          width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0, marginTop: '1px',
                          background: val.checked ? 'rgba(34,197,94,0.15)' : '#1a1a1a',
                          border: `1px solid ${val.checked ? 'rgba(34,197,94,0.4)' : '#2a2a2a'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {val.checked && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5L4 7L8 3" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: '#a1a1aa', fontSize: '11px', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{key.replace(/_/g, ' ')}</p>
                          {val.notes && <p style={{ color: '#737373', fontSize: '12px', margin: 0 }}>{val.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Uploaded files */}
              {Object.keys(uploadedFiles).length > 0 && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#525252', margin: '0 0 12px' }}>
                    Uploaded Files
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(uploadedFiles).map(([cat, files]) => (
                      <div key={cat}>
                        <p style={{ color: '#737373', fontSize: '11px', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat.replace(/_/g, ' ')}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {(files as { url: string; name: string }[]).map((f) => (
                            <a
                              key={f.url}
                              href={f.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#3b82f6', fontSize: '13px', textDecoration: 'none' }}
                            >
                              {f.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface Props {
  token: string;
}

export default function OnboardingManager({ token }: Props) {
  const [records, setRecords] = useState<OnboardingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newClientId, setNewClientId] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [viewingClient, setViewingClient] = useState<OnboardingRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-admin-token': token,
  }), [token]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/onboarding', { headers: authHeaders() });
      if (res.ok) setRecords(await res.json());
      else toast.error('Failed to load onboarding clients');
    } catch {
      toast.error('Failed to load onboarding clients');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const id = newClientId.trim().toLowerCase().replace(/\s+/g, '-');
    if (!id) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/onboarding', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ client_id: id, client_name: newClientName.trim() || id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Failed');
      }
      const created = await res.json();
      setRecords((prev) => [created, ...prev]);
      setNewClientId('');
      setNewClientName('');
      toast.success(`Client created: ${id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(clientId: string) {
    if (!confirm(`Delete onboarding record for "${clientId}"? This cannot be undone.`)) return;
    setDeletingId(clientId);
    try {
      await fetch('/api/admin/onboarding', {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify({ client_id: clientId }),
      });
      setRecords((prev) => prev.filter((r) => r.client_id !== clientId));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  }

  function copyLink(clientId: string) {
    const url = `${window.location.origin}/onboarding?client=${clientId}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied!')).catch(() => toast.error('Copy failed'));
  }

  const inputStyle: React.CSSProperties = {
    background: '#0a0a0a',
    border: '1px solid #1e1e1e',
    borderRadius: '8px',
    padding: '9px 12px',
    color: '#f5f5f5',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '900px' }}>

      {/* Create new client */}
      <div>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#525252', margin: '0 0 16px' }}>
          Create Client Onboarding Link
        </p>
        <form onSubmit={handleCreate} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: 500 }}>Client ID (slug)</label>
              <input
                type="text"
                value={newClientId}
                onChange={(e) => setNewClientId(e.target.value)}
                placeholder="mintus-laser"
                style={inputStyle}
                required
              />
              <p style={{ fontSize: '11px', color: '#444', marginTop: '4px' }}>Used in the URL: /onboarding?client=...</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: 500 }}>Client Display Name</label>
              <input
                type="text"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Mintus Laser Clinic"
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="submit"
              disabled={creating || !newClientId.trim()}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                background: creating || !newClientId.trim() ? '#1a1a1a' : '#3b82f6',
                color: creating || !newClientId.trim() ? '#525252' : '#fff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: creating || !newClientId.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {creating ? 'Creating…' : 'Create & Generate Link'}
            </button>
          </div>
        </form>
      </div>

      {/* Clients table */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#525252', margin: 0 }}>
            All Onboarding Clients ({records.length})
          </p>
          <button
            onClick={fetchRecords}
            style={{ background: 'none', border: '1px solid #1e1e1e', borderRadius: '6px', color: '#737373', fontSize: '12px', padding: '5px 12px', cursor: 'pointer' }}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p style={{ color: '#525252', fontSize: '13px', padding: '40px 0', textAlign: 'center' }}>Loading…</p>
        ) : records.length === 0 ? (
          <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ color: '#525252', fontSize: '13px' }}>No clients yet. Create one above.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {records.map((rec) => {
              const pct = rec.completion_percentage;
              const skippedCount = Array.isArray(rec.skipped_questions) ? rec.skipped_questions.length : 0;
              const updatedAt = new Date(rec.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <div
                  key={rec.client_id}
                  style={{
                    background: '#0d0d0d',
                    border: '1px solid #1a1a1a',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  {/* Progress ring / percentage */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    flexShrink: 0,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="48" height="48" viewBox="0 0 48 48" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#1a1a1a" strokeWidth="3" />
                      <circle
                        cx="24" cy="24" r="20"
                        fill="none"
                        stroke={pct >= 80 ? '#22c55e' : pct >= 40 ? '#D4A853' : '#3b82f6'}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
                        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                      />
                    </svg>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#f5f5f5', position: 'relative', zIndex: 1 }}>{pct}%</span>
                  </div>

                  {/* Client info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#f5f5f5', fontWeight: 600, fontSize: '14px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rec.client_name}
                    </p>
                    <p style={{ color: '#525252', fontSize: '12px', margin: '2px 0 0', fontFamily: 'monospace' }}>{rec.client_id}</p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#444' }}>Updated {updatedAt}</span>
                      {skippedCount > 0 && (
                        <span style={{ fontSize: '11px', color: '#D4A853' }}>{skippedCount} skipped</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={() => copyLink(rec.client_id)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '7px',
                        background: '#111',
                        border: '1px solid #1e1e1e',
                        color: '#a1a1aa',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => setViewingClient(rec)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '7px',
                        background: '#111',
                        border: '1px solid #1e1e1e',
                        color: '#a1a1aa',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      View Responses
                    </button>
                    <button
                      onClick={() => handleDelete(rec.client_id)}
                      disabled={deletingId === rec.client_id}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '7px',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        color: '#ef4444',
                        fontSize: '12px',
                        cursor: deletingId === rec.client_id ? 'not-allowed' : 'pointer',
                        opacity: deletingId === rec.client_id ? 0.5 : 1,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View responses modal */}
      {viewingClient && (
        <ResponsesModal
          clientId={viewingClient.client_id}
          clientName={viewingClient.client_name}
          token={token}
          onClose={() => setViewingClient(null)}
        />
      )}
    </div>
  );
}
