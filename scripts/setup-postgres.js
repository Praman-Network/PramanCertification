// scripts/setup-postgres.js - Test PostgreSQL connection and initialize schema
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.slice(0, idx).trim();
          let val = trimmed.slice(idx + 1).trim();
          val = val.replace(/^["']|["']$/g, '');
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

async function setupPostgres() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('\n❌ Error: DATABASE_URL is not defined in .env.local.');
    console.error('Please add DATABASE_URL to your .env.local file.\n');
    process.exit(1);
  }

  let targetDisplay = 'DATABASE_URL (configured)';
  const poolConfig = {
    connectionString,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  };

  const isCloud =
    connectionString.includes('neon.tech') ||
    connectionString.includes('supabase.co') ||
    connectionString.includes('supabase.com') ||
    connectionString.includes('render.com') ||
    connectionString.includes('railway.app') ||
    connectionString.includes('amazonaws.com') ||
    connectionString.includes('sslmode=require');

  if (isCloud && !connectionString.includes('sslmode=disable')) {
    poolConfig.ssl = { rejectUnauthorized: false };
  }

  try {
    const parsed = new URL(connectionString.replace('postgresql://', 'http://').replace('postgres://', 'http://'));
    targetDisplay = `${parsed.hostname}${parsed.port ? ':' + parsed.port : ''}${parsed.pathname}`;
  } catch {}

  console.log(`Connecting to PostgreSQL database at [${targetDisplay}]...\n`);

  const pool = new Pool(poolConfig);

  try {
    const client = await pool.connect();
    console.log('✓ Successfully connected to PostgreSQL server!');

    console.log('Verifying and initializing tables and indexes...');
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

    console.log('✓ Schema and indexes verified successfully.');

    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM interns) AS interns_count,
        (SELECT COUNT(*) FROM certificates) AS certificates_count,
        (SELECT COUNT(*) FROM verification_logs) AS logs_count;
    `);

    console.log('\nCurrent Database State:');
    console.log(`  - Interns on record: ${stats.rows[0].interns_count}`);
    console.log(`  - Certificates on record: ${stats.rows[0].certificates_count}`);
    console.log(`  - Verification logs: ${stats.rows[0].logs_count}\n`);

    client.release();
    await pool.end();
    console.log('🎉 PostgreSQL connection is valid and ready for production!\n');
  } catch (error) {
    console.error('\n❌ PostgreSQL Connection Failed:');
    console.error(`   ${error.message || error}`);
    console.error('\n💡 Tips:');
    console.error('1. If direct connection (port 5432) times out on Supabase, use the Pooler connection string on port 6543.');
    console.error('2. Ensure your password is correct in .env.local.\n');
    await pool.end();
    process.exit(1);
  }
}

setupPostgres();
