const fs = require('fs');

// Create a simple 256x256 PNG icon programmatically
// This creates a document with magnifying glass design

function createPNG() {
  // PNG header and IHDR chunk for 256x256 RGBA
  const width = 256;
  const height = 256;
  
  // Create raw pixel data (RGBA)
  const pixels = Buffer.alloc(width * height * 4);
  
  // Helper to set pixel
  function setPixel(x, y, r, g, b, a = 255) {
    if (x >= 0 && x < width && y >= 0 && y < height) {
      const idx = (y * width + x) * 4;
      pixels[idx] = r;
      pixels[idx + 1] = g;
      pixels[idx + 2] = b;
      pixels[idx + 3] = a;
    }
  }
  
  // Helper to fill a rectangle
  function fillRect(x1, y1, w, h, r, g, b, a = 255) {
    for (let y = y1; y < y1 + h; y++) {
      for (let x = x1; x < x1 + w; x++) {
        setPixel(x, y, r, g, b, a);
      }
    }
  }
  
  // Helper to draw a filled circle
  function fillCircle(cx, cy, radius, r, g, b, a = 255) {
    for (let y = cy - radius; y <= cy + radius; y++) {
      for (let x = cx - radius; x <= cx + radius; x++) {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (dist <= radius) {
          setPixel(x, y, r, g, b, a);
        }
      }
    }
  }
  
  // Helper to draw a ring (outline circle)
  function drawRing(cx, cy, outerRadius, innerRadius, r, g, b, a = 255) {
    for (let y = cy - outerRadius; y <= cy + outerRadius; y++) {
      for (let x = cx - outerRadius; x <= cx + outerRadius; x++) {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (dist <= outerRadius && dist >= innerRadius) {
          setPixel(x, y, r, g, b, a);
        }
      }
    }
  }
  
  // Helper to draw a filled rounded rectangle
  function fillRoundedRect(x1, y1, w, h, radius, r, g, b, a = 255) {
    for (let y = y1; y < y1 + h; y++) {
      for (let x = x1; x < x1 + w; x++) {
        let inRect = false;
        // Check corners
        const dx = Math.min(x - x1, x1 + w - 1 - x);
        const dy = Math.min(y - y1, y1 + h - 1 - y);
        
        if (dx >= 0 && dy >= 0) {
          if (dx < radius && dy < radius) {
            const cornerX = dx < radius ? (x < x1 + radius ? x1 + radius : x1 + w - radius) : x;
            const cornerY = dy < radius ? (y < y1 + radius ? y1 + radius : y1 + h - radius) : y;
            const dist = Math.sqrt((x - cornerX) ** 2 + (y - cornerY) ** 2);
            inRect = dist <= radius;
          } else {
            inRect = true;
          }
        }
        
        if (inRect) {
          setPixel(x, y, r, g, b, a);
        }
      }
    }
  }
  
  // Background: dark blue (#1E40AF)
  fillRect(0, 0, width, height, 30, 64, 175);
  
  // Document body (white with slight blue tint)
  fillRoundedRect(60, 40, 136, 180, 12, 240, 245, 255);
  
  // Document fold corner
  for (let i = 0; i < 30; i++) {
    fillRect(166 - i, 40 + i, i + 1, 2, 200, 210, 230);
  }
  fillRect(166, 40, 30, 30, 200, 210, 230);
  
  // Text lines on document
  for (let i = 0; i < 6; i++) {
    const lineWidth = i === 5 ? 60 : 90;
    fillRect(80, 70 + i * 24, lineWidth, 8, 100, 116, 139);
  }
  
  // Magnifying glass handle
  const handleStartX = 180;
  const handleStartY = 180;
  const handleEndX = 230;
  const handleEndY = 230;
  const handleWidth = 12;
  
  for (let t = 0; t <= 1; t += 0.01) {
    const x = handleStartX + (handleEndX - handleStartX) * t;
    const y = handleStartY + (handleEndY - handleStartY) * t;
    for (let w = -handleWidth/2; w <= handleWidth/2; w++) {
      const perpX = x + w * 0.707;
      const perpY = y - w * 0.707;
      setPixel(Math.round(perpX), Math.round(perpY), 59, 130, 246);
    }
  }
  
  // Magnifying glass circle (outer ring - blue)
  drawRing(165, 165, 55, 45, 59, 130, 246);
  
  // Magnifying glass circle (inner - light blue)
  fillCircle(165, 165, 45, 147, 197, 253, 180);
  
  // Checkmark inside magnifying glass
  const checkPoints = [
    [145, 170], [155, 185], [190, 145]
  ];
  
  // Draw thick checkmark
  for (let t = 0; t <= 1; t += 0.02) {
    let segIdx, segT;
    if (t < 0.5) {
      segIdx = 0;
      segT = t * 2;
    } else {
      segIdx = 1;
      segT = (t - 0.5) * 2;
    }
    const x = Math.round(checkPoints[segIdx][0] + (checkPoints[segIdx + 1][0] - checkPoints[segIdx][0]) * segT);
    const y = Math.round(checkPoints[segIdx][1] + (checkPoints[segIdx + 1][1] - checkPoints[segIdx][1]) * segT);
    for (let w = -4; w <= 4; w++) {
      for (let h = -4; h <= 4; h++) {
        if (w*w + h*h <= 16) {
          setPixel(x + w, y + h, 22, 163, 74);
        }
      }
    }
  }
  
  // Encode as PNG
  return encodePNG(width, height, pixels);
}

// Simple PNG encoder (no compression library needed)
function encodePNG(width, height, pixels) {
  const { createDeflate } = require('zlib');
  
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  
  // IDAT chunk data (with filter bytes)
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 4 + 1)] = 0; // filter type None
    pixels.copy(rawData, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  
  // Compress with deflate
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData);
  
  // Build chunks
  function createChunk(type, data) {
    const typeBuffer = Buffer.from(type);
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const crc = crc32(Buffer.concat([typeBuffer, data]));
    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeUInt32BE(crc, 0);
    return Buffer.concat([length, typeBuffer, data, crcBuffer]);
  }
  
  // CRC32 implementation
  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  
  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate and save
const pngData = createPNG();
fs.writeFileSync('build/icon.png', pngData);
console.log('Icon created: build/icon.png');