const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function convertSvgToPng(filename, size, outputFilename) {
  const inputPath = path.join(iconsDir, filename);
  const outputPath = path.join(iconsDir, outputFilename);

  try {
    await sharp(inputPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✓ Created ${outputFilename}`);
  } catch (error) {
    console.error(`✗ Failed to create ${outputFilename}:`, error.message);
  }
}

async function generateIcons() {
  console.log('Generating PNG icons...\n');

  // Generate regular icons
  for (const size of sizes) {
    await convertSvgToPng(`icon-${size}x${size}.svg`, size, `icon-${size}x${size}.png`);
  }

  // Generate maskable icon
  await convertSvgToPng('maskable-icon.svg', 512, 'maskable-icon.png');

  console.log('\n✅ All PNG icons generated successfully!');
}

generateIcons().catch(console.error);
