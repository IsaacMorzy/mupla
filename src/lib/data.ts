/**
 * Per-collection data loaders + the data shapes they return.
 *
 * Loaders call the generated Tina client and pipe the result through
 * `requestWithMetadata()` so the editor overlay flows in when the page
 * renders inside the admin iframe and `tinaField()` has its metadata.
 *
 * Types below are pure derivations — no hand-written shapes. Each one is
 * either inferred from a loader's return type (`CmsConfig`/`CmsPage`/
 * `CmsBlog`/`CmsEvent`) or `Extract`/index-accessed off those. The Tina
 * collection is the source of truth; regen with `tinacms dev` and
 * everything downstream updates.
 */
import type { TinaRichTextContent } from '@tinacms/astro';
import { requestWithMetadata } from '@tinacms/astro/data';
import client from '../../tina/__generated__/client';

export const getConfig = () =>
	requestWithMetadata(client.queries.config({ relativePath: 'config.json' }));

export const getPage = (slug: string) =>
	requestWithMetadata(
		client.queries.page({ relativePath: `${slug}.mdx` }),
		{ priority: 'primary' },
	);

export const getBlog = (slug: string) =>
	requestWithMetadata(
		client.queries.blog({ relativePath: `${slug}.mdx` }),
		{ priority: 'primary' },
	);

export const getEvent = (slug: string) =>
	requestWithMetadata(
		client.queries.event({ relativePath: `${slug}.mdx` }),
		{ priority: 'primary' },
	);

export async function listPages() {
	const result = await client.queries.pageConnection();
	return (result.data.pageConnection.edges ?? [])
		.flatMap((edge) => (edge?.node ? [edge.node] : []));
}

export async function listBlogs() {
	const result = await client.queries.blogConnection();
	return (result.data.blogConnection.edges ?? [])
		.flatMap((edge) => (edge?.node ? [edge.node] : []))
		.sort((a, b) => {
			const ad = a.pubDate ? new Date(a.pubDate).valueOf() : 0;
			const bd = b.pubDate ? new Date(b.pubDate).valueOf() : 0;
			return bd - ad;
		});
}

export async function listEvents() {
	const result = await client.queries.eventConnection();
	return (result.data.eventConnection.edges ?? [])
		.flatMap((edge) => (edge?.node ? [edge.node] : []))
		.sort((a, b) => {
			const ad = a.date ? new Date(a.date).valueOf() : 0;
			const bd = b.date ? new Date(b.date).valueOf() : 0;
			return ad - bd;
		});
}

export type CmsConfig = Awaited<ReturnType<typeof getConfig>>['data']['config'];
export type CmsPage = Awaited<ReturnType<typeof getPage>>['data']['page'];
export type CmsBlog = Awaited<ReturnType<typeof getBlog>>['data']['blog'];
export type CmsEvent = Awaited<ReturnType<typeof getEvent>>['data']['event'];

export type PageBlock = NonNullable<NonNullable<CmsPage['blocks']>[number]>;
export type PageBlockTypename = PageBlock['__typename'];

export type HeroBlock = Extract<PageBlock, { __typename: 'PageBlocksHero' }>;
export type CalloutBlock = Extract<PageBlock, { __typename: 'PageBlocksCallout' }>;
export type FeaturesBlock = Extract<PageBlock, { __typename: 'PageBlocksFeatures' }>;
export type StatsBlock = Extract<PageBlock, { __typename: 'PageBlocksStats' }>;
export type CtaBlock = Extract<PageBlock, { __typename: 'PageBlocksCta' }>;
export type ContentBlock = Extract<PageBlock, { __typename: 'PageBlocksContent' }>;
export type TestimonialBlock = Extract<PageBlock, { __typename: 'PageBlocksTestimonial' }>;
export type VideoBlock = Extract<PageBlock, { __typename: 'PageBlocksVideo' }>;
export type SplitBlock = Extract<PageBlock, { __typename: 'PageBlocksSplit' }>;
export type FaqBlock = Extract<PageBlock, { __typename: 'PageBlocksFaq' }>;
export type TeamBlock = Extract<PageBlock, { __typename: 'PageBlocksTeam' }>;
export type ContactFormBlock = Extract<PageBlock, { __typename: 'PageBlocksContactForm' }>;

export type CmsConfigNav = NonNullable<NonNullable<CmsConfig['nav']>[number]>;
export type CmsConfigContactLink = NonNullable<NonNullable<CmsConfig['contactLinks']>[number]>;
export type CmsConfigSeo = NonNullable<CmsConfig['seo']>;

