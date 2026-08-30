import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="page-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--panel-strong)',
          border: '1px solid var(--border-strong)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: 'var(--cyan)',
        }}
      >
        <FileQuestion size={28} />
      </div>
      <div className="eyebrow" style={{ justifyContent: 'center' }}>
        404 Error
      </div>
      <h1>Page Not Found</h1>
      <p style={{ color: 'var(--text-dim)', fontSize: '14px', maxWidth: '420px', margin: '8px auto 28px' }}>
        The requested record, credential, or URL could not be located in Praman Network registry.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <Link href="/verify" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
          <ArrowLeft size={14} />
          Go to Verification Portal
        </Link>
        <Link href="/login" className="btn btn-ghost" style={{ padding: '8px 20px', fontSize: '13px' }}>
          Admin Sign In
        </Link>
      </div>
    </div>
  );
}
