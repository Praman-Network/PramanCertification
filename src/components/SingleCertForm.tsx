'use client';

import React, { useState } from 'react';
import { PlusCircle, Loader2, Download, ExternalLink, CheckCircle, RefreshCw, Copy, Check } from 'lucide-react';

interface SingleCertFormProps {
  onSuccess?: () => void;
}

export default function SingleCertForm({ onSuccess }: SingleCertFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    startDate: '',
    endDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{
    certNumber: string;
    qrDataUrl: string;
    pdfUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateClick = (e: React.SyntheticEvent<HTMLInputElement>) => {
    try {
      (e.currentTarget as any).showPicker?.();
    } catch (err) {
      // Fallback for older browsers
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedResult(null);

    try {
      const res = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate certificate');
      }

      setCreatedResult({
        certNumber: data.certNumber,
        qrDataUrl: data.qrDataUrl,
        pdfUrl: data.pdfUrl,
      });

      // Clear form
      setFormData({
        name: '',
        email: '',
        role: '',
        startDate: '',
        endDate: '',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Error creating certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="single-name">
            Intern Full Name
          </label>
          <input
            type="text"
            id="single-name"
            name="name"
            className="form-input"
            required
            placeholder="e.g. Kunal Sharma"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-row form-group">
          <div>
            <label className="form-label" htmlFor="single-email">
              Email Address <span style={{ opacity: 0.6, textTransform: 'none' }}>(optional)</span>
            </label>
            <input
              type="email"
              id="single-email"
              name="email"
              className="form-input"
              placeholder="kunal@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="single-role">
              Role / Domain
            </label>
            <input
              type="text"
              id="single-role"
              name="role"
              className="form-input"
              required
              placeholder="e.g. Full Stack Developer Intern"
              value={formData.role}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row form-group">
          <div>
            <label className="form-label" htmlFor="single-startDate">
              Start Date
            </label>
            <input
              type="date"
              id="single-startDate"
              name="startDate"
              className="form-input"
              required
              value={formData.startDate}
              onChange={handleChange}
              onClick={handleDateClick}
              onFocus={handleDateClick}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="single-endDate">
              End Date
            </label>
            <input
              type="date"
              id="single-endDate"
              name="endDate"
              className="form-input"
              required
              value={formData.endDate}
              onChange={handleChange}
              onClick={handleDateClick}
              onFocus={handleDateClick}
            />
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--rose-dim)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fda4af',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '20px' }}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating &amp; Signing PDF…
            </>
          ) : (
            <>
              <PlusCircle size={16} />
              Generate Certificate
            </>
          )}
        </button>
      </form>

      {/* Generated Result Modal/Callout */}
      {createdResult && (
        <div
          style={{
            marginTop: '24px',
            padding: '24px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            animation: 'fadeInScale 0.3s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <CheckCircle size={20} style={{ color: 'var(--emerald)' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--emerald)', fontSize: '16px', margin: 0 }}>
              Certificate Successfully Issued!
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
              Certificate No:{' '}
              <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>
                {createdResult.certNumber}
              </strong>
            </span>
            <button
              onClick={() => handleCopy(createdResult.certNumber)}
              className="btn btn-ghost"
              style={{ padding: '4px 10px', fontSize: '11px' }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <a
              href={`/certificate/${encodeURIComponent(createdResult.certNumber)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ fontSize: '12px', padding: '8px 12px' }}
            >
              <ExternalLink size={14} />
              Preview Page
            </a>
            <a
              href={createdResult.pdfUrl}
              download={`${createdResult.certNumber}.pdf`}
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '8px 12px' }}
            >
              <Download size={14} />
              Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
