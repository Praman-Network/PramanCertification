import { NextRequest, NextResponse } from 'next/server';
import { checkRequestAdminAuth } from '@/lib/auth';
import { generateOneCertificate } from '@/lib/cert-service';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const isAuth = await checkRequestAdminAuth(req);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized. Admin login required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, email, role, startDate, endDate } = body;

    if (!name || !role || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Name, role, start date, and end date are required fields.' },
        { status: 400 }
      );
    }

    const result = await generateOneCertificate({
      name,
      email,
      role,
      startDate,
      endDate,
    });

    return NextResponse.json(
      {
        message: 'Certificate generated successfully',
        ...result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error generating certificate:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate certificate' }, { status: 400 });
  }
}
