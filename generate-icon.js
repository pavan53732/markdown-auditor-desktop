const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BUILD_DIR = path.join(__dirname, 'build');
const WORK_SIZE = 768;
const ICON_SIZES = [16, 24, 32, 48, 64, 128, 256];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function createCanvas(size) {
  return {
    size,
    pixels: new Uint8ClampedArray(size * size * 4)
  };
}

function blendPixel(canvas, x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= canvas.size || y >= canvas.size || a <= 0) return;
  const idx = (y * canvas.size + x) * 4;
  const srcA = clamp(a, 0, 255) / 255;
  const dstA = canvas.pixels[idx + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);

  if (outA <= 0) {
    canvas.pixels[idx] = 0;
    canvas.pixels[idx + 1] = 0;
    canvas.pixels[idx + 2] = 0;
    canvas.pixels[idx + 3] = 0;
    return;
  }

  const dstR = canvas.pixels[idx];
  const dstG = canvas.pixels[idx + 1];
  const dstB = canvas.pixels[idx + 2];

  const outR = (r * srcA + dstR * dstA * (1 - srcA)) / outA;
  const outG = (g * srcA + dstG * dstA * (1 - srcA)) / outA;
  const outB = (b * srcA + dstB * dstA * (1 - srcA)) / outA;

  canvas.pixels[idx] = Math.round(outR);
  canvas.pixels[idx + 1] = Math.round(outG);
  canvas.pixels[idx + 2] = Math.round(outB);
  canvas.pixels[idx + 3] = Math.round(outA * 255);
}

function rgba(color, alphaOverride = null) {
  return {
    r: color[0],
    g: color[1],
    b: color[2],
    a: alphaOverride === null ? (color[3] ?? 255) : alphaOverride
  };
}

function pointInRoundedRect(x, y, rect) {
  const { x: rx, y: ry, w, h, radius } = rect;
  const innerLeft = rx + radius;
  const innerRight = rx + w - radius;
  const innerTop = ry + radius;
  const innerBottom = ry + h - radius;

  if (x >= innerLeft && x < innerRight && y >= ry && y < ry + h) return true;
  if (y >= innerTop && y < innerBottom && x >= rx && x < rx + w) return true;

  const corners = [
    [rx + radius, ry + radius],
    [rx + w - radius, ry + radius],
    [rx + radius, ry + h - radius],
    [rx + w - radius, ry + h - radius]
  ];

  for (const [cx, cy] of corners) {
    const dx = x - cx;
    const dy = y - cy;
    if (dx * dx + dy * dy <= radius * radius) {
      return true;
    }
  }

  return false;
}

function fillRoundedRect(canvas, rect, colorFn) {
  const xStart = Math.floor(rect.x);
  const yStart = Math.floor(rect.y);
  const xEnd = Math.ceil(rect.x + rect.w);
  const yEnd = Math.ceil(rect.y + rect.h);

  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      if (!pointInRoundedRect(x + 0.5, y + 0.5, rect)) continue;
      const color = colorFn(x, y);
      blendPixel(canvas, x, y, color.r, color.g, color.b, color.a);
    }
  }
}

function pointInCircle(x, y, cx, cy, radius) {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function fillCircle(canvas, cx, cy, radius, colorFn) {
  const xStart = Math.floor(cx - radius);
  const yStart = Math.floor(cy - radius);
  const xEnd = Math.ceil(cx + radius);
  const yEnd = Math.ceil(cy + radius);

  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      if (!pointInCircle(x + 0.5, y + 0.5, cx, cy, radius)) continue;
      const color = colorFn(x, y);
      blendPixel(canvas, x, y, color.r, color.g, color.b, color.a);
    }
  }
}

function fillRing(canvas, cx, cy, outerRadius, innerRadius, colorFn) {
  const xStart = Math.floor(cx - outerRadius);
  const yStart = Math.floor(cy - outerRadius);
  const xEnd = Math.ceil(cx + outerRadius);
  const yEnd = Math.ceil(cy + outerRadius);
  const outerSq = outerRadius * outerRadius;
  const innerSq = innerRadius * innerRadius;

  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const distSq = dx * dx + dy * dy;
      if (distSq > outerSq || distSq < innerSq) continue;
      const color = colorFn(x, y, Math.sqrt(distSq));
      blendPixel(canvas, x, y, color.r, color.g, color.b, color.a);
    }
  }
}

