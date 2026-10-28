// Scenes for qa/run.mjs: what each screen opens, on which devices.
//
// Adapted from the Tela theme's QA harness (MIT, see qa/LICENSE-tela).
//
// Functions passed to p.run() and installHelpers() are stringified and run
// inside Obsidian, so they can only use the page's globals (app, document,
// __qa), not this module's scope.

// Phone and tablet are Obsidian's own mobile emulation: the window size picks
// between them, at 600px (app.js: "(min-width: 600px) and (min-height: 600px)").
export const devices = {
	desktop: { width: 1200, height: 800, deviceScaleFactor: 1, mobile: false },
	phone: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
	tablet: { width: 1180, height: 820, deviceScaleFactor: 2, mobile: true },
}

// Obsidian's names for its base colour schemes.
export const modes = { dark: 'obsidian', light: 'moonstone' }

const READING = '.workspace-leaf.mod-active .markdown-preview-view'
const EDITING = '.workspace-leaf.mod-active .cm-scroller'

// name: used in --scene and output paths. scroll: the scroller to page
// through, one screenshot and audit per screenful. only: the devices a scene
// applies to; modes: the colour schemes. own: needs this repo's theme (a Style
// Settings class, see styleSettings). plugin: needs that community plugin (skipped with
// --no-plugins).
// auditCss: applied during the audit only, after the screenshot, to hide
// transparent layers that stop axe from finding the text's background.
// audit: the overlay a scene opens; only it is audited, since the screen
// behind it is audited in the scenes without it. blocks: for a scroller that
// renders everything at once, the blocks to audit, each once, on the first
// screen that shows it whole, or else the last screen that shows its top.
export const scenes = [
	{ name: 'reading', scroll: READING, setup: (p) => p.run(() => __qa.open('Tour.md', { mode: 'preview' })) },
	{ name: 'editing', scroll: EDITING, setup: (p) => p.run(() => __qa.edit('Tour.md')) },
	{ name: 'properties', setup: (p) => p.run(() => __qa.edit('Properties.md')) },
	{
		name: 'canvas',
		setup: (p) =>
			p.run(async () => {
				const leaf = await __qa.open('Canvas.canvas')
				leaf.view.canvas.zoomToFit()
				await __qa.settle(800)
			}),
		// An empty, transparent div over each card that swallows clicks.
		auditCss: '.canvas-node-content-blocker { display: none; }',
	},
	{ name: 'base-table', setup: (p) => p.run(() => __qa.base('Table')) },
	{ name: 'base-cards', setup: (p) => p.run(() => __qa.base('Cards')) },
	// Obsidian 1.14's board layout, the library grouped by status.
	{ name: 'base-kanban', setup: (p) => p.run(() => __qa.base('Kanban', 'Kanban.base')) },
	// Obsidian 1.14's coloured highlights, in every colour and inside other blocks.
	{ name: 'highlights-reading', scroll: READING, setup: (p) => p.run(() => __qa.open('Highlights.md', { mode: 'preview' })) },
	{ name: 'highlights-editing', setup: (p) => p.run(() => __qa.edit('Highlights.md')) },
	// Every heading level, one with a link in it, at the default settings.
	{ name: 'headings-reading', scroll: READING, setup: (p) => p.run(() => __qa.open('Headings.md', { mode: 'preview' })) },
	{ name: 'headings-editing', setup: (p) => p.run(() => __qa.edit('Headings.md')) },
	// GitHub's alerts and Obsidian's callouts, every type, in both views.
	{ name: 'callouts-reading', scroll: READING, setup: (p) => p.run(() => __qa.open('Callouts.md', { mode: 'preview' })) },
	{ name: 'callouts-editing', scroll: EDITING, setup: (p) => p.run(() => __qa.edit('Callouts.md')) },
	{
		name: 'search',
		setup: (p) =>
			p.run(async () => {
				await __qa.open('Tour.md', { mode: 'preview' })
				await __qa.search('callout')
			}),
	},
	{
		name: 'backlinks',
		setup: (p) =>
			p.run(async () => {
				await __qa.open('Properties.md', { mode: 'preview' })
				await __qa.reveal('backlink')
			}),
	},
	{
		name: 'palette',
		setup: (p) =>
			p.run(async () => {
				await __qa.open('Tour.md', { mode: 'preview' })
				app.commands.executeCommandById('command-palette:open')
				await __qa.settle(600)
			}),
		audit: '.modal-container',
	},
	{
		name: 'menu',
		setup: (p) =>
			p.run(async () => {
				await __qa.open('Tour.md', { mode: 'preview' })
				await __qa.reveal('file-explorer')
				// The explorer renders only the rows in view; on a tablet Tour.md sits below the fold
				app.workspace.getLeavesOfType('file-explorer')[0].view.revealInFolder(app.vault.getAbstractFileByPath('Tour.md'))
				const row = await __qa.find('.nav-file-title[data-path="Tour.md"]')
				const r = row.getBoundingClientRect()
				row.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, clientX: r.left + 40, clientY: r.top + r.height / 2 }))
				await __qa.settle(600)
			}),
		audit: '.menu',
	},
	{
		name: 'popover',
		only: ['desktop'],
		setup: (p) =>
			p.run(async () => {
				const leaf = await __qa.open('Tour.md', { mode: 'preview' })
				const link = await __qa.find('.markdown-preview-view a.internal-link[data-href="Properties"]', leaf.view.containerEl)
				const r = link.getBoundingClientRect()
				app.workspace.trigger('hover-link', {
					event: new MouseEvent('mouseover', { clientX: r.left + 5, clientY: r.top + 5 }),
					source: 'preview',
					hoverParent: leaf.view,
					targetEl: link,
					linktext: 'Properties',
					sourcePath: 'Tour.md',
				})
				await __qa.find('.hover-popover .markdown-preview-view')
				await __qa.settle(800)
			}),
		audit: '.hover-popover',
	},
	// A plugin's notice with links in it, as Theme Autoupdater's has. Notices
	// are near-black in both modes, so links on them need their own colour.
	{
		name: 'notice',
		setup: (p) =>
			p.run(async () => {
				await __qa.open('Tour.md', { mode: 'preview' })
				// Short enough not to wrap, and the plain text in spans: axe can't
				// decide on a link split across lines, or on bare text beside links.
				const text = createFragment()
				text.createSpan({ text: 'GitHubDHC 2.3.1 · ' })
				text.createEl('a', { text: 'Roll back', href: '#' })
				text.createSpan({ text: ' · ' })
				text.createEl('a', { text: 'Notes', href: 'https://github.com/ScottKirvan/GitHubDHC/releases', cls: 'external-link' })
				new Notice(text, 0)
				await __qa.settle(600)
			}),
		// The notice is 90% black, so axe looks through it at the header behind
		// and can't decide. Opaque at its lightest, 90% black over white, it
		// audits the worst case. The external-link icon is a background image,
		// which axe won't read text over.
		auditCss: '.notice-container .notice { background-color: #1a1a1a; } .notice .external-link { background-image: none; }',
		audit: '.notice-container',
	},
	{
		name: 'graph',
		setup: (p) =>
			p.run(async () => {
				await app.workspace.getLeaf(false).setViewState({ type: 'graph', active: true })
				await __qa.settle(2500)
			}),
	},
	{
		name: 'settings',
		setup: (p) =>
			p.run(async () => {
				app.setting.open()
				app.setting.openTabById('appearance')
				await __qa.settle(600)
			}),
		audit: '.modal-container',
	},
	// No other scene shows text on an accent fill. The Sync tab's "Sign up"
	// does, offline, and shares its colours with every primary button and the
	// plugin browser's "Installed".
	{
		name: 'settings-sync',
		setup: (p) =>
			p.run(async () => {
				app.setting.open()
				app.setting.openTabById('sync')
				await __qa.settle(600)
			}),
		audit: '.modal-container',
	},
	{
		name: 'drawer',
		only: ['phone', 'tablet'],
		setup: (p) =>
			p.run(async () => {
				await __qa.open('Tour.md', { mode: 'preview' })
				await __qa.reveal('file-explorer')
			}),
	},
	// Printing and PDF export render the note into a .print element at the end
	// of the body, always in light mode, and print it under @media print, which
	// hides the rest of the app. This is the same renderer and element, with
	// print media emulated. The document won't scroll under emulated print
	// media, so the element is given the viewport's height and scrolls itself.
	{
		name: 'print',
		only: ['desktop'],
		modes: ['light'],
		scroll: 'body > .print',
		blocks: '.print .markdown-preview-view > div',
		setup: async (p) => {
			await p.run(() => __qa.print('Tour.md'))
			await p.send('Emulation.setEmulatedMedia', { media: 'print' })
			await p.run(() => __qa.settle(800))
		},
	},
	// The frameless window's own title bar buttons, with nothing beside them:
	// both sidebars collapsed.
	{
		name: 'titlebar',
		only: ['desktop'],
		setup: (p) =>
			p.run(async () => {
				await __qa.open('Tour.md', { mode: 'preview' })
				app.workspace.leftSplit.collapse()
				app.workspace.rightSplit.collapse()
				await __qa.settle(600)
			}),
	},
	// Settings → Editor → Right-to-left, with Arabic and Hebrew text.
	{
		name: 'rtl-reading',
		scroll: READING,
		setup: (p) =>
			p.run(async () => {
				app.vault.setConfig('rightToLeft', true)
				await __qa.open('RTL.md', { mode: 'preview' })
			}),
	},
	{
		name: 'rtl-editing',
		setup: (p) =>
			p.run(async () => {
				app.vault.setConfig('rightToLeft', true)
				await __qa.edit('RTL.md')
			}),
	},
	// Popular plugins' own views.
	{ name: 'dataview', plugin: 'dataview', setup: (p) => p.run(() => __qa.open('Plugins/Dataview.md', { mode: 'preview' })) },
	{ name: 'tasks-query', plugin: 'obsidian-tasks-plugin', setup: (p) => p.run(() => __qa.open('Plugins/Tasks.md', { mode: 'preview' })) },
	{ name: 'kanban', plugin: 'obsidian-kanban', setup: (p) => p.run(() => __qa.view('Board.md', 'kanban')) },
	{ name: 'excalidraw', plugin: 'obsidian-excalidraw-plugin', setup: (p) => p.run(() => __qa.view('Plugins/Drawing.excalidraw.md', 'excalidraw')) },
	// Iconize draws its icons in the file tree.
	{
		name: 'iconize',
		plugin: 'obsidian-icon-folder',
		setup: (p) =>
			p.run(async () => {
				await __qa.open('Tour.md', { mode: 'preview' })
				await __qa.reveal('file-explorer')
			}),
	},
	{
		name: 'notebook-navigator',
		plugin: 'notebook-navigator',
		setup: (p) =>
			p.run(async () => {
				await __qa.open('Tour.md', { mode: 'preview' })
				if (!app.workspace.getLeavesOfType('notebook-navigator').length) await app.commands.executeCommandById('notebook-navigator:open')
				await __qa.reveal('notebook-navigator')
			}),
	},
	// Every sidebar row under the selection wash, the deeper of the two washes
	// Obsidian lays over a row, so the text on a hovered or selected row is
	// audited too. Without Distinct sidebars, the rows sit on the base.
	{
		name: 'selected-explorer',
		setup: (p) =>
			p.run(async () => {
				await __qa.open('Tour.md', { mode: 'preview' })
				await __qa.reveal('file-explorer')
				await __qa.select('.workspace-leaf-content[data-type="file-explorer"] .tree-item-self')
			}),
	},
	// Rows picked for a batch action take a selection of their own, with the
	// file-type badges on it. Obsidian leaves the open note out of a pick.
	{
		name: 'picked-explorer',
		setup: (p) =>
			p.run(async () => {
				await __qa.open('Tour.md', { mode: 'preview' })
				await __qa.reveal('file-explorer')
				await __qa.select('.workspace-leaf-content[data-type="file-explorer"] .tree-item-self:not(.is-active)', 'is-selected')
			}),
	},
	{
		name: 'selected-search',
		setup: (p) =>
			p.run(async () => {
				await __qa.open('Tour.md', { mode: 'preview' })
				await __qa.search('callout')
				await __qa.select('.workspace-leaf-content[data-type="search"] .tree-item-self')
			}),
	},
	// GitHubDHC's Style Settings options, away from their defaults.
	{
		name: 'colorblind-protan-deutan',
		own: true,
		scroll: READING,
		setup: (p) =>
			p.run(async () => {
				document.body.classList.add('colorblind_protan-deutan')
				await __qa.open('Tour.md', { mode: 'preview' })
			}),
	},
	{
		name: 'colorblind-tritan',
		own: true,
		scroll: READING,
		setup: (p) =>
			p.run(async () => {
				document.body.classList.add('colorblind_tritan')
				await __qa.open('Tour.md', { mode: 'preview' })
			}),
	},
	// Callouts without "GitHub callout style".
	{
		name: 'callouts-plain',
		own: true,
		scroll: READING,
		setup: (p) =>
			p.run(async () => {
				document.body.classList.remove('callout-on')
				await __qa.open('Callouts.md', { mode: 'preview' })
			}),
	},
	// Headings coloured one by one instead of "All headers are the same color".
	{
		name: 'headers-per-level',
		own: true,
		scroll: READING,
		setup: (p) =>
			p.run(async () => {
				document.body.classList.remove('headers-one-color')
				await __qa.open('Headings.md', { mode: 'preview' })
			}),
	},
	// Kanban's "Minimal style" variant; the default is "GitHub projects style".
	{
		name: 'kanban-minimal',
		own: true,
		plugin: 'obsidian-kanban',
		setup: async (p) => {
			await p.run(() => {
				document.body.classList.remove('kanban-full')
				document.body.classList.add('kanban-on')
			})
			await p.run(() => __qa.view('Board.md', 'kanban'))
		},
	},
]

