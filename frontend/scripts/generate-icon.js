import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');

const svgPath = join(rootDir, 'frontend', 'public', 'icon.svg');
const outputPath = join(rootDir, 'build', 'appicon.png');

async function generateIcon() {
  try {
    // Ensure build directory exists
    mkdirSync(join(rootDir, 'build'), { recursive: true });

    // Read SVG
    const svgBuffer = readFileSync(svgPath);

    // macOS Big Sur style: rounded rectangle with 22% corner radius
    const size = 1024;
    const padding = Math.round(size * 0.15); // 15% padding
    const cornerRadius = Math.round(size * 0.22); // Big Sur uses ~22% radius
    
    // Convert SVG to PNG with padding for inner icon
    const iconPng = await sharp(svgBuffer)
      .resize(size - padding * 2, size - padding * 2, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();

    // Create rounded rectangle mask
    const maskSvg = `
      <svg width="${size}" height="${size}">
        <rect x="0" y="0" width="${size}" height="${size}" rx="${cornerRadius}" ry="${cornerRadius}" fill="white"/>
      </svg>
    `;

    // Create gradient background (Big Sur style - subtle blue gradient)
    const backgroundSvg = `
      <svg width="${size}" height="${size}">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#60A5FA"/>
            <stop offset="100%" stop-color="#3B82F6"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${size}" height="${size}" rx="${cornerRadius}" ry="${cornerRadius}" fill="url(#bg)"/>
      </svg>
    `;

    // Composite: background + icon
    await sharp(Buffer.from(backgroundSvg))
      .composite([
        {
          input: iconPng,
          gravity: 'center'
        }
      ])
      .png()
      .toFile(outputPath);

    console.log('✓ macOS Big Sur style icon generated:', outputPath);
  } catch (error) {
    console.error('✗ Failed to generate icon:', error.message);
    process.exit(1);
  }
}

generateIcon();
