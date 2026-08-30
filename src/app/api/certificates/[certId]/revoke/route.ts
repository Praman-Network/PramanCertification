import { NextRequest, NextResponse } from 'next/server';
import { checkRequestAdminAuth } from '@/lib/auth';
import { revokeCertificateByNumber } from '@/lib/cert-service';

export const runtime = 'nodejs';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { certId: string } }
) {
  const isAuth = await checkRequestAdminAuth(req);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized. Admin login required.' }, { status: 401 });
  }

  const certId = decodeURIComponent(params.certId);
  const success = await revokeCertificateByNumber(certId);

  if (!success) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
  }

  return NextResponse.json({
    message: 'Certificate revoked successfully',
    certNumber: certId,
  });
}
