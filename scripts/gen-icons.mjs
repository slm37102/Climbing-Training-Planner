// Generates amber-on-stone "CTP" PNG icons (192, 512) without external deps.
// Produces simple maskable icons: stone-950 background, amber "CTP" block glyph.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const BG = [0x0c, 0x0a, 0x09]; // stone-950
const FG = [0xf5, 0x9e, 0x0b]; // amber-500

const glyphs = {
  C: ['01110','10001','10000','10001','01110'],
  T: ['11111','00100','00100','00100','00100'],
  P: ['11110','10001','11110','10000','10000'],
};

function buildPixelGrid(size) {
  const g = new Uint8Array(size * size);
  const text = 'CTP';
  const charW = 5, charH = 5, gap = 1;
  const totalCols = charW * text.length + gap * (text.length - 1);
  const scale = Math.floor((size * 0.55) / Math.max(totalCols, charH));
  const textWpx = totalCols * scale;
  const textHpx = charH * scale;
  const x0 = Math.floor((size - textWpx) / 2);
  const y0 = Math.floor((size - textHpx) / 2);
  for (let ci = 0; ci < text.length; ci++) {
    const rows = glyphs[text[ci]];
    const cx = x0 + ci * (charW + gap) * scale;
    for (let r = 0; r < charH; r++) {
      for (let c = 0; c < charW; c++) {
        if (rows[r][c] !== '1') continue;
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            g[(y0 + r * scale + dy) * size + (cx + c * scale + dx)] = 1;
          }
        }
      }
    }
  }
  return g;
}

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = (table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)) >>> 0;
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(size) {
  const grid = buildPixelGrid(size);
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 3)] = 0;
    for (let x = 0; x < size; x++) {
      const idx = y * (1 + size * 3) + 1 + x * 3;
      const on = grid[y * size + x];
      const [r, g, b] = on ? FG : BG;
      raw[idx] = r; raw[idx + 1] = g; raw[idx + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const idat = deflateSync(raw);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const size of [192, 512]) {
  const png = encodePng(size);
  const out = join(outDir, `icon-${size}.png`);
  writeFileSync(out, png);
  console.log('wrote', out, png.length, 'bytes');
}
