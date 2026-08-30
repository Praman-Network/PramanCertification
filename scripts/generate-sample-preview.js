const sharp = require('sharp');
const path = require('path');
const QRCode = require('qrcode');
const fs = require('fs');

async function renderSamplePreview() {
  const baseTemplatePath = path.join(__dirname, '..', 'public', 'certificate-assets', 'official-base-template.png');
  const flourishPath = path.join(__dirname, '..', 'public', 'certificate-assets', 'clean-flourish.png');
  const outPath = path.join(__dirname, '..', 'public', 'certificate-preview-sample.png');

  const certNumber = 'CERT-2026-00012';
  const name = 'Diya Sen';
  const role = 'UI/UX Designer Intern';
  const startFmt = 'June 2026';
  const endFmt = 'September 2026';
  const issueDateFmt = 'August 25, 2026';

  // Generate QR Buffer
  const qrBuffer = await QRCode.toBuffer('http://localhost:3000/verify?certId=' + certNumber, {
    width: 140,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' }
  });

  // Create SVG text overlay (1024 x 723)
  const overlaySvg = `
  <svg width="1024" height="723" xmlns="http://www.w3.org/2000/svg">
    <style>
      .cert-id { font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 700; fill: #07262c; letter-spacing: 0.6px; }
      .name { font-family: 'Georgia', 'Times New Roman', serif; font-size: 40px; font-weight: bold; fill: #2a7487; text-anchor: middle; }
      .body-role { font-family: 'Segoe UI', Roboto, Arial, sans-serif; font-size: 13.5px; font-weight: 600; fill: #1c2e32; text-anchor: middle; }
      .body-text { font-family: 'Segoe UI', Roboto, Arial, sans-serif; font-size: 12.5px; font-weight: 400; fill: #334a50; text-anchor: middle; }
      .date { font-family: 'Segoe UI', Roboto, Arial, sans-serif; font-size: 13px; font-weight: 700; fill: #112226; text-anchor: middle; }
      .qr-caption { font-family: 'Segoe UI', Roboto, Arial, sans-serif; font-size: 9px; font-weight: 700; fill: #2a5b67; text-anchor: middle; }
    </style>

    <!-- Certificate ID (Top-Left in clean white space above #startupindia) -->
    <text x="175" y="90" class="cert-id">Certificate ID: <tspan fill="#155e75">${certNumber}</tspan></text>

    <!-- Candidate Name (Centered) -->
    <text x="512" y="342" class="name">${name}</text>

    <!-- Body text -->
    <text x="512" y="398" class="body-role">For successfully completing the <tspan font-weight="bold">"${role} at Praman Network"</tspan></text>
    <text x="512" y="418" class="body-text">held between ${startFmt} and ${endFmt}. Your effort during the internship have not only</text>
    <text x="512" y="436" class="body-text">contributed to our success but also reflected your readiness for greater responsibilities.</text>

    <!-- Date of issue -->
    <text x="512" y="480" class="date">Date: ${issueDateFmt}</text>

    <!-- QR Container box (Bottom Left) -->
    <rect x="68" y="582" width="74" height="74" rx="4" fill="#ffffff" stroke="#cddde0" stroke-width="1.5"/>
    <text x="105" y="670" class="qr-caption">Scan to verify</text>
  </svg>
  `;

  // Rescale QR for composite
  const resizedQr = await sharp(qrBuffer).resize(66, 66).toBuffer();
  const flourishBuffer = fs.readFileSync(flourishPath);
  const resizedFlourish = await sharp(flourishBuffer).resize(200, 16).toBuffer();

  const finalImage = await sharp(baseTemplatePath)
    .composite([
      { input: resizedFlourish, top: 354, left: 412 },
      { input: Buffer.from(overlaySvg), top: 0, left: 0 },
      { input: resizedQr, top: 586, left: 72 },
    ])
    .png()
    .toFile(outPath);

  console.log('Generated updated sample preview image at:', outPath, finalImage);
}

renderSamplePreview().catch(console.error);
