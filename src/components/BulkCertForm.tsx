'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { BulkGenerateResult } from '@/lib/types';

interface BulkCertFormProps {
  onSuccess?: () => void;
}

export default function BulkCertForm({ onSuccess }: BulkCertFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkGenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please drop a valid .csv file.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file first.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/certificates/bulk-generate', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Bulk generation failed');
      }

      setResult(data);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Error processing bulk file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '13px', margin: 0 }}>
          Required CSV columns: <code style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>name,email,role,startDate,endDate</code> (dates as <code style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>YYYY-MM-DD</code>)
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          className={`drop-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <UploadCloud
            size={36}
            style={{ color: dragActive ? 'var(--cyan)' : 'var(--text-dim)', margin: '0 auto 10px', display: 'block' }}
          />
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
            {file ? file.name : 'Click to select or drag & drop CSV file'}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
            {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports standard UTF-8 CSV'}
          </p>
        </div>

        {error && (
          <div
            style={{
              marginTop: '14px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--rose-dim)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fda4af',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '20px' }}
          disabled={loading || !file}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing &amp; Issuing Batch…
            </>
          ) : (
            <>
              <FileSpreadsheet size={16} />
              Process &amp; Issue All Certificates
            </>
          )}
        </button>
      </form>

      {/* Bulk Result Summary */}
      {result && (
        <div
          style={{
            marginTop: '20px',
            padding: '18px 20px',
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            animation: 'fadeInScale 0.3s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--emerald)' }} />
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--text)', margin: 0 }}>
              Batch Execution Complete
            </h4>
          </div>

          <p style={{ fontSize: '13.5px', color: 'var(--text-dim)', margin: '0 0 12px' }}>
            <strong style={{ color: 'var(--emerald)' }}>{result.succeeded} succeeded</strong>,{' '}
            <strong style={{ color: result.failed > 0 ? 'var(--rose)' : 'var(--text-faint)' }}>
              {result.failed} failed
            </strong>
          </p>

          {result.errors.length > 0 && (
            <div
              style={{
                marginTop: '12px',
                padding: '12px',
                background: 'var(--rose-dim)',
                borderRadius: '8px',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                fontSize: '12.5px',
                color: '#fca5a5',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600 }}>
                <AlertCircle size={14} /> Failed Rows:
              </div>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {result.errors.map((err, idx) => (
                  <li key={idx}>
                    Row {err.row} ({err.name}): {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
