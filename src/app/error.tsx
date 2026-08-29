'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="page-container" style={{ textAlign: 'center', paddingTop: '80px' }}>
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--rose-dim)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px',
          color: 'var(--rose)',
        }}
      >
        <AlertTriangle size={26} />
      </div>
      <h2>Something went wrong</h2>
      <p style={{ color: 'var(--text-dim)', fontSize: '14px', maxWidth: '420px', margin: '8px auto 24px' }}>
        {error.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={() => reset()}
          className="btn btn-primary"
          style={{ padding: '8px 20px', fontSize: '13px' }}
        >
          <RefreshCw size={14} />
          Try Again
        </button>
        <Link
          href="/login"
          className="btn btn-ghost"
          style={{ padding: '8px 20px', fontSize: '13px' }}
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
