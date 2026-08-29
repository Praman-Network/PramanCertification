'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Award, CheckCircle2, AlertTriangle, Calendar, PlusCircle, FileSpreadsheet, RefreshCw } from 'lucide-react';
import StatCard from '@/components/StatCard';
import SingleCertForm from '@/components/SingleCertForm';
import BulkCertForm from '@/components/BulkCertForm';
import CertificatesTable from '@/components/CertificatesTable';
import { CertificateWithIntern } from '@/lib/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [certificates, setCertificates] = useState<CertificateWithIntern[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(true);

  // Check auth
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/status');
        const data = await res.json();
        if (!data.loggedIn) {
          router.push('/login');
        } else {
          setAuthChecking(false);
        }
      } catch {
        router.push('/login');
      }
    }
    checkAuth();
  }, [router]);

  // Load certificates
  const loadCertificates = useCallback(async () => {
    setLoadingCerts(true);
    try {
      const res = await fetch('/api/certificates');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setCertificates(data);
      }
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoadingCerts(false);
    }
  }, [router]);

  useEffect(() => {
    if (!authChecking) {
      loadCertificates();
    }
  }, [authChecking, loadCertificates]);

  if (authChecking) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Verifying admin authorization…</p>
      </div>
    );
  }

  // Calculate stats
  const total = certificates.length;
  const revoked = certificates.filter((c) => c.status === 'revoked').length;
  const active = total - revoked;

  const now = new Date();
  const thisMonth = certificates.filter((c) => {
    const d = new Date(c.issue_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="page-container wide">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="eyebrow">Certificate Authority Console</div>
          <h1>Issue &amp; Manage Certificates</h1>
          <p className="sub-title">
            Generate tamper-evident internship credentials individually or in bulk batches, and manage the official registry.
          </p>
        </div>

        <button
          onClick={loadCertificates}
          className="btn btn-ghost"
          style={{ padding: '8px 16px', fontSize: '11.5px' }}
          disabled={loadingCerts}
        >
          <RefreshCw size={14} className={loadingCerts ? 'animate-spin' : ''} />
          Refresh Records
        </button>
      </div>

      {/* Stats Summary Grid */}
      <div className="stat-grid">
        <StatCard label="Total Issued" value={total} icon={Award} />
        <StatCard label="Active Credentials" value={active} icon={CheckCircle2} variant="emerald" />
        <StatCard label="Revoked Records" value={revoked} icon={AlertTriangle} variant="amber" />
        <StatCard label="Issued This Month" value={thisMonth} icon={Calendar} variant="cyan" />
      </div>

      {/* Generation Panel with Tabs */}
      <div className="glass-panel" style={{ marginBottom: '36px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`btn ${activeTab === 'single' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 18px', fontSize: '12px' }}
            >
              <PlusCircle size={15} />
              Single Intern Issue
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bulk')}
              className={`btn ${activeTab === 'bulk' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 18px', fontSize: '12px' }}
            >
              <FileSpreadsheet size={15} />
              Bulk CSV Batch
            </button>
          </div>

          <span style={{ fontSize: '12px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
            {activeTab === 'single' ? 'Generate single certificate' : 'Upload CSV for batch processing'}
          </span>
        </div>

        {activeTab === 'single' ? (
          <SingleCertForm onSuccess={loadCertificates} />
        ) : (
          <BulkCertForm onSuccess={loadCertificates} />
        )}
      </div>

      {/* Certificate Registry Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
        <div>
          <h2>Issued Certificates Registry</h2>
          <p style={{ color: 'var(--text-faint)', fontSize: '12.5px', marginTop: '2px' }}>
            {certificates.length} total credential{certificates.length === 1 ? '' : 's'} on record
          </p>
        </div>
      </div>

      <CertificatesTable
        certificates={certificates}
        loading={loadingCerts}
        onRefresh={loadCertificates}
      />
    </div>
  );
}
