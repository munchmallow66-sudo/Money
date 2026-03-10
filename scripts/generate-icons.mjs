import sharp from 'sharp';
import path from 'path';

const projectRoot = 'd:/All-Project/money_summary';
const inputFile = path.join(projectRoot, 'public', 'logo.png');
const iconsDir = path.join(projectRoot, 'public', 'icons');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function main() {
  console.log('Generating icons from logo.png...');
  
  for (const size of sizes) {
    const outputFile = path.join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(inputFile)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(outputFile);
    console.log(`  ✅ icon-${size}x${size}.png`);
  }

  // Maskable icon (512x512 with padding for safe zone)
  const maskableOutput = path.join(iconsDir, 'maskable-icon.png');
  await sharp(inputFile)
    .resize(410, 410, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 15, g: 23, b: 42, alpha: 255 }
    })
    .png()
    .toFile(maskableOutput);
  console.log('  ✅ maskable-icon.png');

  // favicon sizes
  const favicon32 = path.join(projectRoot, 'public', 'favicon-32x32.png');
  await sharp(inputFile)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(favicon32);
  console.log('  ✅ favicon-32x32.png');

  const favicon16 = path.join(projectRoot, 'public', 'favicon-16x16.png');
  await sharp(inputFile)
    .resize(16, 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(favicon16);
  console.log('  ✅ favicon-16x16.png');

  // apple-touch-icon (180x180)
  const appleIcon = path.join(projectRoot, 'public', 'apple-touch-icon.png');
  await sharp(inputFile)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(appleIcon);
  console.log('  ✅ apple-touch-icon.png');

  console.log('\nDone! All icons generated successfully. 🎉');
}

main().catch(console.error);
