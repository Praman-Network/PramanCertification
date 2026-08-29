const sharp = require('sharp');
const path = require('path');
const QRCode = require('qrcode');
const fs = require('fs');

async function renderFullyCodedMaster() {
  const assetDir = path.join(__dirname, '..', 'public', 'certificate-assets');
  const templatePath = path.join(assetDir, 'template.png'); // 2448 x 1728 master blank canvas
  const signaturePath = path.join(assetDir, 'signature.png');
  const trademarkPath = path.join(assetDir, 'trademark.png');
  const startupIndiaPath = path.join(assetDir, 'startupindia.png');
  const msmePath = path.join(assetDir, 'msme.png');
  const pramanLogoPath = path.join(assetDir, 'praman-black.png');
  const outPath = path.join(__dirname, '..', 'generated', 'sample-preview.png');

  const certNumber = 'CERT-2026-00033';
  const name = 'Diya Sen';
  const role = 'UI/UX Designer Intern';
  const startFmt = 'June 2026';
  const endFmt = 'September 2026';
  const issueDateFmt = 'August 27, 2026';

  const width = 2448;
  const height = 1728;

  // 1. Generate crisp high-resolution QR code
  const qrBuffer = await QRCode.toBuffer('http://localhost:3000/verify?certId=' + certNumber, {
    width: 400,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' }
  });
  const resizedQr = await sharp(qrBuffer).resize(200, 200).toBuffer();

  // 2. High resolution resized logos (Clean transparent Startup India, Authentic Black Praman, MSME, Trademark)
  const resizedStartup = await sharp(startupIndiaPath).resize(420).toBuffer();
  const resizedPraman = await sharp(pramanLogoPath).resize(450).toBuffer();
  const resizedMsme = await sharp(msmePath).resize(380).toBuffer();
  const resizedSig = await sharp(signaturePath).resize(360).toBuffer();
  const resizedTrademark = await sharp(trademarkPath).resize(310, 310).toBuffer();

  // 3. Crisp SVG overlay with Cinzel, Cinzel Decorative, and Montserrat fonts
  const overlaySvg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&amp;family=Cinzel+Decorative:wght@700&amp;family=Cormorant+Garamond:wght@600;700&amp;family=Montserrat:wght@400;500;600;700;800&amp;display=swap');
      .cert-id { font-family: 'Montserrat', 'Space Grotesk', 'Segoe UI', Arial, sans-serif; font-size: 28px; font-weight: 700; fill: #07262c; letter-spacing: 1px; }
      .main-title { font-family: 'Cinzel', 'Times New Roman', 'Georgia', serif; font-size: 114px; font-weight: 900; fill: #062222; letter-spacing: 8px; text-anchor: middle; }
      .sub-title { font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif; font-size: 42px; font-weight: 700; fill: #173237; letter-spacing: 11px; text-anchor: middle; }
      .intro { font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif; font-size: 32px; font-weight: 500; fill: #486066; text-anchor: middle; }
      .name { font-family: 'Cinzel Decorative', 'Cormorant Garamond', 'Georgia', serif; font-size: 135px; font-weight: 700; fill: #2a768c; text-anchor: middle; letter-spacing: 1.5px; }
      .body-role { font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif; font-size: 35px; font-weight: 400; fill: #162428; text-anchor: middle; }
      .body-text { font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif; font-size: 32px; font-weight: 500; fill: #24393e; text-anchor: middle; }
      .date { font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif; font-size: 36px; font-weight: 700; fill: #0b1a1c; text-anchor: middle; }
      .qr-caption { font-family: 'Montserrat', Arial, sans-serif; font-size: 22px; font-weight: 700; fill: #205360; text-anchor: middle; letter-spacing: 0.8px; }
      .signer-name { font-family: 'Montserrat', Arial, sans-serif; font-size: 34px; font-weight: 700; fill: #164f5e; text-anchor: middle; }
      .signer-title { font-family: 'Montserrat', Arial, sans-serif; font-size: 26px; font-weight: 500; fill: #526b71; text-anchor: middle; }
    </style>

    <!-- Certificate ID (Enlarged in clean space above #startupindia) -->
    <text x="290" y="190" class="cert-id">Certificate ID: <tspan fill="#155e75">${certNumber}</tspan></text>

    <!-- Title: CERTIFICATE in Cinzel -->
    <text x="1224" y="455" class="main-title">CERTIFICATE</text>

    <!-- Subtitle: OF COMPLETION in Montserrat -->
    <text x="1224" y="528" class="sub-title">OF COMPLETION</text>

    <!-- Intro: This certificate is proudly presented to in Montserrat -->
    <text x="1224" y="608" class="intro">This certificate is proudly presented to</text>

    <!-- Candidate Name in Cinzel Decorative (Title Case, prominent above flourish line) -->
    <text x="1224" y="798" class="name">${name}</text>

    <!-- Body Description: Bolded role and Praman Network with medium-bold supporting sentences -->
    <text x="1224" y="980" class="body-role">For successfully completing the "<tspan font-weight="700">${role}</tspan> at <tspan font-weight="700">Praman Network</tspan>"</text>
    <text x="1224" y="1042" class="body-text">held between ${startFmt} and ${endFmt}. Your effort during the internship have not only</text>
    <text x="1224" y="1092" class="body-text">contributed to our success but also reflected your readiness for greater responsibilities.</text>

    <!-- Date of Issue in Montserrat Bold -->
    <text x="1224" y="1205" class="date">Date: ${issueDateFmt}</text>

    <!-- QR Container (Bottom-Left with safe generous margins) -->
    <rect x="285" y="1280" width="215" height="215" rx="8" fill="#ffffff" stroke="#c8d9dc" stroke-width="3"/>
    <text x="392" y="1530" class="qr-caption">Scan to verify</text>

    <!-- Founder underline and title (Bottom-Center) -->
    <line x1="984" y1="1445" x2="1464" y2="1445" stroke="#9bb1b7" stroke-width="2.5" />
    <text x="1224" y="1495" class="signer-name">Rahul Chaudhary</text>
    <text x="1224" y="1538" class="signer-title">Founder</text>
  </svg>
  `;

  const finalImage = await sharp(templatePath)
    .composite([
      // Top Header Logos
      { input: resizedStartup, top: 228, left: 290 },
      { input: resizedPraman, top: 218, left: Math.round((width - 450) / 2) },
      { input: resizedMsme, top: 215, left: width - 290 - 380 },
      // All Vector Text and Structural Shapes
      { input: Buffer.from(overlaySvg), top: 0, left: 0 },
      // QR Code
      { input: resizedQr, top: 1288, left: 293 },
      // Signature
      { input: resizedSig, top: 1315, left: Math.round((width - 360) / 2) },
      // Trademark Seal
      { input: resizedTrademark, top: 1225, left: width - 290 - 310 },
    ])
    .png()
    .toFile(outPath);

  console.log('Successfully generated updated composite preview at:', outPath);
}

renderFullyCodedMaster().catch(console.error);
