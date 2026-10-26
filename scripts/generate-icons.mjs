import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const publicDir = path.resolve("public");
const source = path.join(publicDir, "icon.png");

const pngTargets = [
  ["../src/app/icon.png", 512],
  ["../src/app/favicon.png", 512],
  ["../src/app/apple-icon.png", 180],
  ["../src/app/assets/Favicon.icon.png", 512],
  ["favicon-16.png", 16],
  ["favicon-32.png", 32],
  ["favicon-48.png", 48],
  ["favicon-64.png", 64],
  ["favicon-96.png", 96],
  ["favicon-128.png", 128],
  ["favicon-192.png", 192],
  ["favicon-256.png", 256],
  ["favicon.png", 512],
  ["favicon-large.png", 512],
  ["logo.png", 512],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["android-chrome-192x192.png", 192],
  ["android-chrome-512x512.png", 512],
  ["apple-touch-icon.png", 180],
  ["apple-touch-icon-180.png", 180],
];

for (const [name, size] of pngTargets) {
  await sharp(source)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, name));
  console.log(`wrote ${name} (${size}x${size})`);
}

const icoSizes = [16, 32, 48, 64, 128, 256];
const pngBuffers = [];
for (const size of icoSizes) {
  pngBuffers.push(
    await sharp(source)
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()
  );
}

function buildIco(buffers, sizes) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(buffers.length, 4);

  const entries = Buffer.alloc(16 * buffers.length);
  let offset = 6 + entries.length;

  buffers.forEach((buf, i) => {
    const size = sizes[i];
    const e = i * 16;
    entries.writeUInt8(size >= 256 ? 0 : size, e);
    entries.writeUInt8(size >= 256 ? 0 : size, e + 1);
    entries.writeUInt8(0, e + 2);
    entries.writeUInt8(0, e + 3);
    entries.writeUInt16LE(1, e + 4);
    entries.writeUInt16LE(32, e + 6);
    entries.writeUInt32LE(buf.length, e + 8);
    entries.writeUInt32LE(offset, e + 12);
    offset += buf.length;
  });

  return Buffer.concat([header, entries, ...buffers]);
}

const ico = buildIco(pngBuffers, icoSizes);
await writeFile(path.join(publicDir, "favicon.ico"), ico);
await writeFile(path.join(publicDir, "icon.ico"), ico);
await writeFile(path.join(publicDir, "../src/app/assets/Favicon.icon.ico"), ico);
console.log("wrote favicon.ico, icon.ico and assets/Favicon.icon.ico");

const meta = await sharp(source).metadata();
console.log(`source icon.png: ${meta.width}x${meta.height}`);
