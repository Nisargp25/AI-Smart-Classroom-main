import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgDir = join(root, 'svg');
const out = join(root, 'favicon');

// Build a favicon: navy rounded-square background + white monochrome mark
async function faviconSvg(size) {
  const icon = await readFile(join(svgDir, 'campusai-icon.svg'), 'utf8');
  // Convert to white monochrome mark on transparent, then composite on navy later.
  // Simpler: create a wrapper SVG with navy rounded rect + white mark.
  const whiteIcon = icon
    .replace(/fill="#EAF4FF"/g, 'fill="none"')
    .replace(/fill="none" stroke="#1F6DB8" stroke-width="8"/g, 'fill="none" stroke="#FFFFFF" stroke-width="10"')
    .replace(/fill="#0E4E93"/g, 'fill="#FFFFFF"')
    .replace(/fill="#7CAFE5"/g, 'fill="#FFFFFF"')
    .replace(/fill="#5F9FDD"/g, 'fill="#FFFFFF"')
    .replace(/fill="#1F6DB8"/g, 'fill="#FFFFFF"')
    .replace(/fill="#F59E0B"/g, 'fill="#FFFFFF"')
    // viewBox is 200x200
    .replace('<svg', `<svg width="${size}" height="${size}"`);

  // Wrap in a navy rounded-square
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="2" y="2" width="${size - 4}" height="${size - 4}" rx="${size * 0.22}" fill="#0E4E93"/>
  <g transform="translate(${size * 0.05} ${size * 0.05}) scale(${size / 200})">
    ${whiteIcon.replace(/^<\?xml.*?\?>/s, '').replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')}
  </g>
</svg>`;

  return Buffer.from(markup);
}

async function main() {
  await mkdir(out, { recursive: true });

  for (const size of [16, 32]) {
    const buf = await faviconSvg(size);
    const png = await sharp(buf).png().toBuffer();
    await sharp(buf).png().toFile(join(out, `campusai-favicon-${size}.png`));
    if (size === 32) {
      // Produce .ico from combined 16+32
      const ico = await sharp(buf).resize(32).png().toBuffer();
      // Build a Windows ICO manually (16 + 32 entries)
      const ico16 = await sharp(await faviconSvg(16)).png().toBuffer();
      const ico32 = ico;
      await writeIco(join(out, 'campusai-favicon.ico'), [[16, ico16], [32, ico32]]);
    }
    console.log('favicon', size);
  }
  console.log('Done favicons.');
}

async function writeIco(file, entries) {
  const { writeFile } = await import('node:fs/promises');
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type icon
  header.writeUInt16LE(entries.length, 4);

  const dirs = [];
  const imgBuffers = [];
  let offset = 6 + entries.length * 16;
  for (const [size, png] of entries) {
    const dir = Buffer.alloc(16);
    dir.writeUInt8(size === 256 ? 0 : size, 0); // width
    dir.writeUInt8(size === 256 ? 0 : size, 1); // height
    dir.writeUInt8(0, 2); // colors
    dir.writeUInt8(0, 3); // reserved
    dir.writeUInt16LE(1, 4); // planes
    dir.writeUInt16LE(32, 6); // bpp
    dir.writeUInt32LE(png.length, 8); // size
    dir.writeUInt32LE(offset, 12); // offset
    dirs.push(dir);
    imgBuffers.push(png);
    offset += png.length;
  }
  await writeFile(file, Buffer.concat([header, ...dirs, ...imgBuffers]));
}

main().catch((e) => { console.error(e); process.exit(1); });
