import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __praman_pg_pool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __praman_schema_initialized: boolean | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment variables (.env.local).');
  }

  const poolConfig: PoolConfig = {
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };

  const isCloudOrProd =
    process.env.NODE_ENV === 'production' ||
    connectionString.includes('neon.tech') ||
    connectionString.includes('supabase.co') ||
    connectionString.includes('supabase.com') ||
    connectionString.includes('render.com') ||
    connectionString.includes('railway.app') ||
    connectionString.includes('amazonaws.com') ||
    connectionString.includes('sslmode=require');

  if (isCloudOrProd && !connectionString.includes('sslmode=disable')) {
    poolConfig.ssl = {
      rejectUnauthorized: false,
    };
  }

  return new Pool(poolConfig);
}

export function getPool(): Pool {
  if (process.env.NODE_ENV === 'production') {
    if (!global.__praman_pg_pool) {
      global.__praman_pg_pool = createPool();
    }
    return global.__praman_pg_pool;
  }

  if (!global.__praman_pg_pool) {
    global.__praman_pg_pool = createPool();
  }
  return global.__praman_pg_pool;
}

let schemaInitPromise: Promise<void> | null = null;

export async function ensureSchema(): Promise<void> {
  if (global.__praman_schema_initialized) {
    return;
  }

  if (schemaInitPromise) {
    return schemaInitPromise;
  }

  const pool = getPool();
  schemaInitPromise = (async () => {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS interns (
          intern_id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          role VARCHAR(255) NOT NULL,
          start_date VARCHAR(64) NOT NULL,
          end_date VARCHAR(64) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS certificates (
          certificate_id SERIAL PRIMARY KEY,
          intern_id INTEGER NOT NULL REFERENCES interns(intern_id) ON DELETE CASCADE,
          cert_number VARCHAR(128) UNIQUE NOT NULL,
          issue_date VARCHAR(64) NOT NULL,
          verification_hash VARCHAR(255) NOT NULL,
          qr_data_url TEXT NOT NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'active',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS verification_logs (
          log_id SERIAL PRIMARY KEY,
          cert_number VARCHAR(128) NOT NULL,
          result VARCHAR(64) NOT NULL,
          scanned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          verifier_info TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_certificates_intern ON certificates(intern_id);
        CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
        CREATE INDEX IF NOT EXISTS idx_verification_logs_cert ON verification_logs(cert_number);
      `);
      global.__praman_schema_initialized = true;
    } finally {
      client.release();
    }
  })();

  return schemaInitPromise;
}

export async function query<R extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<R>> {
  await ensureSchema();
  const pool = getPool();
  return pool.query<R>(text, params);
}

export const db = {
  query,
  getPool,
  ensureSchema,
};

export default db;
