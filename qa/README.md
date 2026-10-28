# GitHubDHC QA

Automated checks for the theme, adapted from [Riccardo Bartoli's](https://github.com/rbartoli) QA harness for the [Tela theme](https://github.com/rbartoli/obsidian-tela-theme) (MIT, see [`LICENSE-tela`](LICENSE-tela)), as described in [How I check every screen of my Obsidian theme](https://rblab.com/how-i-check-every-screen-of-my-obsidian-theme/). See [#39](https://github.com/ScottKirvan/GitHubDHC/issues/39).

- **`npm run qa`**: opens the demo vault in a throwaway Obsidian and renders every scene in [`scenes.mjs`](scenes.mjs) in dark and light, on desktop, phone and tablet. Every screen gets an [axe](https://github.com/dequelabs/axe-core) audit: text must reach WCAG AA contrast (4.5:1, or 3:1 for large text), and links must stand out from the text around them by more than colour alone. Any violation fails the run.
- **`npm run drift`**: checks an Obsidian release for changes that would quietly break the theme: a variable the theme sets that Obsidian no longer reads, one it reads that Obsidian no longer defines, or a class the theme styles that Obsidian no longer uses. It also reports changed defaults against [`obsidian-baseline.json`](obsidian-baseline.json).

Both run in CI: the audit on every pull request to `main` ([`qa.yml`](../.github/workflows/qa.yml)), and the drift check every Monday ([`obsidian-canary.yml`](../.github/workflows/obsidian-canary.yml)), which files what it finds as an issue labelled `obsidian-update`.

## Running the audit

```bash
cd qa
npm install
npm run qa
```

It needs:

- **Node.js 22** or newer.
- **Obsidian**: `OBSIDIAN_BIN`, or `obsidian` on your `PATH`. On Linux x64 without either, the release's AppImage is downloaded and unpacked into `~/.cache/githubdhc-qa`. An installed Obsidian can only load releases newer than itself, so for an older `--obsidian` version unset `OBSIDIAN_BIN` and let the AppImage be used (Linux).
- **A display**: on Linux without one, it runs under `xvfb-run` (package `xvfb`).
- **ImageMagick** (`montage`), optional, for the contact sheets.

Each run uses a temporary profile and a temporary copy of [`vault/`](vault), so your own vaults and settings are never touched. Obsidian, the community plugins and their releases are downloaded once and cached in `~/.cache/githubdhc-qa`.

Results go to `out/<theme>-<obsidian version>/` (emptied on each run, and ignored by git):

- `report.md`: the summary, with violations grouped by colour pair, each with examples and the screenshot it's on.
- `report.json`: every screen's results.
- `shots/<device>/<scene>/<mode>-NN.png`: one screenshot per screenful.
- `sheets/`: contact sheets, dark and light side by side.

The exit code is 0 when everything passes, 1 for contrast violations, and 2 when a scene failed to run.

### Options

```bash
npm run qa -- --device desktop --mode dark --scene reading,settings
```

| Option | |
| --- | --- |
| `--obsidian <x.y.z>` | Obsidian version (default: the latest release) |
| `--theme <name>` | theme to test (default: GitHubDHC). `Default` is Obsidian's own theme; other names come from the community directory |
| `--device <list>` | `desktop,phone,tablet` (default: all) |
| `--mode <list>` | `dark,light` (default: both) |
| `--scene <list>` | scene names from `scenes.mjs` (default: all) |
| `--no-shots` | audit only, no screenshots |
| `--no-sheets` | skip the contact sheets |
| `--no-plugins` | skip the community plugins and their scenes |
| `--keep-open` | leave Obsidian running afterwards, for probing with `node cdp.mjs` |
| `--out <dir>` | write the results there; unlike the default folder, it is not emptied first |

### Probing a running Obsidian

With `--keep-open`, the run prints a `CDP_PORT`. Then:

```bash
CDP_PORT=<port> node cdp.mjs eval 'document.body.className'
CDP_PORT=<port> node cdp.mjs shot probe.png 1200 800
CDP_PORT=<port> node cdp.mjs axe '.workspace'
```

## What's covered

Scenes are listed in [`scenes.mjs`](scenes.mjs). They cover:

- notes in reading view and live preview, properties, highlights, and every callout type, GitHub's alerts included
- Canvas, Bases (table, cards, board), search, backlinks, the command palette, menus, hover popovers, notices, the graph, settings, printing and the window's title bar
- right-to-left text
- hovered and selected rows in the file explorer and search
- the views of six popular plugins: Dataview, Tasks, Kanban, Excalidraw, Iconize and Notebook Navigator
- GitHubDHC's own options, away from their defaults: both colourblind variants, plain callouts, per-level heading colours, and Kanban's minimal style

The audit doesn't install Style Settings. It gives `body` the classes Style Settings would give it by default (`styleSettings` in `scenes.mjs`), and the scenes for the theme's own options change them. **When you add or change a setting in the `@settings` block of `theme.css`, update `styleSettings` and `settingClasses` to match**, and add a scene if the option changes colours.

The audit can't judge text on images, accent colours a user picks, plugins outside the six, or real devices: phones and tablets are Obsidian's own mobile emulation in the desktop app.

### Adding a scene

Add an entry to `scenes` in `scenes.mjs`. The comment above the list explains each field. If the scene needs a note, add it to `vault/`. Plugin settings go in `fixtures/plugins/<id>/data.json`.

## Checking the review lint

```bash
npm run lint
```

Lints `theme.css` with the CSS rules Obsidian's community directory review applies: the Obsidian-specific rules from [`stylelint-config-obsidianmd`](https://www.npmjs.com/package/stylelint-config-obsidianmd), without the `stylelint-config-standard` formatting rules that config extends, which the review doesn't report. Errors, such as loading anything from an external URL, block publishing and fail the run. Warnings (`!important`, named colours, `:has()`, duplicate properties) lower the directory's score; they're listed, and shown as annotations on pull requests, but don't fail.

An `!important` the theme has to keep carries a comment saying why, which also tells the linter it's deliberate:

```css
/* stylelint-disable-next-line declaration-no-important -- beats the inline style Obsidian sets on .foo */
color: var(--text-normal) !important;
```

## Testing the harness

```bash
npm test
```

Unit tests for the parts that don't need Obsidian: the CSS scanning and drift checks in `drift.mjs`, the report grouping in `summary.mjs`, the helpers in `obsidian.mjs`, and a check that `styleSettings` and `settingClasses` in `scenes.mjs` match the `@settings` block in `theme.css`. They run in CI alongside the audit.

## Checking a new Obsidian release

```bash
npm run drift                        # the newest release against the baseline
npm run drift -- --obsidian 1.15.0   # a given release
```

When the weekly canary files an `obsidian-update` issue:

1. Run `npm run qa -- --obsidian <version>` and fix what it finds.
2. Certify the release: `npm run drift -- --obsidian <version> --update-baseline`.
3. Commit `obsidian-baseline.json` with the fixes.
