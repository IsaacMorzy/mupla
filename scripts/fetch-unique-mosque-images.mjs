#!/usr/bin/env node
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const IMG_DIR = path.join(ROOT, 'public/images');

if (existsSync(path.join(ROOT, '.env'))) {
  const lines = readFileSync(path.join(ROOT, '.env'), 'utf-8').split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

const apiKey = process.env.PEXELS_API_KEY;
if (!apiKey) {
  console.error('PEXELS_API_KEY not set');
  process.exit(1);
}

const IMAGES = [
  { query: 'mosque prayer hall arches columns', file: 'hero-mosque-arches.jpg' },
  { query: 'mosque minaret blue sky', file: 'hero-mosque-minaret.jpg' },
  { query: 'mosque entrance door islamic architecture', file: 'hero-mosque-entrance.jpg' },
  { query: 'mosque chandelier lamp light', file: 'hero-mosque-lamp.jpg' },
  { query: 'people praying mosque congregation', file: 'hero-mosque-prayer.jpg' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchOne(entry, attempt = 1) {
  const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(entry.query)}&per_page=15&orientation=landscape`;
  const res = await fetch(searchUrl, { headers: { Authorization: apiKey } });
  if (res.status === 429 && attempt < 3) {
    await sleep(500 * attempt);
    return fetchOne(entry, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} for "${entry.query}"`);
  const data = await res.json();
  const top = data.photos?.[0];
  if (!top) throw new Error(`No photos for "${entry.query}"`);
  const imgUrl = top.src.large2x ?? top.src.large;
  const dl = await fetch(imgUrl);
  if (!dl.ok) throw new Error(`Download failed for ${entry.file}`);
  const buf = Buffer.from(await dl.arrayBuffer());
  writeFileSync(path.join(IMG_DIR, entry.file), buf);
  console.log(`OK ${entry.file} <= "${entry.query}" (id=${top.id}, photographer=${top.photographer})`);
}

mkdirSync(IMG_DIR, { recursive: true });

for (const entry of IMAGES) {
  try {
    await fetchOne(entry);
  } catch (e) {
    console.error(`FAIL ${entry.file}: ${e.message}`);
  }
}
console.log('Done.');
