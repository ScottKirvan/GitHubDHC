import assert from 'node:assert/strict'
import { test } from 'node:test'
import stylelint from 'stylelint'
import { annotation, report, reviewConfig, summarise } from '../lint.mjs'

const lint = async (code) => summarise((await stylelint.lint({ code, codeFilename: '/repo/theme.css', config: reviewConfig })).results, '/repo')

test('the review rules flag what the directory review reports, as warnings', async () => {
	const { errors, warnings } = await lint(`a { color: white; background: red !important; background: blue; }
.b:has(.c) { color: #000; }`)
	assert.deepEqual(errors, [])
	assert.deepEqual(warnings.map((w) => w.rule).sort(), ['color-named', 'color-named', 'color-named', 'declaration-block-no-duplicate-properties', 'declaration-no-important', 'selector-pseudo-class-disallowed-list'])
	assert.ok(warnings.every((w) => w.file === 'theme.css'))
})

test('an external URL is an error, since it blocks publishing', async () => {
	const { errors } = await lint('a { background: url("https://example.com/x.png"); }')
	assert.deepEqual(errors.map((e) => e.rule).sort(), ['function-url-scheme-allowed-list', 'function-url-scheme-disallowed-list'])
})

test("stylelint-config-standard's formatting rules are left out, as the review leaves them out", async () => {
	const { errors, warnings } = await lint('a{color:rgba(0,0,0,0.5)}\nb{color:#FFF}')
	assert.deepEqual([...errors, ...warnings], [])
})

test('a disable comment still counts, since the directory review ignores them', async () => {
	const { warnings } = await lint(`a {
    /* stylelint-disable-next-line declaration-no-important -- beats an inline style */
    color: #000 !important;
}`)
	assert.deepEqual(warnings.map((w) => w.rule), ['declaration-no-important'])
})

test('findings become GitHub annotations and a summary', () => {
	const f = { file: 'theme.css', line: 3, column: 5, rule: 'declaration-no-important', severity: 'warning', text: 'Avoid !important — 100%' }
	assert.equal(annotation(f), '::warning file=theme.css,line=3,col=5,title=declaration-no-important::Avoid !important — 100%25')
	assert.equal(annotation({ ...f, severity: 'error' }).slice(0, 8), '::error ')
	const md = report({ errors: [], warnings: [f] })
	assert.match(md, /0 errors \(block publishing\), 1 warning \(lower the directory score\)/)
	assert.match(md, /- theme\.css:3 warning: Avoid !important/)
})
