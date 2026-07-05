import type { Template } from 'tinacms';
import type { FaqItem } from '../../lib/data';

export const faqBlockSchema: Template = {
	name: 'faq',
	label: 'FAQ',
	fields: [
		{ type: 'string', label: 'Title', name: 'title' },
		{ type: 'string', label: 'Description', name: 'description', ui: { component: 'textarea' } },
		{
			type: 'object',
			label: 'Questions',
			name: 'items',
			list: true,
			ui: {
				defaultItem: { question: 'What is the mupla foundation?', answer: 'The mupla foundation is a Muslim community foundation dedicated to education, service, and community building.' },
				itemProps: (i: FaqItem) => ({ label: i?.question ?? '' }),
			},
			fields: [
				{ type: 'string', label: 'Question', name: 'question' },
				{ type: 'rich-text', label: 'Answer', name: 'answer' },
			],
		},
	],
	ui: {
		defaultItem: {
			title: 'Frequently asked questions',
			description: 'Answers to the questions we hear most often from our community.',
			items: [
				{
					question: 'How can I get involved?',
					answer: 'Visit the Get Involved page to see current volunteer opportunities, upcoming events, and ways to support our programs.',
				},
			],
		},
	},
};
