import db from './db';
import { generateHash } from './hash';
import { generateQrForCertificate } from './qrgen';
import { generateCertificatePdf } from './pdfgen';
import { CertificateWithIntern } from './types';

/**
 * Atomically generates the next certificate number using a PostgreSQL Sequence.
 * This guarantees zero race conditions even when multiple concurrent requests
 * or bulk batches are executed at the exact same millisecond.
 */
export async function nextCertNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const seqName = `cert_seq_${year}`;

  // 1. Ensure the atomic yearly sequence exists
  await db.query(`CREATE SEQUENCE IF NOT EXISTS ${seqName} START WITH 1 INCREMENT BY 1;`);

  // 2. Atomically fetch and increment the sequence value
  const result = await db.query<{ next_val: string | number }>(
    `SELECT nextval('${seqName}') as next_val;`
  );

  const seq = parseInt(String(result.rows[0]?.next_val || 1), 10);
  const formattedSeq = String(seq).padStart(5, '0');
  return `CERT-${year}-${formattedSeq}`;
}

export interface GenerateInternParams {
  name: string;
  email?: string | null;
  role: string;
  startDate: string;
  endDate: string;
}

export async function generateOneCertificate({
  name,
  email,
  role,
  startDate,
  endDate,
}: GenerateInternParams): Promise<{ certNumber: string; qrDataUrl: string; pdfUrl: string }> {
  if (!name || !role || !startDate || !endDate) {
    throw new Error('Name, role, start date, and end date are required.');
  }

  const trimmedName = name.trim();
  const trimmedRole = role.trim();
  const trimmedEmail = email ? email.trim() : null;

  // Insert intern record atomically and return generated intern_id
  const internResult = await db.query<{ intern_id: number }>(
    `INSERT INTO interns (name, email, role, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING intern_id`,
    [trimmedName, trimmedEmail, trimmedRole, startDate, endDate]
  );
  const internId = internResult.rows[0].intern_id;

  // Atomically generate unique certificate identifier
  const certNumber = await nextCertNumber();
  const issueDate = new Date().toISOString().slice(0, 10);
  const verificationHash = generateHash({
    certNumber,
    name: trimmedName,
    role: trimmedRole,
    startDate,
    endDate,
  });

  const { dataUrl } = await generateQrForCertificate(certNumber);

  await db.query(
    `INSERT INTO certificates (intern_id, cert_number, issue_date, verification_hash, qr_data_url, status)
     VALUES ($1, $2, $3, $4, $5, 'active')`,
    [internId, certNumber, issueDate, verificationHash, dataUrl]
  );

  await generateCertificatePdf({
    certNumber,
    name: trimmedName,
    role: trimmedRole,
    startDate,
    endDate,
    issueDate,
    qrDataUrl: dataUrl,
  });

  return {
    certNumber,
    qrDataUrl: dataUrl,
    pdfUrl: `/api/certificates/${encodeURIComponent(certNumber)}/pdf`,
  };
}

export async function getAllCertificates(): Promise<CertificateWithIntern[]> {
  const result = await db.query<CertificateWithIntern>(
    `SELECT c.certificate_id, c.cert_number, c.issue_date, c.status,
            i.name, i.email, i.role, i.start_date, i.end_date
     FROM certificates c
     JOIN interns i ON c.intern_id = i.intern_id
     ORDER BY c.certificate_id DESC`
  );
  return result.rows;
}

export async function revokeCertificateByNumber(certNumber: string): Promise<boolean> {
  const result = await db.query(
    `UPDATE certificates SET status = 'revoked' WHERE cert_number = $1`,
    [certNumber]
  );
  return (result.rowCount ?? 0) > 0;
}
