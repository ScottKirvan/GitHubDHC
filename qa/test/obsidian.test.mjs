import assert from 'node:assert/strict'
import { test } from 'node:test'
import { byVersion, until } from '../obsidian.mjs'

test('byVersion orders releases numerically, not as text', () => {
	assert.deepEqual(['1.10.0', '1.9.2', '1.14.5', '1.9.10', '1.14'].sort(byVersion), ['1.9.2', '1.9.10', '1.10.0', '1.14', '1.14.5'])
})

test('until retries through falsy results and errors until a value comes back', async () => {
	let calls = 0
	const value = await until('a value', () => {
		calls++
		if (calls === 1) throw new Error('not yet')
		return calls === 3 && 'ready'
	})
	assert.equal(value, 'ready')
	assert.equal(calls, 3)
})

test('until times out naming what it waited for and the last error', async () => {
	await assert.rejects(
		until('the thing', () => {
			throw new Error('still down')
		}, 300),
		/timed out waiting for the thing \(still down\)/,
	)
})

test('until stops at once on a fatal error', async () => {
	let calls = 0
	await assert.rejects(
		until('the app', () => {
			calls++
			throw Object.assign(new Error('exited'), { fatal: true })
		}),
		/exited/,
	)
	assert.equal(calls, 1)
})
