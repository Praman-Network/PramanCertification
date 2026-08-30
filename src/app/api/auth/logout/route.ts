import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out', success: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
