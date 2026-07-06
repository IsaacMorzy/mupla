import { listBlogs, listEvents } from '../../lib/data';

/**
 * Walk a TinaCMS Rich-Text JSON AST and flatten it to plain text. The
 * generated client types Rich Text as `any`, so we treat it as unknown
 * and walk defensively — only the `text` leaf (and any node holding a
 * `children` array) needs handling for indexing purposes.
 */
function plainText(node: unknown): string {
	if (!node) return '';
	if (typeof node === 'string') return node;
	if (Array.isArray(node)) return node.map(plainText).join(' ');
	if (typeof node !== 'object') return '';
	const n = node as Record<string, unknown>;
	if (n.type === 'text' && typeof n.text === 'string') return n.text;
	if (Array.isArray(n.children)) return (n.children as unknown[]).map(plainText).join(' ');
	return '';
}

const collapse = (s: string): string => s.replace(/\s+/g, ' ').trim();

type SearchEntry = {
	title: string;
	url: string;
	category: 'blog' | 'event';
	pubDate: string | null;
	excerpt: string;
	fullText: string;
};

export const prerender = true;

export async function GET(): Promise<Response> {
	const [blogs, events] = await Promise.all([listBlogs(), listEvents()]);

	const blogEntries: SearchEntry[] = (blogs as Array<Record<string, unknown>>)
		.filter((p): p is Record<string, unknown> => Boolean(p))
		.map((p): SearchEntry => {
			const title = typeof p.title === 'string' ? p.title : '';
			const pubDate = typeof p.pubDate === 'string' ? p.pubDate : null;
			const slug = (p._sys as { filename?: string } | undefined)?.filename ?? '';
			const body = collapse(plainText(p.body));
			const description = collapse(typeof p.description === 'string' ? p.description : '');
			const fullText = body || description;
			return {
				title,
				url: slug ? `/blog/${slug}/` : '',
				category: 'blog',
				pubDate,
				excerpt: fullText.slice(0, 240),
				fullText: fullText.slice(0, 5000),
			};
		})
		.filter((e) => e.title && e.url && e.fullText);

	const eventEntries: SearchEntry[] = (events as Array<Record<string, unknown>>)
		.filter((e): e is Record<string, unknown> => Boolean(e))
		.map((e): SearchEntry => {
			const title = typeof e.title === 'string' ? e.title : '';
			const pubDate = typeof e.date === 'string' ? e.date : null;
			const slug = (e._sys as { filename?: string } | undefined)?.filename ?? '';
			const description = collapse(plainText(e.description));
			const location = typeof e.location === 'string' ? `Location: ${e.location}.` : '';
			const cost = typeof e.cost === 'string' ? `Cost: ${e.cost}.` : '';
			const fullText = [location, cost, description].filter(Boolean).join(' ');
			return {
				title,
				url: slug ? `/events/${slug}/` : '',
				category: 'event',
				pubDate,
				excerpt: fullText.slice(0, 240),
				fullText: fullText.slice(0, 5000),
			};
		})
		.filter((e) => e.title && e.url && e.fullText);

	const entries = [...blogEntries, ...eventEntries];
	return new Response(JSON.stringify(entries), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'public, max-age=300',
		},
	});
}
