const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function fixLogos() {
  const assetDir = path.join(__dirname, '..', 'public', 'certificate-assets');

  // 1. Perfect #startupindia Logo (pure vector clean, zero background artifacts)
  const startupIndiaSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 200" width="920" height="200">
    <g transform="translate(10, 10)">
      <!-- #startupindia text -->
      <text x="10" y="125" font-family="'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="124" font-weight="900" fill="#f36f21">#startup<tspan fill="#f36f21">ind</tspan><tspan fill="#00aeef">i</tspan><tspan fill="#f36f21">a</tspan></text>
      <!-- lime green dot on i -->
      <circle cx="718" cy="24" r="14" fill="#8dc63f"/>
      <!-- green step line -->
      <path d="M 645 180 L 730 180 L 730 135 L 775 135" fill="none" stroke="#8dc63f" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>
  `;
  await sharp(Buffer.from(startupIndiaSvg)).png().toFile(path.join(assetDir, 'startupindia.png'));
  console.log('✓ Created clean transparent startupindia.png');

  // 2. Real Praman Logo from public/praman-logo.png (converted to solid black #0e1726)
  const realPramanSource = path.join(__dirname, '..', 'public', 'praman-logo.png');
  const img = sharp(realPramanSource);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  // Convert non-transparent pixels to dark charcoal/black #0e1726
  for (let i = 0; i < data.length; i += info.channels) {
    const alpha = data[i + 3];
    if (alpha > 15) {
      data[i] = 14;     // R
      data[i + 1] = 23; // G
      data[i + 2] = 38; // B
    }
  }

  // Trim whitespace around the logo so it scales naturally without being suppressed
  const blackLogoBuf = await sharp(data, { raw: info }).trim().png().toBuffer();
  await sharp(blackLogoBuf).toFile(path.join(assetDir, 'praman-black.png'));
  console.log('✓ Created trimmed authentic real praman-black.png');
}

fixLogos().catch(console.error);