function drawCapsuleLine(canvas, x1, y1, x2, y2, thickness, color) {
  const radius = thickness / 2;
  const minX = Math.floor(Math.min(x1, x2) - radius - 1);
  const minY = Math.floor(Math.min(y1, y2) - radius - 1);
  const maxX = Math.ceil(Math.max(x1, x2) + radius + 1);
  const maxY = Math.ceil(Math.max(y1, y2) + radius + 1);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  for (let y = minY; y < maxY; y++) {
    for (let x = minX; x < maxX; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      let t = 0;
      if (lenSq > 0) {
        t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
        t = clamp(t, 0, 1);
      }
      const projX = x1 + dx * t;
      const projY = y1 + dy * t;
      const distX = px - projX;
      const distY = py - projY;
      if (distX * distX + distY * distY <= radius * radius) {
        blendPixel(canvas, x, y, color.r, color.g, color.b, color.a);
      }
    }
  }
}

function fillTriangle(canvas, p1, p2, p3, colorFn) {
  const minX = Math.floor(Math.min(p1[0], p2[0], p3[0]));
  const minY = Math.floor(Math.min(p1[1], p2[1], p3[1]));
  const maxX = Math.ceil(Math.max(p1[0], p2[0], p3[0]));
  const maxY = Math.ceil(Math.max(p1[1], p2[1], p3[1]));

  const area = (p2[1] - p3[1]) * (p1[0] - p3[0]) + (p3[0] - p2[0]) * (p1[1] - p3[1]);
  if (area === 0) return;

  for (let y = minY; y < maxY; y++) {
    for (let x = minX; x < maxX; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const w1 = ((p2[1] - p3[1]) * (px - p3[0]) + (p3[0] - p2[0]) * (py - p3[1])) / area;
      const w2 = ((p3[1] - p1[1]) * (px - p3[0]) + (p1[0] - p3[0]) * (py - p3[1])) / area;
      const w3 = 1 - w1 - w2;
      if (w1 >= 0 && w2 >= 0 && w3 >= 0) {
        const color = colorFn(px, py, w1, w2, w3);
        blendPixel(canvas, x, y, color.r, color.g, color.b, color.a);
      }
    }
  }
}

function addRadialGlow(canvas, cx, cy, radius, color, strength = 1) {
  const xStart = Math.floor(cx - radius);
  const yStart = Math.floor(cy - radius);
  const xEnd = Math.ceil(cx + radius);
  const yEnd = Math.ceil(cy + radius);

  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue;
      const t = 1 - dist / radius;
      const alpha = Math.round((color[3] ?? 255) * t * t * strength);
      blendPixel(canvas, x, y, color[0], color[1], color[2], alpha);
    }
  }
}

