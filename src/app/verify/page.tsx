'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, ShieldCheck, ArrowRight, Lock, KeyRound, CheckCircle, Database } from 'lucide-react';
import VerificationResult from '@/components/VerificationResult';
import { VerificationResponse } from '@/lib/types';

function VerifyContent() {
  const searchParams = useSearchParams();
  const certIdParam = searchParams.get('certId') || '';

  const [certInput, setCertInput] = useState(certIdParam);
  const [searchedId, setSearchedId] = useState(certIdParam);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResponse | null>(null);

  const performVerification = async (idToVerify: string) => {
    const trimmed = idToVerify.trim();
    if (!trimmed) return;

    setSearchedId(trimmed);
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(trimmed)}?_t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        valid: false,
        reason: 'Could not connect to the verification server. Please check your network connection.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certIdParam) {
      setCertInput(certIdParam);
      performVerification(certIdParam);
    }
  }, [certIdParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (certInput.trim()) {
      performVerification(certInput.trim());
    }
  };

  return (
    <div className="page-container">
      <div className="eyebrow">Cryptographic Verification</div>
      <h1>Verify an official credential</h1>
      <p className="sub-title">
        Enter the certificate identification number printed on the document or scan its QR code to verify
        authenticity directly against Praman Network’s issuing registry.
      </p>

      {/* Verification Lookup Card */}
      <div className="glass-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="certId-input">
              <span>Certificate Identification Number</span>
              <span style={{ color: 'var(--cyan)', fontSize: '10px' }}>SECURE LOOKUP</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-faint)',
                }}
              />
              <input
                type="text"
                id="certId-input"
                className="form-input"
                style={{ paddingLeft: '46px', fontFamily: 'var(--font-mono)' }}
                placeholder="e.g. CERT-2026-00001"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px' }}
            disabled={loading || !certInput.trim()}
          >
            {loading ? (
              'Verifying Record…'
            ) : (
              <>
                <span>Verify Credential Authenticity</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Verification Result Card */}
      <VerificationResult
        loading={loading}
        result={result}
        searchedCertId={searchedId}
      />

      {/* Trust & Security Feature Box */}
      <div
        style={{
          marginTop: '40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--cyan)' }}>
            <KeyRound size={16} />
            <h4 style={{ fontSize: '13px', fontFamily: 'var(--font-display)', margin: 0 }}>SHA-256 Fingerprint</h4>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>
            Every certificate is bound to an immutable cryptographic hash computed from intern details.
          </p>
        </div>

        <div
          style={{
            padding: '18px 20px',
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--emerald)' }}>
            <CheckCircle size={16} />
            <h4 style={{ fontSize: '13px', fontFamily: 'var(--font-display)', margin: 0 }}>Tamper Detection</h4>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>
            Any manual modification to names, roles, or dates immediately fails mathematical verification.
          </p>
        </div>

        <div
          style={{
            padding: '18px 20px',
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#a78bfa' }}>
            <Database size={16} />
            <h4 style={{ fontSize: '13px', fontFamily: 'var(--font-display)', margin: 0 }}>Live Registry Check</h4>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>
            Queries real-time status to verify whether the certificate remains active or has been revoked.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="page-container" style={{ textAlign: 'center', paddingTop: '80px' }}>
          <p style={{ color: 'var(--text-dim)' }}>Loading verification system…</p>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
