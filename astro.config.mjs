// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
import icon from 'astro-icon';
import tina from '@tinacms/astro/integration';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';
import cloudflare from '@astrojs/cloudflare';
import netlify from '@astrojs/netlify';

// Host-neutral: every content page prerenders to static HTML, and the one
// on-demand route (/tina-island, the visual-editing endpoint) is served by
// whichever host built the site. Each platform sets its own build env var
// automatically — nothing to configure — and any other host (including a
// local `wrangler deploy`) falls back to a portable Node server. Set
// DEPLOY_ADAPTER to force a specific adapter when no env var applies.
function getAdapter() {
	const nodeStandalone = node({ mode: 'standalone' });
	switch (process.env.DEPLOY_ADAPTER) {
		case 'vercel': return vercel({ imageService: true });
		case 'cloudflare': return cloudflare();
		case 'netlify': return netlify();
		case 'node': return nodeStandalone;
		case undefined: break; // no override -> auto-detect below
		default:
			console.warn(`[astro.config] Unknown DEPLOY_ADAPTER "${process.env.DEPLOY_ADAPTER}" - ignoring and auto-detecting.`);
	}
	if (process.env.VERCEL) return vercel({ imageService: true });
	// CF_PAGES = Cloudflare Pages CI; WORKERS_CI = Cloudflare Workers Builds CI.
	if (process.env.WORKERS_CI || process.env.CF_PAGES) return cloudflare();
	if (process.env.NETLIFY) return netlify();

	return nodeStandalone;
}

// Prefer an explicit SITE_URL; otherwise use the URL the platform injects so
// zero-config deploys still emit absolute URLs (sitemap, RSS, OpenGraph).
// Cloudflare Workers exposes no such var — set SITE_URL there for correct
// canonicals. Local builds fall back to localhost.
function getSiteUrl() {
	if (process.env.SITE_URL) return process.env.SITE_URL;
	if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
	if (process.env.CF_PAGES_URL) return process.env.CF_PAGES_URL;
	if (process.env.NETLIFY && process.env.URL) return process.env.URL;

	return 'http://localhost:4321';
}

// https://astro.build/config
export default defineConfig({
	site: getSiteUrl(),
	output: 'static',
	adapter: getAdapter(),
	redirects: { '/home': '/' },
	integrations: [
		mdx(),
		sitemap({
			// Split sitemap into logical chunks for better crawl efficiency
			chunks: {
				'blog': (item) => {
					if (/\/blog\//.test(item.url) && !/\/blog\/search/.test(item.url)) {
						item.changefreq = ChangeFreqEnum.WEEKLY;
						item.priority = 0.8;
						return item;
					}
				},
				'events': (item) => {
					if (/\/events\//.test(item.url)) {
						item.changefreq = ChangeFreqEnum.WEEKLY;
						item.priority = 0.7;
						return item;
					}
				},
				'programs': (item) => {
					if (/\/(about|programs|team|faq|get-involved|contact|donate|privacy|terms)/.test(item.url)) {
						item.changefreq = ChangeFreqEnum.MONTHLY;
						item.priority = 0.6;
						return item;
					}
				},
			},
			// Exclude utility pages from sitemap
			filter: (page) =>
				!/\/(404|oxfam|home)\//.test(page) &&
				!/\/blog\/search/.test(page),
			// Exclude unused XML namespaces for leaner output
			namespaces: {
				news: false,
				video: false,
			},
			serialize(item) {
				// Homepage gets highest priority
				if (item.url.endsWith('/') && item.url.split('/').length <= 4) {
					item.changefreq = ChangeFreqEnum.WEEKLY;
					item.priority = 1.0;
				}
				return item;
			},
		}),
		icon(),
		tina(),
	],
	build: {
		// Inline the (~10 KiB) bundled CSS into a <style> in <head> instead of a
		// separate render-blocking <link>. Astro's default ('auto') only inlines
		// stylesheets under ~4 KiB, leaving ours blocking first paint on mobile.
		inlineStylesheets: 'always',
	},
	// Tina Cloud rewrites CMS image src to assets.tina.io; let Astro
	// fetch those URLs at build time so <Image> can transcode + resize them.
	image: {
		// Astro 6 responsive images: auto-emit srcset so the browser picks a
		// variant matched to the rendered box + DPR, not the full intrinsic size.
		layout: 'constrained',
		remotePatterns: [{ protocol: 'https', hostname: 'assets.tina.io' }],
	},
	vite: {
		plugins: [tailwindcss(), tinaAdminDevRedirect()],
		// Bundle @tinacms/astro into the SSR build instead of resolving it
		// per-module on every cold request — otherwise each
		// `import TinaMarkdown from '@tinacms/astro/TinaMarkdown.astro'`
		// triggers a full Vite resolve + Astro-plugin compile of the
		// package's source `.astro` files on the first request.
		ssr: {
			noExternal: ['@tinacms/astro', '@tinacms/bridge'],
		},
		build: {
			rollupOptions: {
				onwarn(warning, warn) {
					if (warning.code === 'UNUSED_EXTERNAL_IMPORT' &&
						warning.exporter === 'tinacms/dist/client') {
						return;
					}
					warn(warning);
				}
			}
		}
	}
});
