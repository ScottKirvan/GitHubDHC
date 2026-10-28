import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { settingClasses, styleSettings } from '../scenes.mjs'

// The class settings in theme.css's Style Settings block: every class each can
// put on body, and the ones it puts there by default.
function classSettings() {
	const css = readFileSync(join(import.meta.dirname, '..', '..', 'theme.css'), 'utf8')
	const block = /\/\*\s*@settings([\s\S]*?)\*\//.exec(css)[1]
	const all = []
	const defaults = []
	for (const entry of block.split(/\n {4}-[ \t]*\n/)) {
		const field = (name) => new RegExp(`^\\s*${name}:\\s*(.*?)\\s*$`, 'm').exec(entry)?.[1]
		if (field('type') === 'class-toggle') {
			all.push(field('id'))
			if (field('default') === 'on' || field('default') === 'true') defaults.push(field('id'))
		} else if (field('type') === 'class-select') {
			all.push(...[...entry.matchAll(/^\s*value:\s*(\S+)/gm)].map((m) => m[1]))
			if (field('default')) defaults.push(field('default'))
		}
	}
	return { all, defaults }
}

test("the audit's default Style Settings classes are theme.css's defaults", () => {
	assert.deepEqual([...styleSettings].sort(), classSettings().defaults.sort())
})

test("the audit knows every class theme.css's settings can set", () => {
	assert.deepEqual([...settingClasses].sort(), classSettings().all.sort())
})
