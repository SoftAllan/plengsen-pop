// Run only when changing icon.svg. Generated PNGs are committed for Docker builds.
// Provide sharp through a local installation or NODE_PATH.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
for (const [size, name] of [[180, 'apple-touch-icon'], [192, 'icon-192'], [512, 'icon-512']]) {
  await sharp(new URL('../public/icon.svg', import.meta.url).pathname).resize(size, size).png()
    .toFile(new URL(`../public/${name}.png`, import.meta.url).pathname);
}
