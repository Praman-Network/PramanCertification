import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export const COOKIE_NAME = 'praman_admin_session';

function getAdminUsername(): string {
  const username = process.env.ADMIN_USERNAME;
  if (!username) {
    throw new Error('ADMIN_USERNAME is not set in environment variables.');
  }
  return username.trim();
}

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error('ADMIN_PASSWORD is not set in environment variables.');
  }
  return password;
}

function getSessionSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not set in environment variables.');
  }
  return new TextEncoder().encode(secret.padEnd(32, '!'));
}

export function verifyAdminCredentials(username?: string, password?: string): boolean {
  if (!username || !password) return false;
  try {
    const expectedUser = getAdminUsername();
    const expectedPass = getAdminPassword();
    return username.trim() === expectedUser && password === expectedPass;
  } catch {
    return false;
  }
}

export async function createSessionToken(): Promise<string> {
  const secretKey = getSessionSecretKey();
  const adminUser = getAdminUsername();
  return await new SignJWT({ role: 'admin', user: adminUser })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const secretKey = getSessionSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export async function isServerAdminAuthenticated(): Promise<boolean> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return await verifySessionToken(token);
}

export async function checkRequestAdminAuth(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return await verifySessionToken(token);
}
