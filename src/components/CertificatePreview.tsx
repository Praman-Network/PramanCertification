'use client';

import React, { useState } from 'react';
import { Download, Share2, Printer, Check, ShieldCheck } from 'lucide-react';

export interface CertificatePreviewProps {
  certNumber: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  issueDate: string;
  qrDataUrl?: string;
  showActions?: boolean;
}

function formatMonthYear(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatFullDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function CertificatePreview({
  certNumber,
  name,
  role,
  startDate,
  endDate,
  issueDate,
  qrDataUrl,
  showActions = true,
}: CertificatePreviewProps) {
  const [copied, setCopied] = useState(false);

  const startFmt = formatMonthYear(startDate);
  const endFmt = formatMonthYear(endDate);
  const dateRangeStr = startFmt && endFmt ? `${startFmt} and ${endFmt}` : `${startDate} to ${endDate}`;
  const formattedIssueDate = formatFullDate(issueDate) || issueDate;
  const pdfDownloadUrl = `/api/certificates/${encodeURIComponent(certNumber)}/pdf?download=true`;

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/verify?certId=${encodeURIComponent(certNumber)}` : '';
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handlePrint = () => {
    window.open(`/api/certificates/${encodeURIComponent(certNumber)}/pdf`, '_blank');
  };

  return (
    <div className="certificate-wrapper" style={{ width: '100%', maxWidth: '960px', margin: '0 auto' }}>
      {/* Action Toolbar */}
      {showActions && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge active" style={{ fontSize: '12px' }}>
              <ShieldCheck size={14} />
              AUTHENTIC CERTIFICATE RECORD
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleShare}
              className="btn btn-ghost"
              style={{ width: 'auto', padding: '8px 14px', fontSize: '12px' }}
              title="Copy verification link"
            >
              {copied ? <Check size={14} color="var(--emerald)" /> : <Share2 size={14} />}
              {copied ? 'Link Copied!' : 'Share Link'}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-ghost"
              style={{ width: 'auto', padding: '8px 14px', fontSize: '12px' }}
            >
              <Printer size={14} />
              Print / Open PDF
            </button>

            <a
              href={pdfDownloadUrl}
              download={`${certNumber}.pdf`}
              className="btn btn-primary"
              style={{ width: 'auto', padding: '8px 16px', fontSize: '12px' }}
            >
              <Download size={14} />
              Download PDF
            </a>
          </div>
        </div>
      )}

      {/* Main Certificate Canvas (2448 x 1728 ratio) */}
      <div
        className="certificate-paper"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '2448 / 1728',
          backgroundColor: '#fcfdfe',
          borderRadius: '4px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          color: '#1a202c',
          fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          userSelect: 'none',
        }}
      >
        {/* Google Fonts Preconnect & Stylesheet */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Cinzel+Decorative:wght@700;900&family=Montserrat:wght@400;500;600;700;800&display=swap');
        `}</style>

        {/* Master Blank Canvas Background Layer (Geometric borders and middle flourish) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('/certificate-assets/template.webp')",
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Certificate ID (Top-Left above #startupindia) */}
        <div
          style={{
            position: 'absolute',
            top: '10.8%',
            left: '11.8%',
            zIndex: 3,
            fontSize: 'clamp(9px, 1.15cqw, 13px)',
            fontWeight: 700,
            color: '#072428',
            letterSpacing: '0.04em',
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          Certificate ID: <span style={{ color: '#155e75' }}>{certNumber}</span>
        </div>

        {/* Top Header Logos Row */}
        <div
          style={{
            position: 'absolute',
            top: '13.2%',
            left: '11.8%',
            right: '11.8%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 3,
          }}
        >
          {/* #startupindia */}
          <div style={{ width: '17.2%', minWidth: '78px', maxWidth: '172px' }}>
            <img
              src="/certificate-assets/startupindia.png"
              alt="#startupindia"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          {/* Authentic Black PRAMAN Header */}
          <div style={{ width: '18.4%', minWidth: '82px', maxWidth: '184px', textAlign: 'center' }}>
            <img
              src="/certificate-assets/praman-black.png"
              alt="PRAMAN"
              style={{ width: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
            />
          </div>

          {/* MSME */}
          <div style={{ width: '15.5%', minWidth: '70px', maxWidth: '155px' }}>
            <img
              src="/certificate-assets/msme.png"
              alt="MSME Government of India"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </div>

        {/* Headings: CERTIFICATE OF COMPLETION */}
        <div
          style={{
            position: 'absolute',
            top: '25.5%',
            left: '8%',
            right: '8%',
            textAlign: 'center',
            zIndex: 3,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: "'Cinzel', 'Times New Roman', serif",
              fontSize: 'clamp(24px, 4.6cqw, 48px)',
              fontWeight: 900,
              letterSpacing: '0.07em',
              color: '#062222',
              lineHeight: 1.1,
            }}
          >
            CERTIFICATE
          </h1>
          <div
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 'clamp(10px, 1.7cqw, 17px)',
              fontWeight: 700,
              letterSpacing: '0.25em',
              color: '#173237',
              marginTop: '0.5%',
            }}
          >
            OF COMPLETION
          </div>
          <div
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 'clamp(8.5px, 1.3cqw, 13px)',
              color: '#486066',
              fontWeight: 500,
              marginTop: '0.6%',
            }}
          >
            This certificate is proudly presented to
          </div>
        </div>

        {/* Candidate Name in Cinzel Decorative (Exact Match to PDF: All-Caps, Flourished, Deep Slate-Cyan) */}
        <div
          style={{
            position: 'absolute',
            top: '41.2%',
            left: '8%',
            right: '8%',
            textAlign: 'center',
            zIndex: 3,
          }}
        >
          <div
            style={{
              fontFamily: "'Cinzel Decorative', 'Cinzel', 'Times New Roman', serif",
              fontSize: 'clamp(22px, 4.3cqw, 45px)',
              fontWeight: 700,
              color: '#1f6477',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              lineHeight: 1.15,
            }}
          >
            {name}
          </div>
        </div>

        {/* Body Paragraph & Date in Montserrat */}
        <div
          style={{
            position: 'absolute',
            top: '56.5%',
            left: '8%',
            right: '8%',
            textAlign: 'center',
            zIndex: 3,
          }}
        >
          <div
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 'clamp(8.5px, 1.45cqw, 14.5px)',
              lineHeight: 1.55,
              color: '#162428',
              maxWidth: '92%',
              margin: '0 auto',
            }}
          >
            <div>
              For successfully completing the &quot;
              <strong style={{ fontWeight: 700, color: '#051012' }}>{role}</strong>
              {' '}at{' '}
              <strong style={{ fontWeight: 700, color: '#051012' }}>Praman Network</strong>
              &quot;
            </div>
            <div style={{ color: '#24393e', fontWeight: 500, marginTop: '0.2%' }}>
              held between {dateRangeStr}. Your effort during the internship have not only
            </div>
            <div style={{ color: '#24393e', fontWeight: 500 }}>
              contributed to our success but also reflected your readiness for greater responsibilities.
            </div>
          </div>

          <div
            style={{
              fontFamily: "'Montserrat', sans-serif",
              marginTop: '1.6%',
              fontSize: 'clamp(9px, 1.45cqw, 14.5px)',
              fontWeight: 700,
              color: '#0b1a1c',
            }}
          >
            Date: {formattedIssueDate}
          </div>
        </div>

        {/* Bottom Row: QR Code (Left), Founder Signature (Center), Trademark Seal (Right) */}
        <div
          style={{
            position: 'absolute',
            bottom: '8.8%',
            left: '11.8%',
            right: '11.8%',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            zIndex: 3,
          }}
        >
          {/* QR Code (Bottom Left) */}
          <div style={{ width: '16%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '3px',
                borderRadius: '4px',
                border: '1px solid #c8d9dc',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                width: 'clamp(52px, 8.2cqw, 82px)',
                height: 'clamp(52px, 8.2cqw, 82px)',
              }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Scan to verify"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8px',
                    color: '#64748b',
                  }}
                >
                  QR
                </div>
              )}
            </div>
            <span
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 'clamp(7px, 0.9cqw, 9.5px)',
                fontWeight: 700,
                color: '#205360',
                marginTop: '3px',
                letterSpacing: '0.04em',
              }}
            >
              Scan to verify
            </span>
          </div>

          {/* Founder Signature (Bottom Center) */}
          <div style={{ width: '34%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 'clamp(88px, 14.5cqw, 145px)', marginBottom: '2px' }}>
              <img
                src="/certificate-assets/signature.png"
                alt="Rahul Chaudhary Signature"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            <div
              style={{
                width: 'clamp(105px, 18.5cqw, 175px)',
                height: '1.5px',
                backgroundColor: '#9bb1b7',
                margin: '0 auto 4px',
              }}
            />
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 'clamp(9.5px, 1.4cqw, 14px)',
                fontWeight: 700,
                color: '#164f5e',
                lineHeight: 1.2,
              }}
            >
              Rahul Chaudhary
            </div>
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 'clamp(8px, 1.1cqw, 11px)',
                color: '#526b71',
                fontWeight: 500,
                marginTop: '1px',
              }}
            >
              Founder
            </div>
          </div>

          {/* Trademark Seal (Bottom Right Enlarged) */}
          <div style={{ width: '16%', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 'clamp(64px, 12.5cqw, 122px)' }}>
              <img
                src="/certificate-assets/trademark.png"
                alt="PRAMAN NETWORK TRADEMARK SEAL"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
