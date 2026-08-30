export interface Intern {
  intern_id?: number;
  name: string;
  email?: string | null;
  role: string;
  start_date: string;
  end_date: string;
  created_at?: string;
}

export interface Certificate {
  certificate_id?: number;
  intern_id: number;
  cert_number: string;
  issue_date: string;
  verification_hash: string;
  qr_data_url: string;
  status: 'active' | 'revoked';
  created_at?: string;
}

export interface CertificateWithIntern {
  certificate_id?: number;
  cert_number: string;
  issue_date: string;
  status: 'active' | 'revoked';
  name: string;
  email?: string | null;
  role: string;
  start_date: string;
  end_date: string;
}

export interface VerificationLog {
  log_id?: number;
  cert_number: string;
  result: 'valid' | 'revoked' | 'not_found' | 'hash_mismatch';
  scanned_at?: string;
  verifier_info?: string | null;
}

export interface VerificationResponse {
  valid: boolean;
  reason?: string;
  certNumber?: string;
  name?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  issueDate?: string;
  qrDataUrl?: string;
  status?: 'active' | 'revoked';
}

export interface SingleGenerateRequest {
  name: string;
  email?: string;
  role: string;
  startDate: string;
  endDate: string;
}

export interface BulkGenerateResult {
  message: string;
  succeeded: number;
  failed: number;
  results: Array<{
    row: number;
    name: string;
    certNumber: string;
    qrDataUrl: string;
    pdfUrl: string;
  }>;
  errors: Array<{
    row: number;
    name: string;
    error: string;
  }>;
}
