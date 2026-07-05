import type { Collection } from 'tinacms';

export const EventCollection: Collection = {
	name: 'event',
	label: 'Events',
	path: 'src/content/event',
	format: 'mdx',
	ui: {
		router({ document }) {
			return `/events/${document._sys.filename}`;
		},
	},
	fields: [
		{
			type: 'string',
			name: 'title',
			label: 'Event title',
			isTitle: true,
			required: true,
		},
		{
			name: 'date',
			label: 'Start date & time',
			type: 'datetime',
			required: true,
		},
		{
			name: 'endDate',
			label: 'End date & time (optional, for multi-day events)',
			type: 'datetime',
		},
		{
			name: 'location',
			label: 'Location',
			type: 'string',
			required: true,
			description: 'Where the event is held (e.g. "mupla community center" or "123 Main St, Springfield").',
		},
		{
			name: 'image',
			label: 'Event image',
			type: 'image',
		},
		{
			name: 'rsvpUrl',
			label: 'RSVP / registration URL (optional)',
			type: 'string',
			description: 'Where to send people who want to register. Leave blank for drop-in events.',
		},
		{
			name: 'cost',
			label: 'Cost',
			type: 'string',
			description: 'Free, suggested donation, $10/person, etc.',
		},
		{
			type: 'rich-text',
			name: 'description',
			label: 'Description',
			isBody: true,
		},
	],
};
