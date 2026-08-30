'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Loader2, Copy, Check, Download, ShieldCheck } from 'lucide-react';
import { VerificationResponse } from '@/lib/types';

interface VerificationResultProps {
  loading: boolean;
  result: VerificationResponse | null;
  searchedCertId?: string;
}

function formatMonthYear(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatFullDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function VerificationResult({ loading, result, searchedCertId }: VerificationResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ marginTop: '24px' }}>
        <div className="seal-wrap">
          <div className="seal loading">
            <Loader2 className="animate-spin" />
          </div>
          <p className="result-title" style={{ color: 'var(--cyan)' }}>
            Verifying Cryptographic Record…
          </p>
          <p className="sub-title" style={{ margin: 0, textAlign: 'center' }}>
            Looking up certificate #{searchedCertId} against Praman Network’s immutable registry.
          </p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  // Case 1: VALID Certificate
  if (result.valid) {
    const certNum = result.certNumber || searchedCertId || '';
    const startFmt = formatMonthYear(result.startDate);
    const endFmt = formatMonthYear(result.endDate);
    const durationStr = startFmt && endFmt ? `${startFmt} — ${endFmt}` : `${result.startDate} — ${result.endDate}`;
    const issueDateStr = formatFullDate(result.issueDate) || result.issueDate || '—';

    return (
      <div className="glass-panel" style={{ marginTop: '28px', borderColor: 'rgba(16, 185, 129, 0.35)' }}>
        <div className="seal-wrap">
          <div className="seal valid">
            <CheckCircle2 />
          </div>
          <p className="result-title valid">Cryptographic Authenticity Confirmed</p>
          <p className="sub-title" style={{ margin: '0 0 16px', textAlign: 'center' }}>
            This record matches Praman Network’s official immutable database and signature.
          </p>

          <div className="detail-grid">
            <div className="detail-row">
              <span className="k">Intern Name</span>
              <span className="v" style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)' }}>
                {result.name}
              </span>
            </div>
            <div className="detail-row">
              <span className="k">Role / Domain</span>
              <span className="v" style={{ fontWeight: 600, color: 'var(--cyan)' }}>
                {result.role}
              </span>
            </div>
            <div className="detail-row">
              <span className="k">Duration</span>
              <span className="v">{durationStr}</span>
            </div>
            <div className="detail-row">
              <span className="k">Issue Date</span>
              <span className="v">{issueDateStr}</span>
            </div>
            <div className="detail-row">
              <span className="k">Certificate ID</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="v mono">{certNum}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(certNum)}
                  title="Copy Certificate ID"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: copied ? 'var(--emerald)' : 'var(--text-faint)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <div className="detail-row">
              <span className="k">Verification Status</span>
              <span className="v">
                <span className="badge active">
                  <ShieldCheck size={12} />
                  Valid &amp; Authenticated
                </span>
              </span>
            </div>
          </div>

          {/* Action: Direct Download PDF */}
          <div
            style={{
              marginTop: '28px',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <a
              href={`/api/certificates/${encodeURIComponent(certNum)}/pdf?download=true`}
              download={`${certNum}.pdf`}
              className="btn btn-primary"
              style={{ padding: '12px 32px', fontSize: '13px' }}
            >
              <Download size={16} />
              Download Official Certificate (PDF)
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: REVOKED Certificate
  if (result.status === 'revoked' || (result.reason || '').toLowerCase().includes('revoked')) {
    return (
      <div className="glass-panel" style={{ marginTop: '24px', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
        <div className="seal-wrap">
          <div className="seal revoked">
            <AlertTriangle />
          </div>
          <p className="result-title revoked">Certificate Revoked</p>
          <p className="sub-title" style={{ margin: '0 0 10px', textAlign: 'center' }}>
            {result.reason || 'This certificate was previously issued but has since been revoked by the issuer.'}
          </p>

          <div className="detail-grid">
            <div className="detail-row">
              <span className="k">Certificate No.</span>
              <span className="v mono">{result.certNumber || searchedCertId}</span>
            </div>
            <div className="detail-row">
              <span className="k">Current Status</span>
              <span className="v">
                <span className="badge revoked">
                  <AlertTriangle size={12} />
                  Revoked
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: INVALID / NOT FOUND / TAMPERED
  const isNotFound = (result.reason || '').toLowerCase().includes('not found');
  return (
    <div className="glass-panel" style={{ marginTop: '24px', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
      <div className="seal-wrap">
        <div className="seal invalid">
          <XCircle />
        </div>
        <p className="result-title invalid">
          {isNotFound ? 'Certificate Not Found' : 'Verification Failed'}
        </p>
        <p className="sub-title" style={{ margin: '0 0 10px', textAlign: 'center' }}>
          {result.reason || 'The requested credential does not match records.'}
        </p>

        <div className="detail-grid">
          <div className="detail-row">
            <span className="k">Queried Certificate</span>
            <span className="v mono">{searchedCertId}</span>
          </div>
          <div className="detail-row">
            <span className="k">Result</span>
            <span className="v" style={{ color: 'var(--rose)' }}>
              {isNotFound ? 'Record does not exist' : 'Security hash failure'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
