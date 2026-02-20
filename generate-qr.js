const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const URL = 'https://github.com/ava-avant-iconic/aesthetic-qr-codes';

// Custom QR code shapes
const SHAPES = {
  circle: (ctx, x, y, size, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    ctx.fill();
  },
  dot: (ctx, x, y, size, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/3, 0, Math.PI * 2);
    ctx.fill();
  },
  diamond: (ctx, x, y, size, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + size/2, y);
    ctx.lineTo(x + size, y + size/2);
    ctx.lineTo(x + size/2, y + size);
    ctx.lineTo(x, y + size/2);
    ctx.closePath();
    ctx.fill();
  },
  hexagon: (ctx, x, y, size, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = x + size/2 + (size/2) * Math.cos(angle);
      const py = y + size/2 + (size/2) * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  },
  roundedSquare: (ctx, x, y, size, color, radius = 4) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, radius);
    ctx.fill();
  },
  star: (ctx, x, y, size, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    const cx = x + size/2;
    const cy = y + size/2;
    const outerRadius = size/2;
    const innerRadius = size/4;
    for (let i = 0; i < 5; i++) {
      const outerAngle = (Math.PI * 2 * i / 5) - Math.PI / 2;
      const innerAngle = (Math.PI * 2 * i / 5) - Math.PI / 2 + Math.PI / 5;

      if (i === 0) {
        ctx.moveTo(cx + outerRadius * Math.cos(outerAngle), cy + outerRadius * Math.sin(outerAngle));
      } else {
        ctx.lineTo(cx + outerRadius * Math.cos(outerAngle), cy + outerRadius * Math.sin(outerAngle));
      }
      ctx.lineTo(cx + innerRadius * Math.cos(innerAngle), cy + innerRadius * Math.sin(innerAngle));
    }
    ctx.closePath();
    ctx.fill();
  },
  heart: (ctx, x, y, size, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    const cx = x + size/2;
    const cy = y + size/2;
    const r = size/4;
    ctx.moveTo(cx, cy + r);
    ctx.bezierCurveTo(cx - size, cy - r, cx - size/2, cy - size/2, cx, cy - size/4);
    ctx.bezierCurveTo(cx + size/2, cy - size/2, cx + size, cy - r, cx, cy + r);
    ctx.fill();
  },
  rounded: (ctx, x, y, size, color, radius = 8) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, radius);
    ctx.fill();
  }
};

// Custom corner styles
const CORNER_STYLES = {
  standard: (ctx, x, y, size, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, size, size);
  },
  rounded: (ctx, x, y, size, color, radius = 8) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, radius);
    ctx.stroke();
  },
  doubleRounded: (ctx, x, y, size, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, size - 4, size - 4, 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(x + 6, y + 6, size - 12, size - 12, 4);
    ctx.stroke();
  },
  circleCorners: (ctx, x, y, size, color) => {
    ctx.fillStyle = color;
    const r = 4;
    ctx.beginPath();
    ctx.arc(x + r, y + r, r, 0, Math.PI * 2);
    ctx.arc(x + size - r, y + r, r, 0, Math.PI * 2);
    ctx.arc(x + r, y + size - r, r, 0, Math.PI * 2);
    ctx.arc(x + size - r, y + size - r, r, 0, Math.PI * 2);
    ctx.fill();
  },
  fancy: (ctx, x, y, size, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    // Decorative corner accents
    const accentSize = 8;
    ctx.beginPath();
    ctx.moveTo(x, y + accentSize);
    ctx.lineTo(x, y);
    ctx.lineTo(x + accentSize, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + size - accentSize, y);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x + size, y + accentSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y + size - accentSize);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x + accentSize, y + size);
    ctx.stroke();
  }
};

// QR code styles with custom shapes and corners
const styles = [
  {
    name: 'neon-circles',
    shape: 'circle',
    cornerStyle: 'rounded',
    bgColor: '#0a0a0a',
    dotColor: '#00ffff',
    accentColor: '#ff00ff'
  },
  {
    name: 'glow-dots',
    shape: 'dot',
    cornerStyle: 'circleCorners',
    bgColor: '#1a1a2e',
    dotColor: '#e94560',
    accentColor: '#ff6b6b'
  },
  {
    name: 'crystal-diamonds',
    shape: 'diamond',
    cornerStyle: 'doubleRounded',
    bgColor: '#2d3436',
    dotColor: '#74b9ff',
    accentColor: '#a29bfe'
  },
  {
    name: 'organic-hexagons',
    shape: 'hexagon',
    cornerStyle: 'fancy',
    bgColor: '#1e272e',
    dotColor: '#4cd137',
    accentColor: '#00b894'
  },
  {
    name: 'cyber-stars',
    shape: 'star',
    cornerStyle: 'standard',
    bgColor: '#000000',
    dotColor: '#ff003c',
    accentColor: '#ff6b35'
  },
  {
    name: 'soft-hearts',
    shape: 'heart',
    cornerStyle: 'rounded',
    bgColor: '#ffeaa7',
    dotColor: '#fdcb6e',
    accentColor: '#f39c12'
  },
  {
    name: 'tech-rounded',
    shape: 'roundedSquare',
    cornerStyle: 'doubleRounded',
    bgColor: '#2c3e50',
    dotColor: '#3498db',
    accentColor: '#2980b9'
  },
  {
    name: 'geometric-squares',
    shape: 'rounded',
    cornerStyle: 'rounded',
    bgColor: '#34495e',
    dotColor: '#1abc9c',
    accentColor: '#16a085'
  },
  {
    name: 'neon-pulse-circles',
    shape: 'circle',
    cornerStyle: 'standard',
    bgColor: '#0f0f23',
    dotColor: '#ff00ff',
    accentColor: '#00ffff'
  },
  {
    name: 'warm-dots',
    shape: 'dot',
    cornerStyle: 'fancy',
    bgColor: '#2d1810',
    dotColor: '#ff6b35',
    accentColor: '#f39c12'
  },
  {
    name: 'ocean-hexagons',
    shape: 'hexagon',
    cornerStyle: 'rounded',
    bgColor: '#0c2461',
    dotColor: '#4a90e2',
    accentColor: '#74b9ff'
  },
  {
    name: 'forest-diamonds',
    shape: 'diamond',
    cornerStyle: 'circleCorners',
    bgColor: '#1e3d59',
    dotColor: '#52b788',
    accentColor: '#a8e6cf'
  },
  {
    name: 'aurora-hearts',
    shape: 'heart',
    cornerStyle: 'doubleRounded',
    bgColor: '#1a1a2e',
    dotColor: '#a8e6cf',
    accentColor: '#74b9ff'
  },
  {
    name: 'digital-stars',
    shape: 'star',
    cornerStyle: 'fancy',
    bgColor: '#2c3e50',
    dotColor: '#e74c3c',
    accentColor: '#f39c12'
  },
  {
    name: 'bubble-circles',
    shape: 'circle',
    cornerStyle: 'circleCorners',
    bgColor: '#ffe4e1',
    dotColor: '#ff69b4',
    accentColor: '#ff1493'
  }
];

