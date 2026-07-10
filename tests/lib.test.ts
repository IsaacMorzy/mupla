import { describe, it, expect } from 'vitest';
import { cn } from '../src/lib/cn';
import { descriptionPreview, descriptionParagraphs, categoryOf } from '../src/lib/data';
import type { CmsBlog } from '../src/lib/data';

// ── cn.ts ───────────────────────────────────────────────────────

describe('cn (class merge utility)', () => {
	it('returns empty string for no arguments', () => {
		expect(cn()).toBe('');
	});

	it('joins simple strings', () => {
		expect(cn('foo', 'bar')).toBe('foo bar');
	});

	it('filters out falsy values', () => {
		expect(cn('foo', false, null, undefined, '', 'bar')).toBe('foo bar');
	});

	it('handles conditional classes', () => {
		expect(cn('base', true && 'active', false && 'hidden')).toBe('base active');
	});

	it('deduplicates conflicting Tailwind classes via twMerge', () => {
		expect(cn('px-4', 'px-2')).toBe('px-2');
		expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
	});

	it('preserves non-conflicting classes across different properties', () => {
		// text-lg (font-size), font-bold (font-weight), text-blue-500 (color)
		// are different CSS properties — twMerge keeps all three
		expect(cn('text-lg', 'font-bold', 'text-blue-500')).toBe('text-lg font-bold text-blue-500');
	});

	it('handles arrays of classes', () => {
		expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
	});

	it('handles nested arrays', () => {
		expect(cn(['foo', ['bar', 'baz']])).toBe('foo bar baz');
	});

	it('handles object syntax', () => {
		expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
	});

	it('handles mixed syntax', () => {
		expect(cn('base', { active: true, hidden: false }, ['extra'])).toBe('base active extra');
	});
});

// ── data.ts — descriptionPreview ────────────────────────────────

describe('descriptionPreview', () => {
	it('returns empty string for null/undefined', () => {
		expect(descriptionPreview(null)).toBe('');
		expect(descriptionPreview(undefined)).toBe('');
	});

	it('returns plain string unchanged (if within maxLen)', () => {
		expect(descriptionPreview('Hello world')).toBe('Hello world');
	});

	it('truncates long strings with ellipsis', () => {
		const long = 'a'.repeat(300);
		const result = descriptionPreview(long, 100);
		expect(result.length).toBeLessThanOrEqual(103); // 100 + '…'
		expect(result.endsWith('…')).toBe(true);
	});

	it('walks TinaCMS rich-text AST structure', () => {
		const ast = {
			type: 'root',
			children: [
				{
					type: 'paragraph',
					children: [{ type: 'text', text: 'First paragraph' }],
				},
				{
					type: 'paragraph',
					children: [{ type: 'text', text: 'Second paragraph' }],
				},
			],
		};
		expect(descriptionPreview(ast)).toBe('First paragraph Second paragraph');
	});

	it('strips markdown formatting characters', () => {
		const ast = {
			type: 'root',
			children: [
				{
					type: 'paragraph',
					children: [{ type: 'text', text: 'This **has** some _markdown_ and >quotes<' }],
				},
			],
		};
		const result = descriptionPreview(ast);
		expect(result).not.toContain('#');
		expect(result).not.toContain('*');
		expect(result).not.toContain('_');
	});

	it('handles deeply nested children', () => {
		const ast = {
			type: 'root',
			children: [
				{
					type: 'paragraph',
					children: [
						{
							type: 'link',
							children: [{ type: 'text', text: 'clickable text' }],
						},
					],
				},
			],
		};
		expect(descriptionPreview(ast)).toBe('clickable text');
	});

	it('returns empty for non-string, non-object input', () => {
		expect(descriptionPreview(42)).toBe('');
		expect(descriptionPreview(true)).toBe('');
	});

	it('handles arrays directly', () => {
		expect(descriptionPreview(['Hello', ' ', 'world'])).toBe('Hello world');
	});

	it('handles empty arrays', () => {
		expect(descriptionPreview([])).toBe('');
	});
});

// ── data.ts — descriptionParagraphs ─────────────────────────────

describe('descriptionParagraphs', () => {
	it('returns empty array for null/undefined', () => {
		expect(descriptionParagraphs(null)).toEqual([]);
		expect(descriptionParagraphs(undefined)).toEqual([]);
	});

	it('splits plain string on double newlines into paragraphs', () => {
		const text = 'First paragraph.\n\nSecond paragraph.\n\nThird.';
		expect(descriptionParagraphs(text)).toEqual([
			'First paragraph.',
			'Second paragraph.',
			'Third.',
		]);
	});

	it('collapses whitespace within paragraphs', () => {
		const text = 'Hello   world\n\n  Extra   spaces  ';
		expect(descriptionParagraphs(text)).toEqual(['Hello world', 'Extra spaces']);
	});

	it('filters empty paragraphs', () => {
		const text = 'A\n\n\n\nB';
		expect(descriptionParagraphs(text)).toEqual(['A', 'B']);
	});

	it('walks TinaCMS rich-text AST and splits on root-level paragraphs', () => {
		const ast = {
			type: 'root',
			children: [
				{
					type: 'paragraph',
					children: [{ type: 'text', text: 'Para one' }],
				},
				{
					type: 'paragraph',
					children: [{ type: 'text', text: 'Para two' }],
				},
			],
		};
		expect(descriptionParagraphs(ast)).toEqual(['Para one', 'Para two']);
	});

	it('does not over-split inline formatting within a paragraph', () => {
		const ast = {
			type: 'root',
			children: [
				{
					type: 'paragraph',
					children: [
						{ type: 'text', text: 'normal ' },
						{
							type: 'link',
							children: [{ type: 'text', text: 'linked' }],
						},
						{ type: 'text', text: ' text' },
					],
				},
			],
		};
		expect(descriptionParagraphs(ast)).toEqual(['normal linked text']);
	});

	it('handles arrays — each element becomes a paragraph', () => {
		// Arrays are joined with \n\n then split on double-newlines,
		// so each array element becomes its own paragraph.
		expect(descriptionParagraphs(['First', 'Second'])).toEqual(['First', 'Second']);
	});

	it('handles empty children gracefully', () => {
		const ast = { type: 'root', children: [] };
		expect(descriptionParagraphs(ast)).toEqual([]);
	});
});

// ── data.ts — categoryOf ─────────────────────────────────────────

describe('categoryOf', () => {
	it('returns the category string when set', () => {
		const post = { category: 'Community' } as CmsBlog;
		expect(categoryOf(post)).toBe('Community');
	});

	it('returns empty string when category is null', () => {
		const post = { category: null } as unknown as CmsBlog;
		expect(categoryOf(post)).toBe('');
	});

	it('returns empty string when category is undefined', () => {
		const post = {} as CmsBlog;
		expect(categoryOf(post)).toBe('');
	});
});
