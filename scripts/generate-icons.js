const fs = require('fs');
const path = require('path');

// SVG icon template
const createSvgIcon = (size, maskable = false) => {
  const padding = maskable ? Math.round(size * 0.1) : 0;
  const viewSize = maskable ? size : size;
  const circleRadius = maskable ? (size - padding * 2) * 0.4 : size * 0.31;
  const center = size / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#0f172a"/>
  <circle cx="${center}" cy="${center}" r="${circleRadius}" fill="#3b82f6"/>
  <circle cx="${center}" cy="${center}" r="${circleRadius * 0.5}" fill="#60a5fa"/>
  <circle cx="${center}" cy="${center}" r="${circleRadius * 0.25}" fill="#dbeafe"/>
  <text x="${center}" y="${size - (maskable ? padding * 2 : 20)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size * 0.125}" font-weight="bold" fill="#ffffff">฿</text>
</svg>`;
};

// Create maskable SVG (with safe zone)
const createMaskableSvg = (size) => {
  const safeZone = size * 0.8; // 80% safe zone
  const center = size / 2;
  const offset = (size - safeZone) / 2;
  const circleRadius = safeZone * 0.4;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#0f172a"/>
  <circle cx="${center}" cy="${center}" r="${circleRadius}" fill="#3b82f6"/>
  <circle cx="${center}" cy="${center}" r="${circleRadius * 0.5}" fill="#60a5fa"/>
  <circle cx="${center}" cy="${center}" r="${circleRadius * 0.25}" fill="#dbeafe"/>
  <text x="${center}" y="${size - offset - 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${safeZone * 0.2}" font-weight="bold" fill="#ffffff">฿</text>
</svg>`;
};

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons for each size
sizes.forEach(size => {
  const svg = createSvgIcon(size);
  const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filePath, svg);
  console.log(`Created ${filePath}`);
});

// Generate maskable icon
const maskableSvg = createMaskableSvg(512);
const maskablePath = path.join(iconsDir, 'maskable-icon.svg');
fs.writeFileSync(maskablePath, maskableSvg);
console.log(`Created ${maskablePath}`);

// Create a simple HTML page that can convert SVGs to PNGs using canvas
const converterHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Icon Converter</title>
</head>
<body>
  <h1>Icon Converter</h1>
  <p>Open browser console to see progress. Icons will be downloaded automatically.</p>
  <div id="output"></div>
  <script>
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    const output = document.getElementById('output');

    async function convertSvgToPng(svgText, size, filename) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, size, size);
          URL.revokeObjectURL(url);

          canvas.toBlob((blob) => {
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(downloadUrl);
            resolve();
          }, 'image/png');
        };
        img.onerror = reject;
        img.src = url;
      });
    }

    async function generateIcons() {
      for (const size of sizes) {
        const svg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \${size} \${size}">
  <rect width="\${size}" height="\${size}" fill="#0f172a"/>
  <circle cx="\${size/2}" cy="\${size/2}" r="\${size*0.31}" fill="#3b82f6"/>
  <circle cx="\${size/2}" cy="\${size/2}" r="\${size*0.155}" fill="#60a5fa"/>
  <circle cx="\${size/2}" cy="\${size/2}" r="\${size*0.0775}" fill="#dbeafe"/>
  <text x="\${size/2}" y="\${size-20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="\${size*0.125}" font-weight="bold" fill="#ffffff">฿</text>
</svg>\`;

        await convertSvgToPng(svg, size, \`icon-\${size}x\${size}.png\`);
        output.innerHTML += \`<p>✓ Generated icon-\${size}x\${size}.png</p>\`;
      }

      // Generate maskable icon (512x512)
      const maskableSize = 512;
      const safeZone = maskableSize * 0.8;
      const offset = (maskableSize - safeZone) / 2;
      const maskableSvg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0f172a"/>
  <circle cx="256" cy="256" r="160" fill="#3b82f6"/>
  <circle cx="256" cy="256" r="80" fill="#60a5fa"/>
  <circle cx="256" cy="256" r="40" fill="#dbeafe"/>
  <text x="256" y="\${512-offset-10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="#ffffff">฿</text>
</svg>\`;

      await convertSvgToPng(maskableSvg, 512, 'maskable-icon.png');
      output.innerHTML += \`<p>✓ Generated maskable-icon.png</p>\`;

      output.innerHTML += '<h2>All icons generated! Copy PNG files to public/icons/ folder.</h2>';
    }

    generateIcons().catch(console.error);
  </script>
</body>
</html>`;

const converterPath = path.join(__dirname, 'icon-converter.html');
fs.writeFileSync(converterPath, converterHtml);
console.log(`\nCreated ${converterPath}`);
console.log('\nTo generate PNG icons:');
console.log('1. Open scripts/icon-converter.html in a browser');
console.log('2. PNG files will be downloaded automatically');
console.log('3. Copy all downloaded PNG files to public/icons/ folder');
