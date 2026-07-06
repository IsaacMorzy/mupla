import type { APIContext } from 'astro';
import rss from '@astrojs/rss';
import config from '../content/config/config.json';
import { descriptionPreview, listBlogs, listEvents } from '../lib/data';

export const prerender = true;

export async function GET(context: APIContext) {
	const [posts, events] = await Promise.all([listBlogs(), listEvents()]);

	const blogItems = posts
		.filter((post) => post.title && post.pubDate)
		.map((post) => ({
			title: post.title as string,
			description: post.description ?? undefined,
			pubDate: new Date(post.pubDate as string),
			link: `/blog/${post._sys.filename}/`,
			categories: ['blog'],
		}));

	const eventItems = events
		.filter((event) => event.title && event.date)
		.map((event) => ({
			title: `[Event] ${event.title}`,
			description: [
				event.location ? `Location: ${event.location}` : null,
				event.cost ? `Cost: ${event.cost}` : null,
				descriptionPreview(event.description),
			]
				.filter(Boolean)
				.join('\n\n'),
			pubDate: new Date(event.date as string),
			link: `/events/${event._sys.filename}/`,
			categories: ['event'],
		}));

	return rss({
		title: config.seo.title,
		description: config.seo.description,
		site: context.site ?? '',
		items: [...blogItems, ...eventItems].sort(
			(a, b) => b.pubDate.getTime() - a.pubDate.getTime(),
		),
		customData: '<language>en-us</language>',
	});
}
