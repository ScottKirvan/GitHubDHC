// Shared by qa/run.mjs and qa/drift.mjs: finding, downloading and caching
// Obsidian's desktop app, and small async helpers.
//
// Adapted from the Tela theme's QA harness (MIT, see qa/LICENSE-tela).
import { spawnSync } from 'node:child_process'
import { chmodSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'

export const cache = join(process.env.XDG_CACHE_HOME ?? join(homedir(), '.cache'), 'githubdhc-qa')

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export const byVersion = (a, b) => {
	const [x, y] = [a, b].map((v) => v.split('.').map(Number))
	for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0)
	return 0
}

// Retries fn until it returns something truthy; errors count as "not yet".
export async function until(what, fn, timeout = 60_000) {
	const end = Date.now() + timeout
	let last
	for (;;) {
		try {
			const v = await fn()
			if (v) return v
		} catch (err) {
			if (err.fatal) throw err
			last = err
		}
		if (Date.now() > end) throw new Error(`timed out waiting for ${what}${last ? ` (${last.message})` : ''}`)
		await sleep(250)
	}
}

export async function download(url) {
	const token = url.startsWith('https://api.github.com/') && process.env.GITHUB_TOKEN
	const res = await fetch(url, token ? { headers: { authorization: `Bearer ${token}` } } : {})
	if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`)
	return Buffer.from(await res.arrayBuffer())
}

const RELEASES = 'https://github.com/obsidianmd/obsidian-releases/releases/download'

// The newest public desktop release, as Obsidian's own updater sees it
// (desktop-releases.json). That file is served from raw.githubusercontent.com,
// so it needs no API token and has no rate limit.
export async function obsidianVersion(requested) {
	if (requested) return requested.replace(/^v/, '')
	try {
		const latest = JSON.parse(await download('https://raw.githubusercontent.com/obsidianmd/obsidian-releases/HEAD/desktop-releases.json'))
		if (!latest.latestVersion) throw new Error('desktop-releases.json has no latestVersion')
		return latest.latestVersion
	} catch (err) {
		const cached = existsSync(cache) ? readdirSync(cache).map((f) => /^obsidian-(.+)\.asar$/.exec(f)?.[1]).filter(Boolean).sort(byVersion) : []
		if (!cached.length) throw new Error(`cannot look up the latest Obsidian release (${err.message}); pass --obsidian <version>`)
		console.log(`offline: using the newest cached Obsidian, ${cached.at(-1)}`)
		return cached.at(-1)
	}
}

// The app package (app.js, app.css, ...) of a release. The installer loads it
// from the profile when it is newer than the one it ships with.
export async function obsidianAsar(version) {
	const file = join(cache, `obsidian-${version}.asar`)
	if (!existsSync(file)) {
		console.log(`downloading Obsidian ${version}`)
		const gz = await download(`${RELEASES}/v${version}/obsidian-${version}.asar.gz`).catch((err) => {
			throw /HTTP 404/.test(err.message) ? new Error(`Obsidian ${version} has no desktop app package on GitHub (some releases are mobile-only)`) : err
		})
		mkdirSync(cache, { recursive: true })
		const tmp = `${file}.${process.pid}.tmp`
		writeFileSync(tmp, gunzipSync(gz))
		renameSync(tmp, file)
	}
	return file
}

// The command that starts Obsidian: OBSIDIAN_BIN, else `obsidian` on PATH,
// else (on Linux) the release's AppImage, downloaded once and unpacked into
// the cache so it runs without FUSE, as in CI.
export async function obsidianBinary(version) {
	if (process.env.OBSIDIAN_BIN) return process.env.OBSIDIAN_BIN
	if (spawnSync('which', ['obsidian']).status === 0) return 'obsidian'
	if (process.platform !== 'linux' || process.arch !== 'x64') throw new Error('Obsidian is not on PATH: install it or set OBSIDIAN_BIN')
	const dir = join(cache, `appimage-${version}`)
	const bin = join(dir, 'squashfs-root', 'obsidian')
	if (!existsSync(bin)) {
		console.log(`downloading the Obsidian ${version} AppImage`)
		const image = await download(`${RELEASES}/v${version}/Obsidian-${version}.AppImage`)
		rmSync(dir, { recursive: true, force: true })
		mkdirSync(dir, { recursive: true })
		const file = join(dir, 'Obsidian.AppImage')
		writeFileSync(file, image)
		chmodSync(file, 0o755)
		const res = spawnSync(file, ['--appimage-extract'], { cwd: dir, stdio: 'ignore' })
		rmSync(file)
		if (res.status !== 0 || !existsSync(bin)) throw new Error(`could not unpack the Obsidian ${version} AppImage`)
	}
	return bin
}
