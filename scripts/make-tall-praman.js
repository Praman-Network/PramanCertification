const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function createTallPramanLogo() {
  const assetDir = path.join(__dirname, '..', 'public', 'certificate-assets');
  const outPath = path.join(assetDir, 'praman-black.png');

  // Tall, elegant hexagon icon + Montserrat PRAMAN wordmark
  const pramanSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 140" width="560" height="140">
    <g transform="translate(10, 10)">
      <!-- Tall Hexagonal Outline -->
      <path d="M 60 10 L 110 38 L 110 92 L 60 120 L 10 92 L 10 38 Z" fill="none" stroke="#0e1726" stroke-width="10.5" stroke-linejoin="round" stroke-linecap="round"/>
      <!-- Inner P Ribbon (Tall & Crisp) -->
      <path d="M 36 88 L 36 46 L 72 46 L 85 58 L 85 70 L 72 82 L 36 82" fill="none" stroke="#0e1726" stroke-width="10.5" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- PRAMAN Montserrat wordmark with wide letter spacing -->
      <text x="140" y="82" font-family="'Montserrat', 'Segoe UI', Arial, sans-serif" font-size="64" font-weight="700" fill="#0e1726" letter-spacing="7px">
        PRAMAN
      </text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(pramanSvg)).png().toFile(outPath);
  console.log('Created tall unsuppressed praman-black.png at:', outPath);
}

createTallPramanLogo().catch(console.error);
