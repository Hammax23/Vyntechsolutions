import sharp from "sharp";
import pngToIco from "png-to-ico";
import { promises as fs } from "fs";
import path from "path";

const root = process.cwd();
const source = path.join(root, "public", "logo.png");
const outDir = path.join(root, "public", "favicon");

const pngTargets = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "android-chrome-192x192.png", size: 192 },
  { name: "android-chrome-512x512.png", size: 512 },
];

async function run() {
  await fs.mkdir(outDir, { recursive: true });

  const meta = await sharp(source).metadata();
  console.log(`Source logo.png: ${meta.width}x${meta.height}`);

  for (const t of pngTargets) {
    await sharp(source)
      .resize(t.size, t.size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(path.join(outDir, t.name));
    console.log(`Created ${t.name}`);
  }

  // favicon.ico (multi-size from 16/32/48)
  const icoBuffers = await Promise.all(
    [16, 32, 48].map((size) =>
      sharp(source)
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer()
    )
  );
  const ico = await pngToIco(icoBuffers);
  await fs.writeFile(path.join(outDir, "favicon.ico"), ico);
  console.log("Created favicon.ico");

  console.log("All favicons generated in public/favicon/");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
