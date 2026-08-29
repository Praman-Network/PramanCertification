import { NextRequest, NextResponse } from 'next/server';
import { checkRequestAdminAuth } from '@/lib/auth';
import { getAllCertificates } from '@/lib/cert-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const isAuth = await checkRequestAdminAuth(req);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized. Admin login required.' }, { status: 401 });
  }

  try {
    const certificates = await getAllCertificates();
    return NextResponse.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
  }
}
