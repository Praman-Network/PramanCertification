const sharp = require('sharp');
const path = require('path');
const QRCode = require('qrcode');
const fs = require('fs');

async function renderFinalPreview() {
  const masterPath = path.join(__dirname, '..', 'public', 'certificate-assets', 'reference-master.png');
  const outPath = path.join(__dirname, '..', 'public', 'certificate-preview-sample.png');

  const certNumber = 'CERT-2026-00018';
  const name = 'Diya Sen';
  const role = 'UI/UX Designer Intern';
  const startFmt = 'June 2026';
  const endFmt = 'September 2026';
  const issueDateFmt = 'August 26, 2026';

  const width = 1024;
  const height = 723;

  // Generate QR Code Buffer
  const qrBuffer = await QRCode.toBuffer('http://localhost:3000/verify?certId=' + certNumber, {
    width: 200,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' }
  });
  const resizedQr = await sharp(qrBuffer).resize(60, 60).toBuffer();

  const overlaySvg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .cert-id { font-family: 'Segoe UI', Roboto, Arial, sans-serif; font-size: 10px; font-weight: 700; fill: #07262c; letter-spacing: 0.5px; }
      .name { font-family: 'Georgia', 'Times New Roman', serif; font-size: 42px; font-weight: 400; fill: #367b90; text-anchor: middle; letter-spacing: 0.8px; }
      .body-role { font-family: 'Segoe UI', Roboto, Arial, sans-serif; font-size: 12.8px; font-weight: 400; fill: #1c2b2e; text-anchor: middle; }
      .body-text { font-family: 'Segoe UI', Roboto, Arial, sans-serif; font-size: 12.2px; font-weight: 400; fill: #2a3d42; text-anchor: middle; }
      .date { font-family: 'Segoe UI', Roboto, Arial, sans-serif; font-size: 13px; font-weight: 700; fill: #112024; text-anchor: middle; }
      .qr-caption { font-family: 'Segoe UI', Arial, sans-serif; font-size: 7.5px; font-weight: 700; fill: #20505c; text-anchor: middle; }
    </style>

    <!-- Certificate ID (Top-Left positioned in clean white margin above #startupindia) -->
    <text x="180" y="88" class="cert-id">Certificate ID: <tspan fill="#155e75">${certNumber}</tspan></text>

    <!-- Candidate Name (Positioned right above flourish ornament in soft teal serif) -->
    <text x="512" y="340" class="name">${name}</text>

    <!-- Body Text (Positioned right below flourish ornament) -->
    <text x="512" y="402" class="body-role">For successfully completing the <tspan font-weight="bold">"${role} at Praman Network"</tspan></text>
    <text x="512" y="423" class="body-text">held between ${startFmt} and ${endFmt}. Your effort during the internship have not only</text>
    <text x="512" y="442" class="body-text">contributed to our success but also reflected your readiness for greater responsibilities.</text>

    <!-- Date of issue -->
    <text x="512" y="500" class="date">Date: ${issueDateFmt}</text>

    <!-- QR Container frame (Bottom Left) -->
    <rect x="74" y="578" width="66" height="66" rx="4" fill="#ffffff" stroke="#cedde0" stroke-width="1.5"/>
    <text x="107" y="656" class="qr-caption">Scan to verify</text>
  </svg>
  `;

  const finalImage = await sharp(masterPath)
    .composite([
      { input: Buffer.from(overlaySvg), top: 0, left: 0 },
      { input: resizedQr, top: 581, left: 77 },
    ])
    .png()
    .toFile(outPath);

  console.log('Successfully generated clean final preview:', outPath);
}

renderFinalPreview().catch(console.error);
