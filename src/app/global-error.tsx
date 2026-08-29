'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: '#06060c',
          color: '#f4f4f6',
          fontFamily: 'sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          margin: 0,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '440px', padding: '24px' }}>
          <h2 style={{ color: '#f43f5e', marginBottom: '12px' }}>Critical Application Error</h2>
          <p style={{ color: '#a1a1ab', fontSize: '14px', marginBottom: '20px' }}>
            {error.message || 'A global layout error occurred.'}
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: '#00f0ff',
              color: '#06060c',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Reload App
          </button>
        </div>
      </body>
    </html>
  );
}
