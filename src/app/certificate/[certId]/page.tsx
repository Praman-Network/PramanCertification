import React from 'react';
import { notFound } from 'next/navigation';
import db from '@/lib/db';
import CertificatePreview from '@/components/CertificatePreview';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    certId: string;
  };
}

export default async function CertificateViewPage({ params }: PageProps) {
  const certNumber = decodeURIComponent(params.certId);

  const result = await db.query(
    `SELECT c.cert_number, c.issue_date, c.qr_data_url, c.status,
            i.name, i.role, i.start_date, i.end_date
     FROM certificates c
     JOIN interns i ON c.intern_id = i.intern_id
     WHERE c.cert_number = $1`,
    [certNumber]
  );

  const row = result.rows[0];

  if (!row) {
    notFound();
  }

  return (
    <div className="page-container wide" style={{ paddingTop: '32px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/verify" className="btn btn-ghost" style={{ width: 'auto', padding: '6px 14px', fontSize: '13px' }}>
          <ArrowLeft size={14} />
          Back to Verification Portal
        </Link>
        <span className="badge active" style={{ fontSize: '12px' }}>
          <ShieldCheck size={14} />
          Official Credential Record
        </span>
      </div>

      <CertificatePreview
        certNumber={row.cert_number}
        name={row.name}
        role={row.role}
        startDate={row.start_date}
        endDate={row.end_date}
        issueDate={row.issue_date}
        qrDataUrl={row.qr_data_url}
        showActions={true}
      />
    </div>
  );
}
