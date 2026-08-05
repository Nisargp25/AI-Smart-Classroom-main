import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgDir = join(root, 'svg');
const out = join(root, 'raster');

// transparent background (no fill) for exports
const transparentBg = (svg) => svg
  .replace(/#EAF4FF/g, 'transparent') // remove soft background fill
  .replace(/fill="none" stroke="#1F6DB8"/g, 'fill="none" stroke="#0E4E93"'); // ring outline in navy

const jobs = [
  // Icon: square mark, transparent export
  { src: 'campusai-icon.svg', base: 'campusai-icon', sizes: [48, 96, 144], transparent: true },
  // Horizontal lockup
  { src: 'campusai-logo-horizontal.svg', base: 'campusai-logo-horizontal', sizes: [150, 300, 450], transparent: true },
  // Horizontal lockup WITH soft background (favicon/build)
  { src: 'campusai-logo-horizontal.svg', base: 'campusai-logo-horizontal-bg', sizes: [150], transparent: false },
];

async function svgBuffer(srcName, transparent) {
  const fs = await import('node:fs/promises');
  let svg = await fs.readFile(join(svgDir, srcName), 'utf8');
  if (transparent) svg = transparentBg(svg);
  return Buffer.from(svg);
}

async function main() {
  await mkdir(join(out, 'png'), { recursive: true });
  await mkdir(join(out, 'webp'), { recursive: true });
  await mkdir(join(out, 'avif'), { recursive: true });

  for (const job of jobs) {
    const buf = await svgBuffer(job.src, job.transparent);
    for (const size of job.sizes) {
      const pngName = `${job.base}-${size}.png`;
      await sharp(buf, { density: 300 })
        .resize(size)
        .png({ compressionLevel: 9 })
        .toFile(join(out, 'png', pngName));

      const webpName = `${job.base}-${size}.webp`;
      await sharp(buf, { density: 300 })
        .resize(size)
        .webp({ quality: job.transparent ? 90 : 92, lossless: false })
        .toFile(join(out, 'webp', webpName));

      console.log('done', webpName, size);
    }
  }

  // Optimized production WebP and AVIF (large, lossy)
  const optBuf = await svgBuffer('campusai-logo-horizontal.svg', true);
  await sharp(optBuf, { density: 300 })
    .resize(600)
    .webp({ quality: 75 })
    .toFile(join(out, 'webp', 'campusai-logo-horizontal-optimized.webp'));
  await sharp(optBuf, { density: 300 })
    .resize(600)
    .avif({ quality: 55 })
    .toFile(join(out, 'avif', 'campusai-logo-horizontal-optimized.avif'));

  const iconBuf = await svgBuffer('campusai-icon.svg', true);
  await sharp(iconBuf, { density: 300 })
    .resize(192)
    .webp({ quality: 78 })
    .toFile(join(out, 'webp', 'campusai-icon-optimized.webp'));

  console.log('Done rendering all rasters.');
}

main().catch((e) => { console.error(e); process.exit(1); });