export type Action = NonNullable<NonNullable<HeroBlock['actions']>[number]>;
export type ImageField = NonNullable<HeroBlock['image']>;
export type FeatureItem = NonNullable<NonNullable<FeaturesBlock['items']>[number]>;
export type StatItem = NonNullable<NonNullable<StatsBlock['stats']>[number]>;
export type TestimonialItem = NonNullable<NonNullable<TestimonialBlock['testimonials']>[number]>;
export type FaqItem = NonNullable<NonNullable<FaqBlock['items']>[number]>;
export type TeamMember = NonNullable<NonNullable<TeamBlock['members']>[number]>;

/**
 * Stable string view of a post's category for comparators (related-posts etc.).
 * `CmsBlog.category` is `string | null` from the generated Tina GraphQL type —
 * coalesce to '' so `.sort()` and `.filter()` comparisons don't blow up.
 * Single source of truth for the related-posts sort in
 * `src/pages/blog/[...slug].astro` (and any future comparator).
 */
export const categoryOf = (p: CmsBlog): string => (p.category ?? '');

/** Tina rich-text bodies are typed as `any` in the generated client; this is what `<TinaMarkdown>` expects. */
export type RichText = TinaRichTextContent;

/**
 * Flatten a TinaCMS Rich-Text AST (or a plain string, or nullish) into a
 * single-line plaintext snippet suitable for card previews and RSS
 * descriptions. Walks defensively — accepts whatever the GraphQL
 * client returns. Mirrors the walker in `blog/search.json.ts`; keeping
 * it here as well so any consumer can import one helper.
 */
export function descriptionPreview(value: unknown, maxLen = 220): string {
	const walk = (node: unknown): string => {
		if (!node) return '';
		if (typeof node === 'string') return node;
		if (Array.isArray(node)) return node.map(walk).join(' ');
		if (typeof node !== 'object') return '';
		const n = node as Record<string, unknown>;
		if (n.type === 'text' && typeof n.text === 'string') return n.text;
		if (Array.isArray(n.children)) return (n.children as unknown[]).map(walk).join(' ');
		return '';
	};
	const raw = walk(value).replace(/<[^>]+>/g, '').replace(/[#*_`>]/g, '');
	const collapsed = raw.replace(/\s+/g, ' ').trim();
	return collapsed.length > maxLen ? `${collapsed.slice(0, maxLen).trimEnd()}…` : collapsed;
}

/**
 * Same defensive walker as `descriptionPreview`, but returns an array of
 * paragraph strings instead of a single collapsed line. Used by the event
 * detail page to render the body prose as a sequence of `<p>` elements
 * when `data.description` arrives as a Tina Rich-Text AST (or a YAML
 * block-scalar string that has to be split on blank lines). Tina's
 * local GraphQL backend occasionally returns a flat array or an
 * unrooted structure for fields declared with `isBody: true`, so this
 * helper flattens the whole tree first and splits on blank lines
 * — easier to reason about than walking per-node and trying to
 * reconstruct paragraph boundaries.
 */
export function descriptionParagraphs(value: unknown): string[] {
	const walkText = (node: unknown): string => {
		if (!node) return '';
		if (typeof node === 'string') return node;
		// Top-level arrays (Tina quirk) and root-level `children` arrays
		// are joined with blank lines so each element becomes its own <p>.
		const isRootLike = (n: unknown): boolean => {
			if (Array.isArray(n)) return true;
			if (!n || typeof n !== 'object') return false;
			const rec = n as Record<string, unknown>;
			return rec.type === 'root' || Array.isArray(rec.children);
		};
		if (Array.isArray(node)) return node.map(walkText).join('\n\n');
		if (typeof node !== 'object') return '';
		const n = node as Record<string, unknown>;
		if (n.type === 'text' && typeof n.text === 'string') return n.text;
		if (Array.isArray(n.children)) {
			// Only treat the AST ROOT as a paragraph boundary, not every parent
			// that happens to have a `children` array — otherwise inline siblings
			// (links, bold) inside a single `<p>` from a CMS-authored rich-text
			// field would over-split into multiple `<p>` elements.
			const sep = n.type === 'root' ? '\n\n' : '';
			return (n.children as unknown[]).map(walkText).join(sep);
		}
		return '';
	};
	const text = walkText(value);
	return text
		.split(/\n\n+/)
		.map((p) => p.replace(/\s+/g, ' ').trim())
		.filter((p) => p.length > 0);
}
