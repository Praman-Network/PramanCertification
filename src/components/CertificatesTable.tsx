'use client';

import React, { useState } from 'react';
import { CertificateWithIntern } from '@/lib/types';
import { Search, Download, ExternalLink, ShieldAlert, Check, Copy, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

interface CertificatesTableProps {
  certificates: CertificateWithIntern[];
  loading: boolean;
  onRefresh: () => void;
}

export default function CertificatesTable({ certificates, loading, onRefresh }: CertificatesTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Revoke confirmation modal state
  const [certToRevoke, setCertToRevoke] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  const handleCopy = (certNumber: string) => {
    navigator.clipboard.writeText(certNumber);
    setCopiedId(certNumber);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevokeConfirm = async () => {
    if (!certToRevoke) return;
    setRevoking(true);
    try {
      const res = await fetch(`/api/certificates/${encodeURIComponent(certToRevoke)}/revoke`, {
        method: 'PATCH',
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Revocation error:', err);
    } finally {
      setRevoking(false);
      setCertToRevoke(null);
    }
  };

  const filteredCerts = certificates.filter((c) => {
    const query = search.toLowerCase().trim();
    const matchesQuery =
      !query ||
      c.cert_number.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query) ||
      c.role.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div>
      {/* Search & Filter Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '18px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-faint)',
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '40px' }}
            placeholder="Search by name, role, or certificate ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'active', 'revoked'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className="btn btn-ghost"
              style={{
                padding: '8px 14px',
                fontSize: '11.5px',
                borderColor: statusFilter === filter ? 'var(--cyan)' : 'var(--border)',
                color: statusFilter === filter ? 'var(--cyan)' : 'var(--text-dim)',
                background: statusFilter === filter ? 'var(--cyan-dim)' : 'transparent',
              }}
            >
              {filter.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cert ID</th>
              <th>Intern Name</th>
              <th>Role / Domain</th>
              <th>Issue Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-faint)' }}>
                  Loading certificate records…
                </td>
              </tr>
            ) : filteredCerts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-faint)' }}>
                  {search || statusFilter !== 'all'
                    ? 'No certificates match your search filters.'
                    : 'No certificates issued yet. Create one above to get started.'}
                </td>
              </tr>
            ) : (
              filteredCerts.map((c) => (
                <tr key={c.cert_number}>
                  <td className="mono">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{c.cert_number}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(c.cert_number)}
                        title="Copy Certificate ID"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedId === c.cert_number ? 'var(--emerald)' : 'var(--text-faint)',
                          cursor: 'pointer',
                          display: 'flex',
                          padding: '2px',
                        }}
                      >
                        {copiedId === c.cert_number ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text)', fontWeight: 500 }}>{c.name}</td>
                  <td>{c.role}</td>
                  <td>{c.issue_date}</td>
                  <td>
                    {c.status === 'active' ? (
                      <span className="badge active">
                        <CheckCircle2 size={11} />
                        Active
                      </span>
                    ) : (
                      <span className="badge revoked">
                        <AlertTriangle size={11} />
                        Revoked
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-row" style={{ justifyContent: 'flex-end' }}>
                      <a
                        href={`/api/certificates/${encodeURIComponent(c.cert_number)}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost"
                        style={{ padding: '6px 10px', fontSize: '11px' }}
                        title="Download PDF"
                      >
                        <Download size={13} />
                        PDF
                      </a>
                      <a
                        href={`/verify?certId=${encodeURIComponent(c.cert_number)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost"
                        style={{ padding: '6px 10px', fontSize: '11px' }}
                        title="Verify Credential"
                      >
                        <ExternalLink size={13} />
                        Verify
                      </a>
                      <button
                        type="button"
                        onClick={() => setCertToRevoke(c.cert_number)}
                        disabled={c.status === 'revoked'}
                        className="btn btn-danger"
                        style={{ padding: '6px 10px', fontSize: '11px' }}
                        title={c.status === 'revoked' ? 'Already Revoked' : 'Revoke Certificate'}
                      >
                        <ShieldAlert size={13} />
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Revocation Confirmation Dialog */}
      {certToRevoke && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '440px',
              width: '100%',
              borderColor: 'rgba(244, 63, 94, 0.4)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
              animation: 'fadeInScale 0.2s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rose)' }}>
                <AlertTriangle size={20} />
                <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '17px' }}>Revoke Certificate</h3>
              </div>
              <button
                type="button"
                onClick={() => setCertToRevoke(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ color: 'var(--text-dim)', fontSize: '13.5px', marginBottom: '16px', lineHeight: 1.5 }}>
              Are you sure you want to revoke certificate{' '}
              <strong style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{certToRevoke}</strong>?
              This action cannot be undone and will permanently mark the certificate as invalid in public verification.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setCertToRevoke(null)}
                className="btn btn-ghost"
                style={{ padding: '8px 16px', fontSize: '12px' }}
                disabled={revoking}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevokeConfirm}
                className="btn btn-danger"
                style={{ padding: '8px 16px', fontSize: '12px' }}
                disabled={revoking}
              >
                {revoking ? 'Revoking…' : 'Yes, Revoke Certificate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
