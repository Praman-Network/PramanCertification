import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import db from '@/lib/db';
import { generateCertificatePdf } from '@/lib/pdfgen';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { certId: string } }
) {
  const certId = decodeURIComponent(params.certId);

  try {
    const isDownload = req.nextUrl.searchParams.get('download') === 'true';
    const forceFresh = req.nextUrl.searchParams.get('fresh') === 'true';
    const dispositionType = isDownload ? 'attachment' : 'inline';

    const cachedFilePath = path.join(process.cwd(), 'generated', `${certId}.pdf`);

    // 1. Instant disk cache hit if available and fresh generation not requested
    if (!forceFresh && fs.existsSync(cachedFilePath)) {
      const cachedBuffer = fs.readFileSync(cachedFilePath);
      return new NextResponse(cachedBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `${dispositionType}; filename="${certId}.pdf"`,
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      });
    }

    // 2. Fetch certificate details and generate on-demand
    const result = await db.query(
      `SELECT c.cert_number, c.issue_date, c.qr_data_url,
              i.name, i.role, i.start_date, i.end_date
       FROM certificates c
       JOIN interns i ON c.intern_id = i.intern_id
       WHERE c.cert_number = $1`,
      [certId]
    );

    const row = result.rows[0];

    if (!row) {
      return NextResponse.json({ error: 'Certificate record not found' }, { status: 404 });
    }

    const pdfBytes = await generateCertificatePdf({
      certNumber: row.cert_number,
      name: row.name,
      role: row.role,
      startDate: row.start_date,
      endDate: row.end_date,
      issueDate: row.issue_date,
      qrDataUrl: row.qr_data_url,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${dispositionType}; filename="${certId}.pdf"`,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
