// Shrink images before they land in git.
//
//   node scripts/shrink-images.mjs <file...>   shrink the given files in place
//   node scripts/shrink-images.mjs --all       every image under src/content/feed
//
// Long edge is capped at MAX_EDGE, EXIF orientation is applied and then all
// metadata (including GPS) is stripped. JPEGs are re-encoded at QUALITY. A file
// is only rewritten when it had to be resized or the re-encode saves at least
// MIN_SAVING of its size; re-encoding an already-compressed JPEG shaves a percent
// or two every time, and that threshold is what stops repeated runs from slowly
// degrading it. Run by .githooks/pre-commit on staged images.
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const MAX_EDGE = 2000;
const QUALITY = 85;
const MIN_SAVING = 0.1;
const FEED_DIR = 'src/content/feed';
const EXT = /\.(jpe?g|png)$/i;

async function shrink(file) {
  const input = await readFile(file);
  const image = sharp(input).rotate(); // rotate() with no angle applies EXIF orientation
  const meta = await image.metadata();
  const pipeline = image.resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: 'inside',
    withoutEnlargement: true,
  });
  const isPng = (meta.format ?? path.extname(file).slice(1).toLowerCase()) === 'png';
  const output = await (isPng
    ? pipeline.png({ compressionLevel: 9 })
    : pipeline.jpeg({ quality: QUALITY, mozjpeg: true })
  ).toBuffer({ resolveWithObject: true });

  const resized = output.info.width !== meta.width || output.info.height !== meta.height;
  if (!resized && output.data.length > input.length * (1 - MIN_SAVING)) {
    return { file, skipped: true, before: input.length };
  }
  await writeFile(file, output.data);
  return {
    file,
    before: input.length,
    after: output.data.length,
    from: `${meta.width}x${meta.height}`,
    to: `${output.info.width}x${output.info.height}`,
  };
}

const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;

let files = process.argv.slice(2);
if (files[0] === '--all') {
  files = (await readdir(FEED_DIR)).filter((f) => EXT.test(f)).map((f) => path.join(FEED_DIR, f));
}
files = files.filter((f) => EXT.test(f));
if (files.length === 0) {
  console.log('shrink-images: nothing to do');
  process.exit(0);
}

let saved = 0;
for (const file of files) {
  if (!(await stat(file).catch(() => null))) continue;
  const r = await shrink(file);
  if (r.skipped) {
    console.log(`  kept   ${file} (${mb(r.before)})`);
  } else {
    saved += r.before - r.after;
    console.log(`  shrunk ${file}  ${r.from} → ${r.to}  ${mb(r.before)} → ${mb(r.after)}`);
  }
}
if (saved > 0) console.log(`shrink-images: saved ${mb(saved)}`);
