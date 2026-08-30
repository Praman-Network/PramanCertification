const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function createMasterReferenceTemplate() {
  const refImgPath = 'C:/Users/khush/.gemini/antigravity-ide/brain/3fb308dc-d5f1-492b-be5a-bc191f0f0f2e/.user_uploaded/media_1787661981188.png';
  const assetDir = path.join(__dirname, '..', 'public', 'certificate-assets');
  if (!fs.existsSync(assetDir)) {
    fs.mkdirSync(assetDir, { recursive: true });
  }

  // Load the authentic Reference Image 2 (1024 x 723)
  const image = sharp(refImgPath);
  const metadata = await image.metadata();
  const width = metadata.width;   // 1024
  const height = metadata.height; // 723

  // Clean patch that completely erases old name, body text, and date with zero ghost artifacts:
  // 1. Recipient name area: x: 140 to 884 (width 744), y: 288 to 358
  // 2. Body text area: x: 140 to 884, y: 380 to 470
  // 3. Date area: x: 340 to 684, y: 476 to 520
  const patchSvg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <!-- Patch 1: Erase old recipient name cleanly (keeps 'This certificate is proudly presented to' and the flourish ornament!) -->
    <rect x="140" y="288" width="744" height="70" fill="#ffffff" />

    <!-- Patch 2: Erase old body paragraph cleanly -->
    <rect x="140" y="380" width="744" height="90" fill="#ffffff" />

    <!-- Patch 3: Erase old date cleanly -->
    <rect x="340" y="476" width="344" height="42" fill="#ffffff" />
  </svg>
  `;

  const cleanMasterTemplate = await sharp(refImgPath)
    .composite([{ input: Buffer.from(patchSvg), top: 0, left: 0 }])
    .png()
    .toBuffer();

  const masterPath = path.join(assetDir, 'reference-master.png');
  fs.writeFileSync(masterPath, cleanMasterTemplate);
  console.log('Successfully created clean reference-master.png at:', masterPath);
}

createMasterReferenceTemplate().catch(console.error);
