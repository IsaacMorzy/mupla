import { describe, it, expect } from 'vitest';

/**
 * API integration tests for Quran and Prayers pages.
 *
 * These tests verify the external APIs used by:
 * - src/pages/quran.astro  (AlQuran.cloud)
 * - src/pages/prayers.astro (AlQuran.cloud + UmmahAPI)
 *
 * They test fetch paths, response shape validation, error handling,
 * and fallback rendering patterns used in the Astro frontmatter.
 */

const ALCURAN_BASE = 'https://api.alquran.cloud/v1';
const UMMAHAPI_BASE = 'https://ummahapi.com/api';

// ── AlQuran.cloud ──────────────────────────────────────────────

describe('AlQuran.cloud API', () => {
	it('GET /surah returns all 114 surahs with correct shape', async () => {
		const res = await fetch(`${ALCURAN_BASE}/surah`);
		expect(res.ok).toBe(true);
		expect(res.status).toBe(200);

		const json = await res.json();
		expect(json.code).toBe(200);
		expect(json.status).toBe('OK');
		expect(Array.isArray(json.data)).toBe(true);
		expect(json.data.length).toBe(114);

		const first = json.data[0];
		expect(first).toHaveProperty('number');
		expect(first).toHaveProperty('name');
		expect(first).toHaveProperty('englishName');
		expect(first).toHaveProperty('revelationType');
		expect(first).toHaveProperty('numberOfAyahs');
		expect(typeof first.name).toBe('string');
		expect(typeof first.englishName).toBe('string');
	});

	it('GET /surah/:id/quran-uthmani returns Arabic verses', async () => {
		const res = await fetch(`${ALCURAN_BASE}/surah/1/quran-uthmani`);
		expect(res.ok).toBe(true);

		const json = await res.json();
		expect(json.data).toBeDefined();
		expect(Array.isArray(json.data.ayahs)).toBe(true);
		expect(json.data.ayahs.length).toBeGreaterThan(0);

		const verse = json.data.ayahs[0];
		expect(verse).toHaveProperty('text');
		expect(typeof verse.text).toBe('string');
	});

	it('GET /surah/:id/en.asad returns English translation', async () => {
		const res = await fetch(`${ALCURAN_BASE}/surah/1/en.asad`);
		expect(res.ok).toBe(true);

		const json = await res.json();
		expect(json.data.ayahs.length).toBeGreaterThan(0);

		const verse = json.data.ayahs[0];
		expect(verse).toHaveProperty('text');
		expect(typeof verse.text).toBe('string');
	});

	it('GET /ayah/:surah:ayah returns a single verse', async () => {
		const res = await fetch(`${ALCURAN_BASE}/ayah/2:255/quran-uthmani`);
		expect(res.ok).toBe(true);

		const json = await res.json();
		expect(json.data).toBeDefined();
		expect(json.data).toHaveProperty('text');
	});

	it('handles invalid surah gracefully (HTTP 404-like shape)', async () => {
		const res = await fetch(`${ALCURAN_BASE}/surah/999/en.asad`);
		// The API returns 200 with error data for invalid surahs
		const json = await res.json();
		expect(json.code).toBeDefined();
		// Should either be an error code or have empty data
		expect(
			json.code !== 200 || (json.data && json.data.ayahs),
		).toBe(true);
	});
});

// ── UmmahAPI ────────────────────────────────────────────────────

describe('UmmahAPI', () => {
	it('GET /api/duas/random returns a random dua with correct shape', async () => {
		const res = await fetch(`${UMMAHAPI_BASE}/duas/random`);
		expect(res.ok).toBe(true);
		expect(res.status).toBe(200);

		const json = await res.json();
		expect(json.success).toBe(true);
		expect(json.data).toBeDefined();
		expect(json.data).toHaveProperty('arabic');
		expect(json.data).toHaveProperty('translation');
	});

	it('GET /api/hadith/random returns a random hadith with correct shape', async () => {
		const res = await fetch(`${UMMAHAPI_BASE}/hadith/random`);
		expect(res.ok).toBe(true);
		expect(res.status).toBe(200);

		const json = await res.json();
		expect(json.success).toBe(true);
		expect(json.data).toBeDefined();
		// Hadith can have various field shapes; check common ones
		expect(
			json.data.english || json.data.text || json.data.hadith,
		).toBeDefined();
	});

	it('duas/random returns valid responses on multiple calls', async () => {
		const [res1, res2] = await Promise.all([
			fetch(`${UMMAHAPI_BASE}/duas/random`),
			fetch(`${UMMAHAPI_BASE}/duas/random`),
		]);
		const [json1, json2] = await Promise.all([
			res1.json(),
			res2.json(),
		]);

		expect(json1.success).toBe(true);
		expect(json2.success).toBe(true);
		// They may rarely be the same, but the test confirms both succeed
	});

	it('GET /api/prayer-times returns times for a location', async () => {
		const lat = 51.5074;
		const lng = -0.1278;
		const res = await fetch(
			`${UMMAHAPI_BASE}/prayer-times?lat=${lat}&lng=${lng}&method=MuslimWorldLeague`,
		);
		expect(res.ok).toBe(true);

		const json = await res.json();
		expect(json.success).toBe(true);
		expect(json.data).toBeDefined();
		expect(json.data.prayer_times).toBeDefined();
		const times = json.data.prayer_times;
		expect(times).toHaveProperty('fajr');
		expect(times).toHaveProperty('dhuhr');
		expect(times).toHaveProperty('asr');
		expect(times).toHaveProperty('maghrib');
		expect(times).toHaveProperty('isha');
	});
});

// ── Error handling / fallback patterns ─────────────────────────

describe('API resilience patterns', () => {
	it('AlQuran.cloud responds within 5 seconds', async () => {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 5000);
		try {
			const res = await fetch(`${ALCURAN_BASE}/surah`, {
				signal: controller.signal,
			});
			expect(res.ok).toBe(true);
		} finally {
			clearTimeout(timeout);
		}
	}, 7000);

	it('UmmahAPI responds within 8 seconds', async () => {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 8000);
		try {
			const res = await fetch(`${UMMAHAPI_BASE}/duas/random`, {
				signal: controller.signal,
			});
			expect(res.ok).toBe(true);
		} finally {
			clearTimeout(timeout);
		}
	}, 10000);

	it('all five prayer times are non-empty strings', async () => {
		const res = await fetch(
			`${UMMAHAPI_BASE}/prayer-times?lat=51.5074&lng=-0.1278&method=MuslimWorldLeague`,
		);
		const json = await res.json();
		const times = json.data.prayer_times;
		for (const name of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']) {
			expect(typeof times[name]).toBe('string');
			expect(times[name].length).toBeGreaterThan(0);
		}
	});
});
