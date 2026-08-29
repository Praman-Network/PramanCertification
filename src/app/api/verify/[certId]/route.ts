import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateHash } from '@/lib/hash';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Simple in-memory rate limiter (30 requests / 60 seconds per IP)
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 30;

  const record = ipRequestCounts.get(ip);
  if (!record || now > record.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  record.count++;
  if (record.count > maxRequests) {
    return true;
  }
  return false;
}

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET(
  req: NextRequest,
  { params }: { params: { certId: string } }
) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { valid: false, reason: 'Too many verification requests. Please wait a minute and try again.' },
      { status: 429, headers: noCacheHeaders }
    );
  }

  const certNumber = decodeURIComponent(params.certId).trim();
  const userAgent = req.headers.get('user-agent') || 'unknown';

  const logAttempt = async (result: string) => {
    try {
      await db.query(
        `INSERT INTO verification_logs (cert_number, result, verifier_info) VALUES ($1, $2, $3)`,
        [certNumber, result, userAgent]
      );
    } catch (err) {
      console.error('Error logging verification attempt:', err);
    }
  };

  try {
    const queryResult = await db.query(
      `SELECT c.cert_number, c.issue_date, c.verification_hash, c.qr_data_url, c.status,
              i.name, i.role, i.start_date, i.end_date
       FROM certificates c
       JOIN interns i ON c.intern_id = i.intern_id
       WHERE c.cert_number = $1`,
      [certNumber]
    );

    const row = queryResult.rows[0];

    if (!row) {
      await logAttempt('not_found');
      return NextResponse.json(
        { valid: false, reason: 'Certificate not found in Praman records.' },
        { status: 404, headers: noCacheHeaders }
      );
    }

    // Recompute tamper-evident hash
    const recomputed = generateHash({
      certNumber: row.cert_number,
      name: row.name,
      role: row.role,
      startDate: row.start_date,
      endDate: row.end_date,
    });

    if (recomputed !== row.verification_hash) {
      await logAttempt('hash_mismatch');
      return NextResponse.json(
        { valid: false, reason: 'Cryptographic hash mismatch. Certificate data may have been altered or tampered with.' },
        { status: 409, headers: noCacheHeaders }
      );
    }

    if (row.status === 'revoked') {
      await logAttempt('revoked');
      return NextResponse.json(
        {
          valid: false,
          reason: 'This certificate was previously issued but has been formally revoked.',
          certNumber: row.cert_number,
          status: 'revoked',
        },
        { status: 410, headers: noCacheHeaders }
      );
    }

    await logAttempt('valid');
    return NextResponse.json(
      {
        valid: true,
        certNumber: row.cert_number,
        name: row.name,
        role: row.role,
        startDate: row.start_date,
        endDate: row.end_date,
        issueDate: row.issue_date,
        qrDataUrl: row.qr_data_url,
        status: row.status,
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { valid: false, reason: 'Internal verification service error.' },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
