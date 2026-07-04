// Bakes the hero line-art alpha masks. Run from the repo root:
//   node scripts/bake-hero-masks.mjs
// Inputs (repo root): "bg(4).png" (intro scene), "in-factory.png" (interior).
// Outputs: public/hero/mask-intro.png, public/hero/mask-interior.png.
// The output PNGs are committed; only re-run when a source image changes.
import { fileURLToPath } from "node:url";
import sharp from "sharp";

/**
 * sRGB pixel -> alpha for a line mask. Rec.709 luminance, then a gain/offset
 * curve so the near-black source background clamps to 0 and bright wireframe
 * strokes rise toward 255. Output RGB is always white; only alpha carries the mask.
 */
export function toMaskAlpha(r, g, b, gain = 3.6, offset = 40) {
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // 0–255
  const v = luma * gain - offset;
  return Math.max(0, Math.min(255, Math.round(v)));
}

async function bake(src, dst, gain, offset) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);
  for (let i = 0, o = 0; i < data.length; i += channels, o += 4) {
    out[o] = 255;
    out[o + 1] = 255;
    out[o + 2] = 255;
    out[o + 3] = toMaskAlpha(data[i], data[i + 1], data[i + 2], gain, offset);
  }
  await sharp(out, { raw: { width, height, channels: 4 } }).png().toFile(dst);
  console.error(`baked ${dst} (${width}x${height})`);
}

async function main() {
  await bake("bg(4).png", "public/hero/mask-intro.png", 3.6, 40);
  await bake("in-factory.png", "public/hero/mask-interior.png", 3.6, 40);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
