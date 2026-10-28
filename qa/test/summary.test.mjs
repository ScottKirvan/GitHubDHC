import assert from 'node:assert/strict'
import { test } from 'node:test'
import { summarise } from '../summary.mjs'

const contrast = (target, fg, bg, text = target) => ({ rule: 'color-contrast', target, text, data: { fgColor: fg, bgColor: bg, contrastRatio: 2.5, expectedContrastRatio: '4.5:1', fontSize: '10.5pt (14px)', fontWeight: 'normal' } })
const step = (scene, violations, { device = 'desktop', mode = 'light', shot, incomplete = [] } = {}) => ({ device, mode, scene, step: 0, shot, violations, incomplete })

test('an element seen on several screens and scenes counts once per device and mode', () => {
	const v = contrast('.comment', '#6e7781', '#afb8c1')
	const { unique } = summarise([step('reading', [v], { shot: 'a.png' }), step('print', [v], { shot: 'b.png' }), step('reading', [v], { mode: 'dark' })])
	assert.equal(unique.length, 2)
	const light = unique.find((u) => u.mode === 'light')
	assert.deepEqual([...light.scenes], ['reading', 'print'])
	assert.deepEqual(light.shots, ['a.png', 'b.png'])
})

test('violations with the same colour pair group into one thing to fix, across devices', () => {
	const steps = [
		step('reading', [contrast('.a', '#cf222e', '#afb8c1'), contrast('.b', '#cf222e', '#afb8c1'), contrast('.c', '#0969da', '#afb8c1')]),
		step('reading', [contrast('.a', '#cf222e', '#afb8c1')], { device: 'phone' }),
	]
	const { groups } = summarise(steps)
	assert.equal(groups.length, 2)
	assert.equal(groups[0].fg, '#cf222e')
	assert.equal(groups[0].count, 3)
	assert.deepEqual([...groups[0].devices], ['desktop', 'phone'])
	assert.deepEqual(groups[0].examples.map((e) => e.text), ['.a', '.b'])
})

test('link-in-text-block compares the link with the text around it', () => {
	const link = { rule: 'link-in-text-block', target: 'a', text: 'link', data: { nodeColor: '#71b7ff', parentColor: '#ffffff', contrastRatio: 2.11, requiredContrastRatio: 3 } }
	const [v] = summarise([step('headers-per-level', [link], { mode: 'dark' })]).unique
	assert.equal(v.fg, '#71b7ff')
	assert.equal(v.bg, '#ffffff')
	assert.equal(v.expected, '3:1')
})

test('undecided elements are kept apart from violations, by reason', () => {
	const { unique, incomplete } = summarise([step('canvas', [], { incomplete: [{ rule: 'color-contrast', target: '.card', data: { messageKey: 'bgImage' } }] })])
	assert.equal(unique.length, 0)
	assert.deepEqual([...incomplete.values()], ['bgImage'])
})