function downsample(canvas, targetSize) {
  const scale = canvas.size / targetSize;
  const output = Buffer.alloc(targetSize * targetSize * 4);

  for (let y = 0; y < targetSize; y++) {
    for (let x = 0; x < targetSize; x++) {
      const startX = Math.floor(x * scale);
      const endX = Math.floor((x + 1) * scale);
      const startY = Math.floor(y * scale);
      const endY = Math.floor((y + 1) * scale);

      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let sumA = 0;
      let count = 0;

      for (let sy = startY; sy < endY; sy++) {
        for (let sx = startX; sx < endX; sx++) {
          const idx = (sy * canvas.size + sx) * 4;
          sumR += canvas.pixels[idx];
          sumG += canvas.pixels[idx + 1];
          sumB += canvas.pixels[idx + 2];
          sumA += canvas.pixels[idx + 3];
          count++;
        }
      }

      const outIdx = (y * targetSize + x) * 4;
      output[outIdx] = Math.round(sumR / count);
      output[outIdx + 1] = Math.round(sumG / count);
      output[outIdx + 2] = Math.round(sumB / count);
      output[outIdx + 3] = Math.round(sumA / count);
    }
  }

  return output;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  const table = new Array(256).fill(0).map((_, n) => {
    let c = n;
    for (let i = 0; i < 8; i++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    return c >>> 0;
  });

  for (let i = 0; i < buffer.length; i++) {
    crc = table[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function encodePNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const stride = width * 4 + 1;
  const rawData = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    rawData[y * stride] = 0;
    rgbaBuffer.copy(rawData, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  return Buffer.concat([
    signature,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', compressed),
    createChunk('IEND', Buffer.alloc(0))
  ]);
}

function encodeICO(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const directory = Buffer.alloc(images.length * 16);
  let offset = 6 + directory.length;

  images.forEach((image, index) => {
    const entryOffset = index * 16;
    directory[entryOffset] = image.size === 256 ? 0 : image.size;
    directory[entryOffset + 1] = image.size === 256 ? 0 : image.size;
    directory[entryOffset + 2] = 0;
    directory[entryOffset + 3] = 0;
    directory.writeUInt16LE(1, entryOffset + 4);
    directory.writeUInt16LE(32, entryOffset + 6);
    directory.writeUInt32LE(image.png.length, entryOffset + 8);
    directory.writeUInt32LE(offset, entryOffset + 12);
    offset += image.png.length;
  });

  return Buffer.concat([header, directory, ...images.map((image) => image.png)]);
}

function paintBackground(canvas) {
  const tile = { x: 72, y: 72, w: 624, h: 624, radius: 172 };

  fillRoundedRect(canvas, { ...tile, x: tile.x + 18, y: tile.y + 30 }, () => rgba([3, 8, 20, 118]));
  fillRoundedRect(canvas, tile, (x, y) => {
    const nx = (x - tile.x) / tile.w;
    const ny = (y - tile.y) / tile.h;
    return rgba([
      Math.round(mix(11, 18, ny * 0.6 + nx * 0.3)),
      Math.round(mix(22, 52, ny * 0.7)),
      Math.round(mix(42, 116, nx * 0.6 + ny * 0.4)),
      255
    ]);
  });

  addRadialGlow(canvas, 225, 170, 220, [71, 183, 255, 58], 1.15);
  addRadialGlow(canvas, 560, 590, 260, [31, 99, 255, 44], 1.0);
  addRadialGlow(canvas, 384, 112, 200, [255, 255, 255, 28], 0.9);

  fillRoundedRect(canvas, { x: 92, y: 92, w: 584, h: 12, radius: 6 }, () => rgba([255, 255, 255, 18]));
}

function paintDocument(canvas) {
  const card = { x: 182, y: 138, w: 308, h: 400, radius: 76 };
  fillRoundedRect(canvas, { ...card, x: card.x + 18, y: card.y + 24 }, () => rgba([2, 6, 23, 52]));
  fillRoundedRect(canvas, card, (x, y) => {
    const ny = (y - card.y) / card.h;
    return rgba([
      Math.round(mix(247, 231, ny)),
      Math.round(mix(251, 241, ny)),
      Math.round(mix(255, 248, ny)),
      255
    ]);
  });

  fillRoundedRect(canvas, { x: 204, y: 158, w: 264, h: 10, radius: 5 }, () => rgba([255, 255, 255, 54]));

  const foldBase = [card.x + card.w - 108, card.y];
  const foldTip = [card.x + card.w, card.y + 108];
  const foldJoin = [card.x + card.w, card.y];
  fillTriangle(canvas, foldBase, foldTip, foldJoin, () => rgba([216, 229, 255, 255]));
  fillTriangle(canvas, [foldBase[0] - 6, foldBase[1] + 10], [foldTip[0] - 10, foldTip[1] - 6], [foldJoin[0] - 10, foldJoin[1] + 8], () => rgba([195, 214, 248, 180]));

  const ink = rgba([29, 78, 216, 255]);
  fillRoundedRect(canvas, { x: 246, y: 214, w: 26, h: 132, radius: 13 }, () => ink);
  fillRoundedRect(canvas, { x: 308, y: 214, w: 26, h: 132, radius: 13 }, () => ink);
  fillRoundedRect(canvas, { x: 214, y: 246, w: 152, h: 26, radius: 13 }, () => ink);
  fillRoundedRect(canvas, { x: 214, y: 310, w: 152, h: 26, radius: 13 }, () => ink);

  const lineColor = rgba([90, 108, 142, 220]);
  const lines = [
    { x: 248, y: 388, w: 154 },
    { x: 248, y: 426, w: 128 },
    { x: 248, y: 464, w: 172 }
  ];
  for (const line of lines) {
    fillRoundedRect(canvas, { x: line.x, y: line.y, w: line.w, h: 18, radius: 9 }, () => lineColor);
  }
}

function paintLens(canvas) {
  const lensX = 502;
  const lensY = 476;
  const outerRadius = 138;
  const innerRadius = 100;

  fillCircle(canvas, lensX + 16, lensY + 18, outerRadius, () => rgba([1, 9, 27, 54]));
  fillCircle(canvas, lensX, lensY, outerRadius, (x, y) => {
    const dist = Math.hypot(x - lensX, y - lensY);
    const t = clamp(dist / outerRadius, 0, 1);
    return rgba([
      Math.round(mix(127, 48, t)),
      Math.round(mix(215, 118, t)),
      Math.round(mix(255, 255, t * 0.65)),
      Math.round(mix(228, 255, 1 - t * 0.25))
    ]);
  });

  fillRing(canvas, lensX, lensY, outerRadius, innerRadius, (_, __, dist) => {
    const t = clamp((dist - innerRadius) / (outerRadius - innerRadius), 0, 1);
    return rgba([
      Math.round(mix(96, 28, t)),
      Math.round(mix(224, 130, t)),
      255,
      Math.round(mix(255, 228, t))
    ]);
  });

  fillCircle(canvas, lensX, lensY, innerRadius, (x, y) => {
    const t = clamp((y - (lensY - innerRadius)) / (innerRadius * 2), 0, 1);
    return rgba([
      Math.round(mix(216, 164, t)),
      Math.round(mix(245, 221, t)),
      Math.round(mix(255, 255, t)),
      112
    ]);
  });

  addRadialGlow(canvas, lensX - 36, lensY - 42, 110, [255, 255, 255, 48], 1);
  drawCapsuleLine(canvas, 584, 560, 664, 640, 54, rgba([16, 34, 80, 210]));
  drawCapsuleLine(canvas, 590, 554, 670, 634, 26, rgba([109, 211, 255, 220]));

  drawCapsuleLine(canvas, 454, 488, 492, 530, 34, rgba([19, 198, 125, 255]));
  drawCapsuleLine(canvas, 490, 530, 560, 442, 34, rgba([19, 198, 125, 255]));

  fillCircle(canvas, 598, 342, 22, () => rgba([255, 215, 76, 255]));
  drawCapsuleLine(canvas, 598, 308, 598, 332, 10, rgba([255, 215, 76, 235]));
  drawCapsuleLine(canvas, 598, 352, 598, 376, 10, rgba([255, 215, 76, 235]));
  drawCapsuleLine(canvas, 564, 342, 588, 342, 10, rgba([255, 215, 76, 235]));
  drawCapsuleLine(canvas, 608, 342, 632, 342, 10, rgba([255, 215, 76, 235]));
}

function createIconCanvas() {
  const canvas = createCanvas(WORK_SIZE);
  paintBackground(canvas);
  paintDocument(canvas);
  paintLens(canvas);
  return canvas;
}

function writeOutputs() {
  fs.mkdirSync(BUILD_DIR, { recursive: true });

  const canvas = createIconCanvas();
  const pngImages = ICON_SIZES.map((size) => {
    const rgbaBuffer = downsample(canvas, size);
    return {
      size,
      rgbaBuffer,
      png: encodePNG(size, size, rgbaBuffer)
    };
  });

  const preview = pngImages.find((image) => image.size === 256);
  fs.writeFileSync(path.join(BUILD_DIR, 'icon.png'), preview.png);
  fs.writeFileSync(path.join(BUILD_DIR, 'icon.ico'), encodeICO(pngImages));

  console.log('Created icon assets:');
  console.log(`- ${path.join('build', 'icon.png')}`);
  console.log(`- ${path.join('build', 'icon.ico')}`);
}

writeOutputs();
