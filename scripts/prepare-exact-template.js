const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function createPixelPerfectTemplate() {
  const refImgPath = 'C:/Users/khush/.gemini/antigravity-ide/brain/3fb308dc-d5f1-492b-be5a-bc191f0f0f2e/.user_uploaded/media_1787661981188.png';
  const outDir = path.join(__dirname, '..', 'public', 'certificate-assets');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Load the reference image (1024 x 723)
  const image = sharp(refImgPath);
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;

  // Clean patch that covers only the recipient name, old flourish, body text, and old date
  // Start from y: 288 (keeping "This certificate is proudly presented to" completely intact!) down to y: 535
  const clearBoxSvg = `
  <svg width="${width}" height="${height}">
    <rect x="135" y="288" width="754" height="245" fill="#ffffff" />
  </svg>
  `;

  const cleanTemplate = await sharp(refImgPath)
    .composite([{ input: Buffer.from(clearBoxSvg), top: 0, left: 0 }])
    .png()
    .toBuffer();

  const templatePath = path.join(outDir, 'official-base-template.png');
  fs.writeFileSync(templatePath, cleanTemplate);
  console.log('Saved clean base template to:', templatePath);

  // Clean flourish divider SVG
  const flourishSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 40" width="500" height="40">
    <g transform="translate(250, 20)">
      <circle cx="0" cy="0" r="3" fill="#6ba3b0" />
      <path d="M -12 0 C -35 -10 -80 10 -140 -2 C -170 -8 -195 2 -215 0" fill="none" stroke="#7eb4be" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M 12 0 C 35 -10 80 10 140 -2 C 170 -8 195 2 215 0" fill="none" stroke="#7eb4be" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M -12 4 C -45 12 -95 -6 -150 0" fill="none" stroke="#a4d1d9" stroke-width="1.4" stroke-linecap="round" opacity="0.85"/>
      <path d="M 12 4 C 45 12 95 -6 150 0" fill="none" stroke="#a4d1d9" stroke-width="1.4" stroke-linecap="round" opacity="0.85"/>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(flourishSvg))
    .png()
    .toFile(path.join(outDir, 'clean-flourish.png'));

  console.log('Generated clean flourish divider');
}

createPixelPerfectTemplate().catch(console.error);
