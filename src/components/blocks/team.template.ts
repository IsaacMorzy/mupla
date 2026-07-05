import type { Template } from 'tinacms';
import type { TeamMember } from '../../lib/data';

export const teamBlockSchema: Template = {
	name: 'team',
	label: 'Team',
	fields: [
		{ type: 'string', label: 'Title', name: 'title' },
		{ type: 'string', label: 'Description', name: 'description', ui: { component: 'textarea' } },
		{
			type: 'object',
			label: 'Team Members',
			name: 'members',
			list: true,
			ui: {
				defaultItem: { name: 'New member', role: 'Volunteer' },
				itemProps: (i: TeamMember) => ({ label: `${i.name ?? ''} — ${i.role ?? ''}` }),
			},
			fields: [
				{ type: 'string', label: 'Name', name: 'name' },
				{ type: 'string', label: 'Role', name: 'role' },
				{ type: 'string', label: 'Short Bio', name: 'bio', ui: { component: 'textarea' } },
				{ type: 'image', label: 'Avatar', name: 'avatar' },
			],
		},
	],
	ui: {
		defaultItem: {
			title: 'Our team',
			description: 'The volunteers and staff who keep mupla moving forward.',
			members: [
				{ name: 'Placeholder Name', role: 'Director', bio: 'A short bio describing this team member and their work with the foundation.' },
			],
		},
	},
};
