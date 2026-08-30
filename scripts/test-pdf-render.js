const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { generateCertificatePdf } = require('../src/lib/pdfgen');

async function testRender() {
  console.log('Testing PDF Generation with new reference design...');

  const certNumber = 'CERT-2026-00001';
  const verifyUrl = `http://localhost:3000/verify?certId=${encodeURIComponent(certNumber)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 320,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });

  const pdfBytes = await generateCertificatePdf({
    certNumber,
    name: 'Greta Mae Evans',
    role: 'Mern Stack Developer Intern',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    issueDate: '2026-08-23',
    qrDataUrl,
  });

  const outDir = path.join(process.cwd(), 'generated');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outPath = path.join(outDir, `test-reference-cert.pdf`);
  fs.writeFileSync(outPath, pdfBytes);

  console.log('Successfully generated test certificate PDF at:', outPath);
  console.log('PDF byte size:', pdfBytes.length);
}

testRender().catch(err => {
  console.error('Error during test render:', err);
  process.exit(1);
});
