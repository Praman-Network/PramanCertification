const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetDir = path.join(__dirname, '..', 'public', 'certificate-assets');

async function processAssets() {
  console.log('Processing official assets in:', assetDir);

  // 1. Template base (2448 x 1728)
  const rawTemplate = path.join(assetDir, 'template.png');

  // 2. Trademark seal
  const rawTrademark = path.join(assetDir, 'trademark.png');

  // 3. Perfect #startupindia Logo (no space, exact official colors)
  const startupIndiaSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 204" width="920" height="204">
    <g transform="translate(10, 10)">
      <!-- #startupindia text -->
      <text x="10" y="125" font-family="'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="124" font-weight="900" fill="#f36f21">#startup<tspan fill="#f36f21">ind</tspan><tspan fill="#00aeef">i</tspan><tspan fill="#f36f21">a</tspan></text>
      <!-- i dot in lime green -->
      <circle cx="718" cy="24" r="14" fill="#8dc63f"/>
      <!-- Green step line under i -->
      <path d="M 645 180 L 730 180 L 730 135 L 775 135" fill="none" stroke="#8dc63f" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>
  `;
  await sharp(Buffer.from(startupIndiaSvg)).png().toFile(path.join(assetDir, 'startupindia.png'));

  // 4. Center Praman Header Logo & Wordmark
  const pramanHeaderSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 130" width="540" height="130">
    <g transform="translate(10, 15)">
      <!-- Hexagonal outline -->
      <path d="M 52 10 L 92 33 L 92 79 L 52 102 L 12 79 L 12 33 Z" fill="none" stroke="#0e1726" stroke-width="8.5" stroke-linejoin="round" stroke-linecap="round"/>
      <!-- Inner P ribbon -->
      <path d="M 33 76 L 33 40 L 62 40 L 72 50 L 72 60 L 62 70 L 33 70" fill="none" stroke="#0e1726" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- PRAMAN text -->
      <text x="120" y="74" font-family="'Space Grotesk', 'Segoe UI', Arial, sans-serif" font-size="60" font-weight="800" fill="#0e1726" letter-spacing="4.5">
        PRAMAN
      </text>
    </g>
  </svg>
  `;
  await sharp(Buffer.from(pramanHeaderSvg)).png().toFile(path.join(assetDir, 'praman-header.png'));

  console.log('Processed all assets perfectly!');
}

processAssets().catch(console.error);
