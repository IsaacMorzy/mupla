#!/usr/bin/env node
// Downloads additional unique images from Pexels for events and blogs
// so that no image is repeated across pages, events, or blog posts.
//
// Usage: node --env-file=.env scripts/fetch-event-blog-images.mjs

import { existsSync, readFileSync } from 'node:fs';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const IMG_DIR = path.join(ROOT, 'public/images');

// Load .env
if (existsSync(path.join(ROOT, '.env'))) {
  const lines = readFileSync(path.join(ROOT, '.env'), 'utf-8').split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^['\"]|['\"]$/g, '');
    }
  }
}

const apiKey = process.env.PEXELS_API_KEY;
if (!apiKey) {
  console.error('PEXELS_API_KEY not set');
  process.exit(1);
}

await mkdir(IMG_DIR, { recursive: true });

// 23 unique images: 9 for events, 14 for blogs
// Each query targets a specific section context
// Filenames follow the existing convention: context-theme.jpg
const MANIFEST = [
  // ── Events (9 unique images) ──
  {
    file: 'event-food-pantry.jpg',
    query: 'food charity volunteers community center',
    alt: 'Volunteers distributing food at a community pantry.',
  },
  {
    file: 'event-parenting-workshop.jpg',
    query: 'parents meeting workshop diverse adults',
    alt: 'Parents gathered in a workshop circle discussing family topics.',
  },
  {
    file: 'event-family-hike.jpg',
    query: 'family walking nature park together',
    alt: 'A family walking together on a nature trail.',
  },
  {
    file: 'event-qurbani.jpg',
    query: 'community celebration feast gathering outdoors',
    alt: 'Community members gathered for an outdoor celebration and feast.',
  },
  {
    file: 'event-ramadan-dinner.jpg',
    query: 'evening dinner gathering food table warm light',
    alt: 'A warm evening dinner table set for a community gathering.',
  },
  {
    file: 'event-community-meeting.jpg',
    query: 'community meeting discussion circle diverse',
    alt: 'A diverse community gathered in a discussion circle.',
  },
  {
    file: 'event-backpack-drive.jpg',
    query: 'children school backpacks supplies community',
    alt: 'Children receiving school backpacks and supplies.',
  },
  {
    file: 'event-youth-stage.jpg',
    query: 'youth performance stage microphone event',
    alt: 'A youth performer on stage at a community event.',
  },
  {
    file: 'event-volunteer-dinner.jpg',
    query: 'dinner celebration banquet table elegant',
    alt: 'A celebratory dinner table set for volunteers.',
  },

  // ── Blogs (14 unique images) ──
  {
    file: 'blog-volunteer-hands.jpg',
    query: 'volunteers teamwork hands together community',
    alt: 'Volunteers joining hands in teamwork and community service.',
  },
  {
    file: 'blog-zakat-charity.jpg',
    query: 'charity giving donation compassion kindness',
    alt: 'A compassionate act of charitable giving.',
  },
  {
    file: 'blog-family-kitchen.jpg',
    query: 'family sharing meal kitchen table together',
    alt: 'A family sharing a meal together at the kitchen table.',
  },
  {
    file: 'blog-sadaqah-secret.jpg',
    query: 'anonymous note envelope kindness giving',
    alt: 'An anonymous note of kindness being given.',
  },
  {
    file: 'blog-ramadan-crescent.jpg',
    query: 'ramadan crescent moon lantern night',
    alt: 'A crescent moon and lantern marking the arrival of Ramadan.',
  },
  {
    file: 'blog-holiday-giving.jpg',
    query: 'holiday gift giving community charity',
    alt: 'Community members sharing holiday gifts and cheer.',
  },
  {
    file: 'blog-food-supplies.jpg',
    query: 'food bank shelves supplies cans organized',
    alt: 'Organized shelves of food supplies at a community pantry.',
  },
  {
    file: 'blog-mentor-conversation.jpg',
    query: 'mentor student conversation teaching learning',
    alt: 'A mentor and student engaged in meaningful conversation.',
  },
  {
    file: 'blog-community-support.jpg',
    query: 'people receiving help community support care',
    alt: 'Community members receiving support with care and dignity.',
  },
  {
    file: 'blog-gala-hall.jpg',
    query: 'elegant dinner event celebration hall decorated',
    alt: 'An elegantly decorated hall for a community celebration dinner.',
  },
  {
    file: 'blog-new-home.jpg',
    query: 'family moving boxes new home welcome',
    alt: 'A family being welcomed into their new home.',
  },
  {
    file: 'blog-committee-discussion.jpg',
    query: 'group discussion meeting table diverse adults',
    alt: 'A diverse group engaged in discussion around a meeting table.',
  },
  {
    file: 'blog-morning-pantry.jpg',
    query: 'morning volunteers packing boxes food pantry',
    alt: 'Volunteers packing food boxes early morning at the pantry.',
  },
  {
    file: 'blog-parents-workshop.jpg',
    query: 'parents children workshop education learning circle',
    alt: 'Parents gathered in a learning circle at a community workshop.',
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchOne(entry, attempt = 1) {
  const searchUrl =
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(entry.query)}` +
    `&per_page=15&orientation=landscape`;
  const res = await fetch(searchUrl, { headers: { Authorization: apiKey } });
  if (res.status === 429 && attempt < 4) {
    await sleep(1000 * attempt);
    return fetchOne(entry, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} for "${entry.query}"`);
  const data = await res.json();
  const top = data.photos?.[0];
  if (!top) throw new Error(`No photos for "${entry.query}"`);
  const imgUrl = top.src.large2x ?? top.src.large ?? top.src.original;
  const dl = await fetch(imgUrl);
  if (!dl.ok) throw new Error(`Download failed for ${entry.file}`);
  const buf = Buffer.from(await dl.arrayBuffer());
  await writeFile(path.join(IMG_DIR, entry.file), buf);
  return { file: entry.file, photographer: top.photographer, id: top.id };
}

const results = [];
const errors = [];
let count = 0;

for (const entry of MANIFEST) {
  count++;
  try {
    const result = await fetchOne(entry);
    results.push(result);
    console.log(`✓ [${count}/23] ${entry.file} ← "${entry.query}" (by ${result.photographer})`);
    // Small delay between requests to be kind to the API
    if (count < MANIFEST.length) await sleep(600);
  } catch (err) {
    errors.push({ file: entry.file, query: entry.query, error: err.message });
    console.error(`✗ [${count}/23] ${entry.file}: ${err.message}`);
  }
}

if (errors.length > 0) {
  console.error(`\n${errors.length} of ${MANIFEST.length} images failed.`);
  process.exit(1);
}
console.log(`\n✓ All ${results.length} images downloaded to public/images/`);
