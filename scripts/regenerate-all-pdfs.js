const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

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

async function regenerateAllPdfs() {
  const { generateCertificatePdf } = require('../src/lib/pdfgen');
  const genDir = path.join(__dirname, '..', 'generated');

  if (fs.existsSync(genDir)) {
    const files = fs.readdirSync(genDir);
    for (const f of files) {
      if (f.endsWith('.pdf')) {
        fs.unlinkSync(path.join(genDir, f));
      }
    }
    console.log('✓ Cleared all stale cached PDFs from generated directory');
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is not defined in .env.local.');
    process.exit(1);
  }

  const poolConfig = {
    connectionString,
    max: 2,
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

  const pool = new Pool(poolConfig);
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT c.cert_number, c.issue_date, c.qr_data_url,
             i.name, i.role, i.start_date, i.end_date
      FROM certificates c
      JOIN interns i ON c.intern_id = i.intern_id
    `);

    const rows = result.rows;
    console.log(`Regenerating fresh PDFs for all ${rows.length} certificates...`);
    for (const row of rows) {
      await generateCertificatePdf({
        certNumber: row.cert_number,
        name: row.name,
        role: row.role,
        startDate: row.start_date,
        endDate: row.end_date,
        issueDate: row.issue_date,
        qrDataUrl: row.qr_data_url,
      });
      console.log(`✓ Generated ${row.cert_number}.pdf`);
    }

    console.log('All certificate PDFs regenerated successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

regenerateAllPdfs().catch(console.error);
