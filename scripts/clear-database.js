// scripts/clear-database.js - Reset PostgreSQL database tables, sequences, and files
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

async function clearDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('\n❌ Error: DATABASE_URL is not defined in .env.local.');
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

  try {
    const client = await pool.connect();
    console.log('Truncating tables...');
    await client.query(`
      TRUNCATE TABLE verification_logs, certificates, interns RESTART IDENTITY CASCADE;
    `);
    console.log('✓ Database tables emptied and table identity sequences reset.');

    const year = new Date().getFullYear();
    await client.query(`
      DROP SEQUENCE IF EXISTS cert_seq_${year} CASCADE;
    `);
    console.log(`✓ Certificate sequence cert_seq_${year} reset to 1.`);

    client.release();
    await pool.end();

    const genDir = path.join(__dirname, '..', 'generated');
    if (fs.existsSync(genDir)) {
      const files = fs.readdirSync(genDir);
      for (const f of files) {
        if (f.endsWith('.pdf')) {
          fs.unlinkSync(path.join(genDir, f));
          console.log('Deleted generated PDF file:', f);
        }
      }
    }
    console.log('✓ Generated PDF cache cleared.');
    console.log('\n🎉 Clean reset complete! Database and dashboard are fresh and ready.');
  } catch (err) {
    console.error('Failed to clear database:', err.message);
    await pool.end();
    process.exit(1);
  }
}

clearDatabase();
