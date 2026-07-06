#!/usr/bin/env node
// Downloads 8 curated, culturally-authentic Pexels images for the mupla
// Foundation site, saves them to public/images/, and emits a manifest with
// attribution metadata for traceability.
//
// Usage (Node 22+):
//   node --env-file=.env scripts/fetch-pexels.mjs
// or
//   set -a && . ./.env && set +a && node scripts/fetch-pexels.mjs
//
// Re-running is safe: existing files are overwritten with the latest top
// search result. Pexels license does NOT require credit, but the manifest
// stores photographer + photo URL so we can keep provenance for any swap.

import { existsSync, readFileSync } from 'node:fs';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const IMG_DIR = path.join(ROOT, 'public/images');

// Load .env manually so we don't depend on `node --env-file` flag (which is
// env-version-dependent) or require a `dotenv` dev-dependency. Only sets vars
// the process doesn't already have, so CI-provided secrets win over .env.
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
	console.error('PEXELS_API_KEY not set. Copy .env.example to .env and add the key.');
	process.exit(1);
}

await mkdir(IMG_DIR, { recursive: true });

const MANIFEST = [
	{
		file: 'home-mosque.jpg',
		query: 'modern mosque interior community',
		alt: 'Diverse community members gathered in a modern mosque during evening prayer.',
	},
	{
		file: 'about-community.jpg',
		query: 'diverse friends dinner',
		alt: 'Neighbors of all backgrounds sharing a meal together.',
	},
	{
		file: 'donate-giving.jpg',
		query: 'hands together giving',
		alt: 'Hands joined in giving — community members passing support forward.',
	},
	{
		file: 'blog-ramadan.jpg',
		query: 'family breaking fast together',
		alt: 'A multi-generational family breaking fast together at sunset.',
	},
	{
		file: 'blog-quran.jpg',
		query: 'person reading quran',
		alt: 'A community member reading Qur\u2019an with focused attention.',
	},
	{
		file: 'blog-pantry.jpg',
		query: 'volunteers food boxes',
		alt: 'Volunteers packing grocery boxes at a community food pantry.',
	},
	{
		file: 'blog-parenting.jpg',
		query: 'parent child reading together',
		alt: 'A parent reading alongside their child at home.',
	},
	{
		file: 'blog-gala.jpg',
		query: 'elegant dinner event',
		alt: 'Annual gala dinner gathering of mupla Foundation supporters.',
	},
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchOne(entry, attempt = 1) {
	const searchUrl =
		`https://api.pexels.com/v1/search?query=${encodeURIComponent(entry.query)}` +
		`&per_page=10&orientation=landscape`;
	const res = await fetch(searchUrl, { headers: { Authorization: apiKey } });
	if (res.status === 429 && attempt < 3) {
		await sleep(500 * attempt);
		return fetchOne(entry, attempt + 1);
	}
	if (!res.ok) throw new Error(`Pexels search failed for "${entry.query}": HTTP ${res.status}`);
	const data = await res.json();
	const top = data.photos?.[0];
	if (!top) throw new Error(`No photos returned for "${entry.query}"`);

	const imgUrl = top.src.large2x ?? top.src.large ?? top.src.original;
	const dl = await fetch(imgUrl);
	if (!dl.ok) throw new Error(`Photo download failed for "${entry.file}": HTTP ${dl.status}`);
	const buf = Buffer.from(await dl.arrayBuffer());
	await writeFile(path.join(IMG_DIR, entry.file), buf);

	return {
		file: entry.file,
		query: entry.query,
		alt: entry.alt,
		pexels_id: top.id,
		photographer: top.photographer ?? null,
		photographer_url: top.photographer_url ?? null,
		photo_url: top.url,
		source: imgUrl,
		fetched_at: new Date().toISOString(),
	};
}

const results = [];
const errors = [];

// Sequence (not parallel) — Pexels free-tier rate limit is 200 req/hr + 20K
// req/mo; safer to serialize 8 small calls than burst and trip the limiter.
for (const entry of MANIFEST) {
	try {
		const result = await fetchOne(entry);
		results.push(result);
		console.log(
			`\u2713 ${entry.file} <= "${entry.query}"  (id=${result.pexels_id}, photographer=${result.photographer})`,
		);
	} catch (err) {
		errors.push({ file: entry.file, query: entry.query, error: err.message });
		console.error(`\u2717 ${entry.file}: ${err.message}`);
	}
}

await writeFile(
	path.join(IMG_DIR, 'manifest.json'),
	JSON.stringify(
		{
			generated_at: new Date().toISOString(),
			license:
				'Pexels License (https://www.pexels.com/license/) \u2014 attribution not required, stored here for provenance.',
			images: results,
			errors,
		},
		null,
		2,
	),
);

if (errors.length > 0) {
	console.error(
		`\n${errors.length} of ${MANIFEST.length} images failed. See ${path.relative(ROOT, IMG_DIR)}/manifest.json for the success record.`,
	);
	process.exit(1);
}
console.log(
	`\n\u2713 Saved ${results.length} images + manifest.json to ${path.relative(ROOT, IMG_DIR)}/`,
);
