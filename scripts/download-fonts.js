const fs = require('fs');
const path = require('path');
const https = require('https');

const fontDir = path.join(__dirname, '..', 'public', 'fonts');
if (!fs.existsSync(fontDir)) {
  fs.mkdirSync(fontDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status: ${res.statusCode} for ${url}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function fetchGoogleFonts() {
  const fontUrls = [
    {
      name: 'Cinzel-Bold.ttf',
      url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/cinzel/static/Cinzel-Bold.ttf'
    },
    {
      name: 'Cinzel-Regular.ttf',
      url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/cinzel/static/Cinzel-Regular.ttf'
    },
    {
      name: 'CinzelDecorative-Bold.ttf',
      url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/cinzeldecorative/CinzelDecorative-Bold.ttf'
    },
    {
      name: 'Montserrat-Regular.ttf',
      url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/static/Montserrat-Regular.ttf'
    },
    {
      name: 'Montserrat-Bold.ttf',
      url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/static/Montserrat-Bold.ttf'
    },
    {
      name: 'Montserrat-SemiBold.ttf',
      url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/static/Montserrat-SemiBold.ttf'
    }
  ];

  for (const item of fontUrls) {
    const dest = path.join(fontDir, item.name);
    try {
      console.log(`Downloading ${item.name}...`);
      await download(item.url, dest);
      console.log(`✓ ${item.name} (${fs.statSync(dest).size} bytes)`);
    } catch (e) {
      console.log(`Fallback for ${item.name}: ${e.message}`);
    }
  }
}

fetchGoogleFonts().catch(console.error);
