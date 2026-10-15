import { copyFile, readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

async function listFiles(dir, prefix = './') {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory()
    ? listFiles(`${dir}/${entry.name}`, `${prefix}${entry.name}/`)
    : entry.name === 'sw.js' ? [] : [`${prefix}${entry.name}`]));
  return nested.flat();
}
// Ship the project license with static deployments and cache it for offline use.
await copyFile('LICENSE', 'dist/LICENSE');
const files = (await listFiles('dist')).sort();
const hash = createHash('sha256');
for (const file of files) hash.update(await readFile(`dist/${file.slice(2)}`));
const version = hash.digest('hex').slice(0, 16);
await writeFile('dist/sw.js', `
const CACHE = 'plengsen-pop-${version}';
const ASSETS = ${JSON.stringify(files)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith('plengsen-pop-') && key !== CACHE)
    .map(key => caches.delete(key)))));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match(new URL('./index.html', self.registration.scope))));
  } else {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
  }
});
`);
console.log(`Offline cache ready: ${files.length} files (${version}).`);
