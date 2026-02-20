const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const URL = 'https://github.com/ava-avant-iconic/aesthetic-qr-codes';

// Styles configuration
const styles = [
  {
    name: 'neon-glow',
    bgColor: '#0a0a0a',
    darkColor: '#00ffff',
    lightColor: '#0a0a0a'
  },
  {
    name: 'gradient-waves',
    bgColor: '#1a1a2e',
    darkColor: '#e94560',
    lightColor: '#1a1a2e'
  },
  {
    name: 'dot-matrix',
    bgColor: '#f8f9fa',
    darkColor: '#212529',
    lightColor: '#f8f9fa'
  },
  {
    name: 'crystal-shards',
    bgColor: '#2d3436',
    darkColor: '#74b9ff',
    lightColor: '#2d3436'
  },
  {
    name: 'organic-flow',
    bgColor: '#1e272e',
    darkColor: '#4cd137',
    lightColor: '#1e272e'
  },
  {
    name: 'cyber-punk',
    bgColor: '#000000',
    darkColor: '#ff003c',
    lightColor: '#000000'
  },
  {
    name: 'soft-bubbles',
    bgColor: '#ffeaa7',
    darkColor: '#fdcb6e',
    lightColor: '#ffeaa7'
  },
  {
    name: 'rainbow-gradient',
    bgColor: '#2c3e50',
    darkColor: '#3498db',
    lightColor: '#2c3e50'
  },
  {
    name: 'geometric-art',
    bgColor: '#34495e',
    darkColor: '#1abc9c',
    lightColor: '#34495e'
  },
  {
    name: 'neon-pulse',
    bgColor: '#0f0f23',
    darkColor: '#ff00ff',
    lightColor: '#0f0f23'
  },
  {
    name: 'sunburst',
    bgColor: '#2d1810',
    darkColor: '#ff6b35',
    lightColor: '#2d1810'
  },
  {
    name: 'ocean-deep',
    bgColor: '#0c2461',
    darkColor: '#4a90e2',
    lightColor: '#0c2461'
  },
  {
    name: 'forest-mystic',
    bgColor: '#1e3d59',
    darkColor: '#52b788',
    lightColor: '#1e3d59'
  },
  {
    name: 'aurora-borealis',
    bgColor: '#1a1a2e',
    darkColor: '#a8e6cf',
    lightColor: '#1a1a2e'
  },
  {
    name: 'digital-zigzag',
    bgColor: '#2c3e50',
    darkColor: '#e74c3c',
    lightColor: '#2c3e50'
  }
];

// Generate QR code
async function generateQRCode(style) {
  const canvas = createCanvas(300, 300);
  const ctx = canvas.getContext('2d');

  // Generate QR code with custom colors
  await QRCode.toCanvas(canvas, URL, {
    width: 300,
    margin: 0,
    errorCorrectionLevel: 'H',
    color: {
      dark: style.darkColor,
      light: style.lightColor
    }
  });

  // Add decorative border/corners
  ctx.strokeStyle = style.darkColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(5, 5, 290, 290);

  // Add corner markers
  const markerSize = 30;
  ctx.fillStyle = style.darkColor;

  // Top-left
  ctx.fillRect(10, 10, markerSize, markerSize);
  // Top-right
  ctx.fillRect(260, 10, markerSize, markerSize);
  // Bottom-left
  ctx.fillRect(10, 260, markerSize, markerSize);

  return canvas;
}

// Generate all styles
async function generateAll() {
  console.log(`Generating ${styles.length} QR code styles...`);

  for (const style of styles) {
    try {
      console.log(`  - ${style.name}...`);

      const canvas = await generateQRCode(style);

      const outputPath = path.join(__dirname, 'examples', `${style.name}.png`);
      const buffer = canvas.toBuffer('image/png');

      fs.writeFileSync(outputPath, buffer);
      console.log(`    ✓ Saved`);
    } catch (error) {
      console.error(`    ✗ Error:`, error.message);
    }
  }

  console.log('\n✅ All QR codes generated!');
}

generateAll().catch(console.error);
