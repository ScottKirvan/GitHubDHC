// npm run lint   (from qa/)
//
// Lints theme.css with the rules Obsidian's community directory review
// applies: the Obsidian-specific rules in stylelint-config-obsidianmd, without
// the stylelint-config-standard formatting rules that config extends, which
// the review doesn't report. Disable comments are ignored, as the review
// ignores them. Errors block publishing and fail the run (exit
// 1); warnings lower the directory score, so they're listed but don't fail.
//
// In GitHub Actions each finding is also an annotation on the PR, and the
// list goes to the job summary.
import { appendFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import stylelint from 'stylelint'
import obsidian from 'stylelint-config-obsidianmd'

const root = resolve(import.meta.dirname, '..')

export const reviewConfig = { plugins: obsidian.plugins, rules: obsidian.rules, ignoreDisables: true }

// Findings in reading order, split by what they mean for publishing.
export function summarise(results, base = root) {
	const findings = results
		.flatMap((r) => r.warnings.map((w) => ({ file: relative(base, r.source), line: w.line, column: w.column, rule: w.rule, severity: w.severity, text: w.text.replace(/\s*\([\w/-]+\)$/, '') })))
		.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column)
	return { errors: findings.filter((f) => f.severity === 'error'), warnings: findings.filter((f) => f.severity !== 'error') }
}

const escape = (s) => s.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')
export const annotation = (f) => `::${f.severity === 'error' ? 'error' : 'warning'} file=${f.file},line=${f.line},col=${f.column},title=${f.rule}::${escape(f.text)}`

export function report({ errors, warnings }) {
	const line = (f) => `- ${f.file}:${f.line} ${f.severity}: ${f.text} (${f.rule})`
	return [
		`# Obsidian review lint`,
		'',
		`${errors.length} error${errors.length === 1 ? '' : 's'} (block publishing), ${warnings.length} warning${warnings.length === 1 ? '' : 's'} (lower the directory score)`,
		...(errors.length ? ['', '## Errors', '', ...errors.map(line)] : []),
		...(warnings.length ? ['', '## Warnings', '', ...warnings.map(line)] : []),
		'',
	].join('\n')
}

if (process.argv[1] === import.meta.filename) {
	const { results } = await stylelint.lint({ files: [join(root, 'theme.css')], config: reviewConfig })
	const found = summarise(results)
	const md = report(found)
	console.log(md)
	if (process.env.GITHUB_ACTIONS) {
		for (const f of [...found.errors, ...found.warnings]) console.log(annotation(f))
		if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md)
	}
	if (found.errors.length) process.exitCode = 1
}
