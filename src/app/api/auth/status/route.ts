import { NextRequest, NextResponse } from 'next/server';
import { checkRequestAdminAuth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const loggedIn = await checkRequestAdminAuth(req);
  return NextResponse.json({ loggedIn });
}
