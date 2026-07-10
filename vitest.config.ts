import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		setupFiles: [],
		// Astro's fetch API is global in Node 22+, but mock where needed
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json'],
			// Tests currently exercise external APIs; src/lib coverage will
			// increase as unit tests for data.ts, cn.ts, islands.ts are added.
		},
	},
	resolve: {
		alias: {
			'@/': path.resolve('./src/'),
		},
	},
});
