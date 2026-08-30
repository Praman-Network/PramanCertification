const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(__dirname, '..', 'public', 'certificate-assets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Startup India Logo SVG
const startupIndiaSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="640" height="160">
  <g transform="translate(10, 15)">
    <!-- Brand mark / steps -->
    <path d="M 180 50 L 205 50 L 205 32 L 220 32 L 220 18 L 240 18" fill="none" stroke="#f26522" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 195 56 L 210 56 L 210 65 L 225 65" fill="none" stroke="#7ac142" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- #startupindia text -->
    <text x="0" y="42" font-family="'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="34" font-weight="900" fill="#f26522">
      #startup<tspan fill="#f26522">india</tspan>
    </text>
  </g>
</svg>
`;

// 2. Praman Brand Logo SVG (Header)
const pramanHeaderSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 80" width="680" height="160">
  <g transform="translate(10, 12)">
    <!-- Hexagonal P Icon -->
    <path d="M 35 5 L 60 19 L 60 47 L 35 61 L 10 47 L 10 19 Z" fill="none" stroke="#0e1726" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round"/>
    <!-- Inner P ribbon -->
    <path d="M 24 45 L 24 23 L 42 23 L 48 29 L 48 35 L 42 41 L 24 41" fill="none" stroke="#0e1726" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Wordmark -->
    <text x="75" y="44" font-family="'Space Grotesk', 'Segoe UI', Arial, sans-serif" font-size="38" font-weight="800" fill="#0e1726" letter-spacing="2.5">
      PRAMAN
    </text>
  </g>
</svg>
`;

// 3. MSME Logo SVG
const msmeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 100" width="680" height="200">
  <g transform="translate(10, 10)">
    <!-- Ashoka Lion Capital Emblem -->
    <g transform="translate(0, 0) scale(0.65)">
      <!-- Lion heads representation -->
      <path d="M 28 8 C 22 8 18 13 18 20 C 18 25 21 30 25 33 L 25 50 C 20 50 15 54 15 60 L 45 60 C 45 54 40 50 35 50 L 35 33 C 39 30 42 25 42 20 C 42 13 38 8 32 8" fill="#4a5568"/>
      <circle cx="23" cy="18" r="3" fill="#2d3748"/>
      <circle cx="37" cy="18" r="3" fill="#2d3748"/>
      <circle cx="30" cy="16" r="3.5" fill="#2d3748"/>
      <!-- Base & Ashoka Chakra -->
      <rect x="10" y="62" width="40" height="8" rx="2" fill="#4a5568"/>
      <circle cx="30" cy="66" r="3.5" fill="none" stroke="#ffffff" stroke-width="1"/>
      <rect x="6" y="72" width="48" height="5" rx="1" fill="#4a5568"/>
      <text x="30" y="85" font-family="'Segoe UI', Arial, sans-serif" font-size="8" font-weight="bold" text-anchor="middle" fill="#4a5568">सत्यमेव जयते</text>
    </g>

    <!-- MSME Bilingual branding -->
    <g transform="translate(48, 8)">
      <text x="0" y="32" font-family="'Arial Black', Impact, sans-serif" font-size="34" font-weight="900" fill="#e52427" letter-spacing="2">
        MSME
      </text>
      <text x="0" y="52" font-family="'Segoe UI', 'Noto Sans Devanagari', Arial, sans-serif" font-size="11" font-weight="bold" fill="#2d3748">
        सूक्ष्म, लघु एवं मध्यम उद्यम
      </text>
      <text x="0" y="66" font-family="'Segoe UI', Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#4a5568" letter-spacing="0.5">
        MICRO, SMALL &amp; MEDIUM ENTERPRISES
      </text>
    </g>
  </g>
</svg>
`;

// 4. Circular Praman Trademark Stamp SVG
const sealSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="480" height="480">
  <defs>
    <path id="textPathTop" d="M 30,120 A 90,90 0 0,1 210,120" />
    <path id="textPathBottom" d="M 210,120 A 90,90 0 0,1 30,120" />
  </defs>
  
  <!-- Outer double rings -->
  <circle cx="120" cy="120" r="114" fill="none" stroke="#2b6b88" stroke-width="3" />
  <circle cx="120" cy="120" r="108" fill="none" stroke="#2b6b88" stroke-width="1.5" />
  <circle cx="120" cy="120" r="76" fill="none" stroke="#2b6b88" stroke-width="2" />
  
  <!-- Circular text TOP: TRADEMARK TM -->
  <text font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#2b6b88" letter-spacing="4">
    <textPath href="#textPathTop" startOffset="50%" text-anchor="middle">
      ★ TRADEMARK ™ ★
    </textPath>
  </text>
  
  <!-- Circular text BOTTOM: PRAMAN NETWORK -->
  <text font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#2b6b88" letter-spacing="3">
    <textPath href="#textPathBottom" startOffset="50%" text-anchor="middle">
      • PRAMAN NETWORK •
    </textPath>
  </text>
  
  <!-- Center Hexagon & P symbol -->
  <g transform="translate(120, 120) scale(0.95)">
    <path d="M 0 -42 L 36 -21 L 36 21 L 0 42 L -36 21 L -36 -21 Z" fill="none" stroke="#2b6b88" stroke-width="4.5" stroke-linejoin="round" />
    <path d="M -16 23 L -16 -18 L 12 -18 C 22 -18 22 5 12 5 L -16 5" fill="none" stroke="#2b6b88" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    <text x="0" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="8" font-weight="bold" fill="#2b6b88" text-anchor="middle">TM</text>
  </g>
</svg>
`;

// 5. Rahul Chaudhary Authentic Signature SVG
const signatureSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 100" width="480" height="200">
  <g transform="translate(15, 10)">
    <!-- Flowing elegant cursive 'Rahul' signature -->
    <path d="M 30 75 C 25 45 40 15 50 12 C 58 10 65 18 52 45 C 45 60 38 78 55 75 C 65 72 80 50 85 45 C 90 40 98 42 92 56 C 88 66 84 76 96 74 C 104 72 118 42 122 38 C 126 34 134 40 130 52 C 126 64 122 75 136 72 C 146 70 162 25 168 18 C 172 12 178 18 174 35 C 170 52 165 76 182 72 C 195 68 208 55 215 50" 
          fill="none" stroke="#1c2d37" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Flourish loop and baseline stroke -->
    <path d="M 45 35 C 90 20 160 25 210 40" fill="none" stroke="#1c2d37" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/>
  </g>
</svg>
`;

// 6. Name Underline Decorative Flourish SVG
const flourishSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 40" width="1000" height="80">
  <g transform="translate(250, 20)">
    <!-- Center diamond and curves -->
    <circle cx="0" cy="0" r="3" fill="#6ba3b0" />
    <path d="M -15 0 C -40 -12 -90 12 -150 -2 C -180 -9 -210 2 -230 0" fill="none" stroke="#8cbcc6" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M 15 0 C 40 -12 90 12 150 -2 C 180 -9 210 2 230 0" fill="none" stroke="#8cbcc6" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M -15 4 C -50 14 -110 -8 -170 0" fill="none" stroke="#b4d7de" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>
    <path d="M 15 4 C 50 14 110 -8 170 0" fill="none" stroke="#b4d7de" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>
  </g>
</svg>
`;

// 7. Full High-Res Background Template SVG with exact geometric corners & frames
// Standard A4 Landscape: 1754 x 1240 px (300 DPI for A4 landscape)
const certBackgroundSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1754 1240" width="1754" height="1240">
  <defs>
    <!-- Halftone dot pattern for bottom-left -->
    <pattern id="halftonePattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="8" cy="8" r="2.2" fill="#7ba3a3" opacity="0.45" />
    </pattern>
  </defs>

  <!-- Clean Off-White Background -->
  <rect x="0" y="0" width="1754" height="1240" fill="#fcfdfe" />
  
  <!-- Subtle inner background card with soft drop shadow area -->
  <rect x="45" y="45" width="1664" height="1150" rx="8" fill="#ffffff" stroke="#e8eff0" stroke-width="1" />

  <!-- ==================== TOP LEFT GEOMETRIC CORNER ==================== -->
  <!-- Outermost dark polygon -->
  <polygon points="0,0 280,0 0,380" fill="#0b2c2c" />
  <!-- Mint diagonal accent facet -->
  <polygon points="0,380 280,0 350,0 120,440 0,440" fill="#beded9" opacity="0.9" />
  <!-- Secondary dark angled shape -->
  <polygon points="0,220 220,0 280,0 0,350" fill="#072020" />
  <!-- Sage facet strip -->
  <polygon points="120,440 350,0 380,0 160,450" fill="#78a8a2" opacity="0.8" />

  <!-- ==================== TOP RIGHT GEOMETRIC CORNER ==================== -->
  <!-- Outermost dark triangle -->
  <polygon points="1754,0 1480,0 1754,360" fill="#0b2c2c" />
  <!-- Mint facet strip -->
  <polygon points="1480,0 1400,0 1754,420 1754,360" fill="#beded9" opacity="0.9" />
  <!-- Deep inner facet -->
  <polygon points="1754,0 1560,0 1754,260" fill="#072020" />
  <!-- Sage facet -->
  <polygon points="1400,0 1360,0 1754,460 1754,420" fill="#78a8a2" opacity="0.7" />

  <!-- ==================== BOTTOM LEFT GEOMETRIC CORNER ==================== -->
  <!-- Halftone dotted grid corner section -->
  <rect x="80" y="940" width="220" height="220" fill="url(#halftonePattern)" />
  <!-- Halftone angle border lines -->
  <path d="M 80,940 L 80,1160 L 300,1160" fill="none" stroke="#7ba3a3" stroke-width="3" opacity="0.6"/>
  <!-- Outermost dark polygon -->
  <polygon points="0,1240 0,980 200,1240" fill="#0b2c2c" />
  <!-- Mint facet accent -->
  <polygon points="0,980 0,920 300,1240 200,1240" fill="#beded9" opacity="0.9" />
  <!-- Bottom-left inner facet -->
  <polygon points="0,1240 0,1080 120,1240" fill="#072020" />

  <!-- ==================== BOTTOM RIGHT GEOMETRIC CORNER ==================== -->
  <!-- Outermost deep dark forest shape -->
  <polygon points="1754,1240 1440,1240 1754,820" fill="#082323" />
  <!-- Mid-tone dark teal facet -->
  <polygon points="1754,1240 1560,1240 1754,960" fill="#0f3d3d" />
  <!-- Sage / teal diagonal polygon -->
  <polygon points="1440,1240 1350,1240 1754,720 1754,820" fill="#4d827e" />
  <!-- Mint high-contrast strip -->
  <polygon points="1350,1240 1270,1240 1754,620 1754,720" fill="#beded9" />
  <!-- Light sage polygon -->
  <polygon points="1270,1240 1210,1240 1754,540 1754,620" fill="#8cbab3" opacity="0.75" />

  <!-- ==================== INNER BORDER FRAME ==================== -->
  <rect x="75" y="60" width="1604" height="1120" fill="none" stroke="#0e3838" stroke-width="2.5" opacity="0.85" />
</svg>
`;

async function generateAll() {
  console.log('Generating high-resolution certificate assets...');

  // Save SVGs
  fs.writeFileSync(path.join(outDir, 'startupindia.svg'), startupIndiaSvg.trim());
  fs.writeFileSync(path.join(outDir, 'praman-header.svg'), pramanHeaderSvg.trim());
  fs.writeFileSync(path.join(outDir, 'msme.svg'), msmeSvg.trim());
  fs.writeFileSync(path.join(outDir, 'seal.svg'), sealSvg.trim());
  fs.writeFileSync(path.join(outDir, 'signature-rahul.svg'), signatureSvg.trim());
  fs.writeFileSync(path.join(outDir, 'flourish.svg'), flourishSvg.trim());
  fs.writeFileSync(path.join(outDir, 'cert-background.svg'), certBackgroundSvg.trim());

  // Generate crisp PNGs using sharp
  await sharp(Buffer.from(startupIndiaSvg)).png().toFile(path.join(outDir, 'startupindia.png'));
  await sharp(Buffer.from(pramanHeaderSvg)).png().toFile(path.join(outDir, 'praman-header.png'));
  await sharp(Buffer.from(msmeSvg)).png().toFile(path.join(outDir, 'msme.png'));
  await sharp(Buffer.from(sealSvg)).png().toFile(path.join(outDir, 'seal.png'));
  await sharp(Buffer.from(signatureSvg)).png().toFile(path.join(outDir, 'signature-rahul.png'));
  await sharp(Buffer.from(flourishSvg)).png().toFile(path.join(outDir, 'flourish.png'));
  await sharp(Buffer.from(certBackgroundSvg)).png().toFile(path.join(outDir, 'cert-background.png'));

  console.log('All high-resolution certificate assets generated successfully in:', outDir);
}

generateAll().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
