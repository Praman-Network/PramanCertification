import crypto from 'crypto';

interface HashParams {
  certNumber: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
}

export function generateHash({ certNumber, name, role, startDate, endDate }: HashParams): string {
  const secret = process.env.CERT_SECRET;
  if (!secret) {
    throw new Error('CERT_SECRET is not configured in environment variables.');
  }
  const raw = `${certNumber}|${name}|${role}|${startDate}|${endDate}|${secret}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}
