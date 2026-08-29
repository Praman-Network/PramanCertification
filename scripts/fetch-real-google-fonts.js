const fs = require('fs');
const path = require('path');
const https = require('https');

const fontDir = path.join(__dirname, '..', 'public', 'fonts');

function getBuffer(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return getBuffer(res.headers.location, headers).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed ${url}: status ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function fetchFonts() {
  console.log('Fetching true TTF binaries via Google Fonts API...');
  // User agent for TTF format from Google Fonts CSS
  const userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';

  const families = [
    { name: 'Cinzel-Bold.ttf', family: 'Cinzel:wght@700' },
    { name: 'Cinzel-Regular.ttf', family: 'Cinzel:wght@400' },
    { name: 'CinzelDecorative-Bold.ttf', family: 'Cinzel+Decorative:wght@700' },
    { name: 'Montserrat-Regular.ttf', family: 'Montserrat:wght@400' },
    { name: 'Montserrat-Medium.ttf', family: 'Montserrat:wght@500' },
    { name: 'Montserrat-Bold.ttf', family: 'Montserrat:wght@700' },
    { name: 'CormorantGaramond-Bold.ttf', family: 'Cormorant+Garamond:wght@700' }
  ];

  for (const item of families) {
    try {
      const cssUrl = `https://fonts.googleapis.com/css2?family=${item.family}`;
      const cssBuf = await getBuffer(cssUrl, { 'User-Agent': userAgent });
      const css = cssBuf.toString('utf8');
      const match = css.match(/src:\s*url\((https:\/\/[^)]+)\)/);
      if (match && match[1]) {
        const fontUrl = match[1];
        const fontBuf = await getBuffer(fontUrl);
        const dest = path.join(fontDir, item.name);
        fs.writeFileSync(dest, fontBuf);
        console.log(`✓ Downloaded ${item.name} (${fontBuf.length} bytes)`);
      } else {
        console.log(`Could not find src url in CSS for ${item.family}`);
      }
    } catch (e) {
      console.error(`Error for ${item.name}:`, e.message);
    }
  }

  // Verify all fonts with fontkit
  const fontkit = require('@pdf-lib/fontkit');
  for (const file of fs.readdirSync(fontDir)) {
    try {
      const buf = fs.readFileSync(path.join(fontDir, file));
      const parsed = fontkit.create(buf);
      console.log(`✓ Fontkit verified: ${file} (${parsed.postscriptName || parsed.fullName})`);
    } catch (e) {
      console.log(`✗ Fontkit failed for ${file}: ${e.message}`);
    }
  }
}

fetchFonts().catch(console.error);
