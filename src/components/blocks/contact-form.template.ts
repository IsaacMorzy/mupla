import type { Template } from 'tinacms';

export const contactFormBlockSchema: Template = {
	name: 'contact_form',
	label: 'Contact Form',
	fields: [
		{
			type: 'string',
			label: 'Form action URL (optional)',
			name: 'action',
			description:
				'If set, the form POSTs here as application/x-www-form-urlencoded and shows a success/error Alert. Compatible with Formspree, Netlify Forms, Buttondown, Basin, etc. Leave blank to fall back to opening a mailto: link.',
		},
		{ type: 'string', label: 'Send email to', name: 'to', description: 'The email address that submitted messages will be sent to. Used only when no action URL is set.' },
		{ type: 'string', label: 'Default subject', name: 'subject', description: 'Used as the email subject line. Visitors can change it before sending.' },
		{
			type: 'string',
			label: 'Submit button label',
			name: 'submitLabel',
		},
		{
			type: 'string',
			label: 'Success message',
			name: 'successMessage',
			ui: { component: 'textarea' },
		},
		{
			type: 'string',
			label: 'Error message',
			name: 'errorMessage',
			ui: { component: 'textarea' },
		},
	],
	ui: {
		defaultItem: {
			to: 'hello@mupla.org',
			subject: 'Message from the mupla website',
			submitLabel: 'Send message',
			successMessage: "Thanks for reaching out! Your message has been sent — we'll be in touch within two business days.",
			errorMessage: "Something went wrong. Please email us directly at hello@mupla.org.",
		},
	},
};
