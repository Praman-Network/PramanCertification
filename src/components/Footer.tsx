import React from 'react';
import { Shield, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        textAlign: 'center',
        color: 'var(--text-faint)',
        fontSize: '12px',
        fontFamily: 'var(--font-mono)',
        padding: '36px 24px',
        borderTop: '1px solid var(--border)',
        marginTop: 'auto',
        background: 'rgba(6, 6, 12, 0.5)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
        <Shield size={14} style={{ color: 'var(--cyan)' }} />
        <span>PRAMAN NETWORK CRYPTOGRAPHIC CERTIFICATION ENGINE</span>
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: '11px', maxWidth: '600px', margin: '0 auto' }}>
        Every credential is permanently verified against a SHA-256 tamper-evident record.
      </p>
    </footer>
  );
}
