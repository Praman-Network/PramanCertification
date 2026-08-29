// test-system.js - Automated tests for Next.js endpoints
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const filePath = path.join(__dirname, file);
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

async function runTests() {
  const baseUrl = 'http://localhost:3000';
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.error('❌ Error: ADMIN_USERNAME and ADMIN_PASSWORD must be defined in .env.local');
    process.exit(1);
  }

  console.log(`Testing Next.js Praman Certificate System with user [${adminUsername}]...\n`);

  // 1. Check unauthenticated status
  console.log('1. Testing GET /api/auth/status (unauthenticated)...');
  const statusRes = await fetch(`${baseUrl}/api/auth/status`);
  const statusJson = await statusRes.json();
  console.log('   Result:', statusJson);
  if (statusJson.loggedIn !== false) throw new Error('Expected loggedIn: false');

  // 2. Login
  console.log('\n2. Testing POST /api/auth/login...');
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: adminUsername, password: adminPassword }),
  });
  const loginJson = await loginRes.json();
  console.log('   Result:', loginJson);
  if (!loginRes.ok || !loginJson.success) throw new Error('Login failed');

  const cookieHeader = loginRes.headers.get('set-cookie');
  console.log('   Received cookie:', cookieHeader ? 'Yes (Cookie set)' : 'No');

  // Extract session cookie for subsequent requests
  const cookie = cookieHeader ? cookieHeader.split(';')[0] : '';

  // 3. Check authenticated status
  console.log('\n3. Testing GET /api/auth/status (authenticated)...');
  const authStatusRes = await fetch(`${baseUrl}/api/auth/status`, {
    headers: { cookie },
  });
  const authStatusJson = await authStatusRes.json();
  console.log('   Result:', authStatusJson);
  if (!authStatusJson.loggedIn) throw new Error('Expected loggedIn: true');

  // 4. Generate a single certificate
  console.log('\n4. Testing POST /api/certificates/generate...');
  const genRes = await fetch(`${baseUrl}/api/certificates/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({
      name: 'Vikram Patel',
      email: 'vikram@example.com',
      role: 'Next.js Full Stack Engineer Intern',
      startDate: '2026-05-01',
      endDate: '2026-08-01',
    }),
  });
  const genJson = await genRes.json();
  console.log('   Result:', genJson.message, 'Cert ID:', genJson.certNumber);
  if (!genRes.ok || !genJson.certNumber) throw new Error('Single generation failed');

  const certNumber = genJson.certNumber;

  // 5. Verify certificate publicly
  console.log(`\n5. Testing GET /api/verify/${certNumber}...`);
  const verifyRes = await fetch(`${baseUrl}/api/verify/${encodeURIComponent(certNumber)}`);
  const verifyJson = await verifyRes.json();
  console.log('   Result:', verifyJson.valid ? 'VALID' : 'INVALID', verifyJson);
  if (!verifyJson.valid || verifyJson.name !== 'Vikram Patel') throw new Error('Public verification failed');

  // 6. Test PDF download endpoint
  console.log(`\n6. Testing GET /api/certificates/${certNumber}/pdf...`);
  const pdfRes = await fetch(`${baseUrl}/api/certificates/${encodeURIComponent(certNumber)}/pdf`);
  console.log('   Result status:', pdfRes.status, 'Content-Type:', pdfRes.headers.get('content-type'));
  if (pdfRes.status !== 200 || !pdfRes.headers.get('content-type')?.includes('application/pdf')) {
    throw new Error('PDF download endpoint failed');
  }

  // 7. Revoke certificate
  console.log(`\n7. Testing PATCH /api/certificates/${certNumber}/revoke...`);
  const revokeRes = await fetch(`${baseUrl}/api/certificates/${encodeURIComponent(certNumber)}/revoke`, {
    method: 'PATCH',
    headers: { cookie },
  });
  const revokeJson = await revokeRes.json();
  console.log('   Result:', revokeJson);
  if (!revokeRes.ok) throw new Error('Revocation failed');

  // 8. Verify revoked certificate
  console.log(`\n8. Testing GET /api/verify/${certNumber} (after revocation)...`);
  const verifyRevokedRes = await fetch(`${baseUrl}/api/verify/${encodeURIComponent(certNumber)}`);
  const verifyRevokedJson = await verifyRevokedRes.json();
  console.log('   Result status:', verifyRevokedRes.status, 'Response:', verifyRevokedJson);
  if (verifyRevokedRes.status !== 410 || verifyRevokedJson.valid !== false) {
    throw new Error('Expected status 410 and valid: false for revoked cert');
  }

  // 9. Test bulk generation
  console.log('\n9. Testing POST /api/certificates/bulk-generate (JSON payload)...');
  const bulkRes = await fetch(`${baseUrl}/api/certificates/bulk-generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({
      interns: [
        { name: 'Aarav Mehta', email: 'aarav@example.com', role: 'AI Engineer Intern', startDate: '2026-06-01', endDate: '2026-09-01' },
        { name: 'Diya Sen', email: 'diya@example.com', role: 'UI/UX Designer Intern', startDate: '2026-06-01', endDate: '2026-09-01' },
      ],
    }),
  });
  const bulkJson = await bulkRes.json();
  console.log('   Result:', bulkJson.message, `Succeeded: ${bulkJson.succeeded}, Failed: ${bulkJson.failed}`);
  if (!bulkRes.ok || bulkJson.succeeded !== 2) throw new Error('Bulk generation failed');

  // 10. List all certificates
  console.log('\n10. Testing GET /api/certificates...');
  const listRes = await fetch(`${baseUrl}/api/certificates`, {
    headers: { cookie },
  });
  const listJson = await listRes.json();
  console.log(`   Result: Found ${listJson.length} certificates on record`);
  if (!Array.isArray(listJson) || listJson.length < 3) throw new Error('List certificates failed');

  console.log('\n========================================');
  console.log('🎉 ALL 10 TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('========================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ Test failure:', err);
  process.exit(1);
});
