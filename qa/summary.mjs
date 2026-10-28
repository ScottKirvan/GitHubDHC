// Groups qa/run.mjs's per-screen axe results into the report's violations.
//
// Adapted from the Tela theme's QA harness (MIT, see qa/LICENSE-tela).

function colours(v) {
	const d = v.data
	return v.rule === 'link-in-text-block' ? { fg: d.nodeColor, bg: d.parentColor } : { fg: d.fgColor, bg: d.bgColor }
}

// Unique violations: the same element seen in several screenfuls or scenes
// counts once per device and mode.
export function summarise(steps) {
	const unique = new Map()
	for (const s of steps) {
		for (const v of s.violations) {
			const { fg, bg } = colours(v)
			const key = [s.device, s.mode, v.rule, v.target, fg, bg].join('|')
			const seen = unique.get(key) ?? { device: s.device, mode: s.mode, rule: v.rule, target: v.target, text: v.text, fg, bg, ratio: v.data.contrastRatio, expected: v.data.expectedContrastRatio ?? `${v.data.requiredContrastRatio}:1`, size: v.data.fontSize, weight: v.data.fontWeight, scenes: new Set(), shots: [] }
			seen.scenes.add(s.scene)
			if (s.shot) seen.shots.push(s.shot)
			unique.set(key, seen)
		}
	}
	// Grouped by colour pair: one group is one thing to fix.
	const groups = new Map()
	for (const v of unique.values()) {
		const key = [v.rule, v.mode, v.fg, v.bg, v.ratio, v.size, v.weight].join('|')
		const g = groups.get(key) ?? { ...v, devices: new Set(), scenes: new Set(), examples: [] }
		g.devices.add(v.device)
		for (const s of v.scenes) g.scenes.add(s)
		if (g.examples.length < 3 && !g.examples.some((e) => e.text === v.text)) g.examples.push({ text: v.text, target: v.target, shot: v.shots[0] })
		g.count = (g.count ?? 0) + 1
		groups.set(key, g)
	}
	const incomplete = new Map()
	for (const s of steps) for (const v of s.incomplete) incomplete.set([s.device, s.mode, v.rule, v.target].join('|'), v.data.messageKey ?? 'unknown')
	return { unique: [...unique.values()], groups: [...groups.values()].sort((a, b) => b.count - a.count), incomplete }
}
