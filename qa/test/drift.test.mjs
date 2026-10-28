import assert from 'node:assert/strict'
import { test } from 'node:test'
import { certify, check, indexApp, overrides, scan, specificity, subject, themeUses } from '../drift.mjs'

test('scan keeps strings and bracketed groups whole, and drops comments', () => {
	const { preludes, decls } = scan(`/* a { b: c; } */
		.a:is(.b, .c) { --x: url("data:image/svg+xml;a{b}"); color: var(--y) }
		@media (max-width: 600px) { body { --z: 1px; } }`)
	assert.deepEqual(preludes, ['.a:is(.b, .c)', '@media (max-width: 600px)', 'body'])
	assert.deepEqual(decls, [
		{ name: '--x', value: 'url("data:image/svg+xml;a{b}")', scope: '.a:is(.b, .c)' },
		{ name: 'color', value: 'var(--y)', scope: '.a:is(.b, .c)' },
		{ name: '--z', value: '1px', scope: '@media (max-width: 600px) » body' },
	])
})

test('specificity counts ids, classes and elements, :is() by its most specific branch, :where() as nothing', () => {
	assert.deepEqual(specificity('body.theme-dark'), [0, 1, 1])
	assert.deepEqual(specificity('#a .b > p::before'), [1, 1, 2])
	assert.deepEqual(specificity('.a:is(.b, #c)'), [1, 1, 0])
	assert.deepEqual(specificity(':where(.a, #b) p'), [0, 0, 1])
})

test("subject is body for a selector on body's mode and setting classes", () => {
	assert.equal(subject('body.theme-dark'), 'body')
	assert.equal(subject('body.colorblind_tritan.theme-light'), 'body')
	assert.equal(subject('body.kanban-on'), 'body')
	assert.equal(subject('.theme-dark .menu'), '.menu')
})

test("themeUses lists Obsidian's variables and classes and leaves out the theme's own", () => {
	const uses = themeUses(`body { --h1-color-theme: #fff; --h1-color: var(--h1-color-theme); --text-normal: var(--color-base-100); }
		body.colorblind_tritan .callout[data-callout="note"] { color: var(--text-accent); }
		.kanban-plugin__lane { padding: 0; }`)
	assert.deepEqual(uses.sets, ['--h1-color', '--text-normal'])
	assert.deepEqual(uses.reads, ['--color-base-100', '--text-accent'])
	assert.deepEqual(uses.selectors, ['.callout', '.kanban-plugin__lane', '[data-callout]'])
})

const release = (css, js = '') => indexApp(css, js)
const THEME = `body { --text-normal: var(--color-base-100); } .theme-dark .callout { color: var(--text-accent); }`
const APP_CSS = `body { --color-base-100: #dadada; --text-accent: var(--color-accent); --color-accent: #8a5cf5; } .theme-dark { --text-normal: var(--color-base-100); } .callout { color: var(--text-normal); } .theme-dark { }`

test('a certified release tracks what it has and sets aside what it never had', () => {
	const uses = themeUses(`${THEME} .kanban-plugin { color: red; }`)
	const base = certify('1.0.0', release(APP_CSS), uses)
	assert.deepEqual(base.uses.reads, ['--color-base-100', '--text-accent'])
	assert.ok(base.unknown.includes('.kanban-plugin'))
	assert.equal(base.defaults['--color-accent'].body, '#8a5cf5')
})

test('the check fails on a variable or class Obsidian no longer has', () => {
	const uses = themeUses(THEME)
	const base = certify('1.0.0', release(APP_CSS), uses)
	const next = release(APP_CSS.replace('--text-accent: var(--color-accent);', '').replace('.callout {', '.notice {'))
	const { gone } = check(next, uses, base)
	assert.deepEqual(gone, [
		{ kind: 'reads', token: '--text-accent' },
		{ kind: 'selectors', token: '.callout' },
	])
})

test('the check reports a changed default down a var() chain', () => {
	const uses = themeUses(THEME)
	const base = certify('1.0.0', release(APP_CSS), uses)
	const { gone, changed } = check(release(APP_CSS.replace('#8a5cf5', '#ff0000')), uses, base)
	assert.deepEqual(gone, [])
	assert.equal(changed.length, 1)
	assert.equal(changed[0].variable, '--color-accent')
	assert.deepEqual(changed[0].behind, ['--text-accent'])
	assert.deepEqual(changed[0].diffs, [{ scope: 'body', before: '#8a5cf5', after: '#ff0000' }])
})

test("overrides flags a mode selector that outranks the theme's value", () => {
	const uses = themeUses('body { --background-primary: #000; }')
	const found = overrides(release('body { --background-primary: #fff; } body.theme-dark { --background-primary: #1e1e1e; }'), uses)
	assert.deepEqual(found.map((f) => f.key), ['--background-primary body.theme-dark'])
	assert.deepEqual(overrides(release('body { --background-primary: #fff; } body.theme-dark { --background-primary: #000; }'), uses), [])
})