// The body classes Style Settings gives GitHubDHC by default (the class-toggle
// and class-select defaults in theme.css's @settings block). The audit doesn't
// install Style Settings, so reset() sets them, and scenes marked own change
// them. Every class the theme's settings can set is cleared first.
export const styleSettings = ['callout-on', 'headers-one-color', 'kanban-full', 'kanban-same-height-cards', 'kanban-full-height-column']
export const settingClasses = [...styleSettings, 'colorblind_protan-deutan', 'colorblind_tritan', 'kanban-on', 'kanban-off']

// Installed after every page load (and after the mobile reloads), with the
// Style Settings classes to give body: styleSettings for GitHubDHC, none for
// another theme.
export function installHelpers(settingClasses = [], allSettingClasses = []) {
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
	const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
	const ws = app.workspace
	window.__qa = {
		// Two frames, a pause for async rendering (images, maths, diagrams), then
		// until running transitions finish: some themes fade colours for longer
		// than the pause, and axe would measure a colour between two states.
		async settle(ms = 400) {
			await frames()
			await sleep(ms)
			const end = Date.now() + 3000
			const running = () => document.getAnimations().some((a) => a.playState === 'running' && a.effect?.getComputedTiming().endTime !== Infinity)
			while (running() && Date.now() < end) await sleep(50)
			await frames()
		},
		// Waits for an element that renders late (drawers, virtualised lists).
		async find(selector, root = document, timeout = 5000) {
			const end = Date.now() + timeout
			for (;;) {
				const el = root.querySelector(selector)
				if (el) return el
				if (Date.now() > end) throw new Error(`no ${selector} after ${timeout / 1000}s`)
				await sleep(100)
			}
		},
		file(path) {
			const file = app.vault.getAbstractFileByPath(path)
			if (!file) throw new Error(`no file ${path} in the demo vault`)
			return file
		},
		async open(path, state = {}) {
			const leaf = ws.getLeaf(false)
			await leaf.openFile(this.file(path), { state, active: true })
			await this.settle()
			return leaf
		},
		// Live preview, with the cursor parked on the empty line under the
		// title so no line shows its markdown, and the editor blurred.
		async edit(path) {
			const leaf = await this.open(path, { mode: 'source', source: false })
			const editor = leaf.view.editor
			const line = [...Array(editor.lineCount()).keys()].find((n) => editor.getLine(n).trim() === '') ?? 0
			editor.setCursor({ line, ch: 0 })
			editor.blur()
			await this.settle()
			return leaf
		},
		// Opens a file in a plugin's view, which the plugin usually picks itself.
		async view(path, type) {
			const leaf = await this.open(path)
			if (leaf.view.getViewType() !== type) await leaf.setViewState({ type, state: { file: path }, active: true })
			await this.settle(1500)
			if (leaf.view.getViewType() !== type) throw new Error(`${path} did not open in the ${type} view`)
			return leaf
		},
		// Renders a note the way PDF export does. The export modal holds the
		// renderer, so it is opened and caught on its way to the screen.
		async print(path) {
			const leaf = await this.open(path, { mode: 'preview' })
			let proto = app.setting
			let base
			while ((proto = Object.getPrototypeOf(proto)) && proto !== Object.prototype) if (Object.hasOwn(proto, 'open')) base = proto
			const open = base.open
			let modal
			base.open = function () {
				modal = this
				return open.call(this)
			}
			try {
				leaf.view.printToPdf()
			} finally {
				base.open = open
			}
			if (!modal?.print) throw new Error('no PDF export modal')
			modal.close()
			const el = document.body.createDiv('print')
			Object.assign(el.style, { height: '100vh', overflowY: 'auto' })
			await modal.print(el, leaf.view, true)
			await this.settle(800)
			return leaf
		},
		// The blocks matching selector to audit on this screen: those it shows
		// whole, and those whose top the next screen will scroll past. The next
		// screen starts 93% of a screen down (capture in qa/run.mjs), so a block
		// cut off at the bottom waits for it only if its top is below that line.
		blocks(selector) {
			const h = innerHeight
			const fresh = [...document.querySelectorAll(selector)].filter((el) => {
				const r = el.getBoundingClientRect()
				return !this.audited.has(el) && r.height > 0 && r.top >= -1 && (r.bottom <= h || r.top < h * 0.93)
			})
			for (const el of fresh) this.audited.add(el)
			return { include: fresh }
		},
		audited: new WeakSet(),
		async base(view, path = 'Library.base') {
			const leaf = await this.open(path)
			await leaf.view.controller.selectView?.(view)
			await this.settle(800)
			return leaf
		},
		// Opens a sidebar view: on mobile, its drawer.
		async reveal(type) {
			const leaf = ws.getLeavesOfType(type)[0]
			if (!leaf) throw new Error(`no ${type} view`)
			await ws.revealLeaf(leaf)
			await leaf.loadIfDeferred?.()
			await this.settle(600)
			return leaf
		},
		// Gives every matching row the selected state, as a click would, until
		// the next reset: is-active is the open note's, is-selected a row picked
		// for a batch action (alt-click, shift-click).
		async select(selector, state = 'is-active') {
			await this.find(selector)
			for (const el of document.querySelectorAll(selector)) {
				if (el.classList.contains(state)) continue
				el.classList.add(state)
				this.selected.push([el, state])
			}
			await this.settle()
		},
		selected: [],
		async search(query) {
			const leaf = await this.reveal('search')
			leaf.view.setQuery(query)
			await this.settle(1200)
			return leaf
		},
		// One empty tab, the file explorer showing every folder open, the right
		// sidebar (and on mobile both drawers) closed, the default Style Settings classes,
		// nothing set up for printing, no notices, no rows selected by select(), left-to-right,
		// and no simulated Android platform class.
		// The tab is emptied, not reused: a note reopened in its own tab comes
		// back at its last scroll position.
		async reset() {
			document.body.classList.remove(...allSettingClasses, 'is-android')
			document.body.classList.add(...settingClasses)
			for (const el of document.querySelectorAll('body > .print, .notice')) el.remove()
			this.audited = new WeakSet()
			for (const [el, state] of this.selected.splice(0)) el.classList.remove(state)
			if (app.vault.getConfig('rightToLeft')) app.vault.setConfig('rightToLeft', false)
			const leaves = []
			ws.iterateRootLeaves((leaf) => leaves.push(leaf))
			for (const leaf of leaves.slice(1)) leaf.detach()
			await leaves[0]?.setViewState({ type: 'empty' })
			// Sidebar views load on first show, so they may not have their methods yet.
			ws.getLeavesOfType('search')[0]?.view.setQuery?.('')
			const explorer = ws.getLeavesOfType('file-explorer')[0]
			for (const item of Object.values(explorer?.view.fileItems ?? {})) item.setCollapsed?.(false)
			if (app.isMobile) ws.leftSplit.collapse()
			else await this.reveal('file-explorer')
			ws.rightSplit.collapse()
			await this.settle()
		},
	}
}