// Draw custom shaped QR code
async function drawCustomQR(style) {
  const canvas = createCanvas(300, 300);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = style.bgColor;
  ctx.fillRect(0, 0, 300, 300);

  // Get QR matrix data
  const qrData = await QRCode.toDataURL(URL, {
    width: 250,
    margin: 0,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });

  // Load QR image
  const qrImage = await loadImage(qrData);

  // Draw QR code with custom shapes
  const qrSize = 250;
  const startX = 25;
  const startY = 25;
  const moduleCount = 25; // QR version 2
  const moduleSize = qrSize / moduleCount;

  // Create temporary canvas to read pixels
  const tempCanvas = createCanvas(qrSize, qrSize);
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(qrImage, 0, 0);

  // Get pixel data
  const imageData = tempCtx.getImageData(0, 0, qrSize, qrSize);
  const pixels = imageData.data;

  ctx.save();
  ctx.translate(startX, startY);

  // Draw modules with custom shapes
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      // Sample center of each module
      const sampleX = Math.floor(col * moduleSize + moduleSize / 2);
      const sampleY = Math.floor(row * moduleSize + moduleSize / 2);
      const i = (sampleY * qrSize + sampleX) * 4;

      // If dark pixel (QR data)
      if (pixels[i] < 128) {
        // Skip corner marker areas
        if ((row < 8 && col < 8) ||
            (row < 8 && col > moduleCount - 9) ||
            (row > moduleCount - 9 && col < 8)) {
          continue;
        }

        const shapeX = col * moduleSize;
        const shapeY = row * moduleSize;

        SHAPES[style.shape](ctx, shapeX, shapeY, moduleSize - 1, style.dotColor);
      }
    }
  }

  ctx.restore();

  // Draw custom corner markers
  const cornerSize = 56;
  const cornerPadding = 25;

  // Top-left corner background
  ctx.fillStyle = style.accentColor;
  ctx.fillRect(cornerPadding - 2, cornerPadding - 2, cornerSize + 4, cornerSize + 4);
  ctx.fillStyle = style.bgColor;
  ctx.fillRect(cornerPadding + 2, cornerPadding + 2, cornerSize - 4, cornerSize - 4);

  // Top-right corner
  ctx.fillStyle = style.accentColor;
  ctx.fillRect(300 - cornerPadding - cornerSize - 2, cornerPadding - 2, cornerSize + 4, cornerSize + 4);
  ctx.fillStyle = style.bgColor;
  ctx.fillRect(300 - cornerPadding - cornerSize + 2, cornerPadding + 2, cornerSize - 4, cornerSize - 4);

  // Bottom-left corner
  ctx.fillStyle = style.accentColor;
  ctx.fillRect(cornerPadding - 2, 300 - cornerPadding - cornerSize - 2, cornerSize + 4, cornerSize + 4);
  ctx.fillStyle = style.bgColor;
  ctx.fillRect(cornerPadding + 2, 300 - cornerPadding - cornerSize + 2, cornerSize - 4, cornerSize - 4);

  // Draw corner styles
  CORNER_STYLES[style.cornerStyle](ctx, cornerPadding, cornerPadding, cornerSize, style.dotColor);
  CORNER_STYLES[style.cornerStyle](ctx, 300 - cornerPadding - cornerSize, cornerPadding, cornerSize, style.dotColor);
  CORNER_STYLES[style.cornerStyle](ctx, cornerPadding, 300 - cornerPadding - cornerSize, cornerSize, style.dotColor);

  return canvas;
}

// Generate all styles
async function generateAll() {
  console.log(`Generating ${styles.length} QR code styles with custom shapes...`);

  for (const style of styles) {
    try {
      console.log(`  - ${style.name} (${style.shape} + ${style.cornerStyle})...`);

      const canvas = await drawCustomQR(style);

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
