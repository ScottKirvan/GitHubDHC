# GitHubDHC [![starline](https://raw.githubusercontent.com/ScottKirvan/GitHubDHC/refs/heads/starlines/ScottKirvan/GitHubDHC/starline.svg)](https://github.com/qoomon/starlines)
<div align="center">
  <img src="https://github.com/ScottKirvan/GitHubDHC/blob/main/imgs/promo.png?raw=true" alt="promo" height="auto" />
  <h1><a href="https://github.com/ScottKirvan/GitHubDHC">GitHubDHC</a></h1>
  <h3>A GitHub Dark High Contrast theme for Obsidian!</h3> 
  
<!-- Badges -->
<p>
  <a href="https://github.com/ScottKirvan/GitHubDHC/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/ScottKirvan/GitHubDHC" alt="contributors" />
  </a>
  <a href="">
    <img src="https://img.shields.io/github/last-commit/ScottKirvan/GitHubDHC" alt="last update" />
  </a>
  <a href="https://github.com/ScottKirvan/GitHubDHC/network/members">
    <img src="https://img.shields.io/github/forks/ScottKirvan/GitHubDHC" alt="forks" />
  </a>
  <a href="https://github.com/ScottKirvan/GitHubDHC/stargazers">
    <img src="https://img.shields.io/github/stars/ScottKirvan/GitHubDHC" alt="stars" />
  </a>
  <a href="https://github.com/ScottKirvan/GitHubDHC/issues/">
    <img src="https://img.shields.io/github/issues/ScottKirvan/GitHubDHC" alt="open issues" />
  </a>
  <a href="https://github.com/ScottKirvan/GitHubDHC/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/ScottKirvan/GitHubDHC.svg" alt="license" />
  </a>
</p>
   
<h4>
    <a href="https://github.com/ScottKirvan/GitHubDHC/issues/">Report Bug</a>
  <span> · </span>
    <a href="https://github.com/ScottKirvan/GitHubDHC/issues/">Request Feature</a>
  </h4>
</div> 

I do a lot of writing in Markdown, mostly for things that I'm doing up on [GitHub](https://github.com/). ([Obsidian](https://obsidian.md/) is an great editor for this).  I was running into some frustration with the formatting not mapping really well between Obsidian and GitHub, when I thought, "there has to be a theme for this!"  I found [@krios2146's](https://github.com/krios2146) awesome [Obsidian GIthub Theme](https://github.com/krios2146/obsidian-theme-github).  

It was close, but not really the way *my* GitHub looks (I use the GitHub Dark High Contrast theme when I'm working online), so I decided to start hacking the css a bit to see how close I could get.  The look of GitHubDHC is different enough from the original theme that I decided to start a new fork based on Vladimir's really nicely done Obsidian GitHub Theme -- it's worth checking out - he did all the initial work and the Kanban theme'ing - it's really good.  

### Features (v2.0)

- **Dual Theme Support**: Full support for both Dark High Contrast and Light Default themes
- **Accurate GitHub Colors**: Uses official GitHub Primer color primitives for authentic appearance
- **Enhanced UI Components** (for settings dialog, Obsidian UI, etc.):
    - Form elements (dropdowns, inputs) now match GitHub styling
- **GitHub-Style Callouts**: GitHub's NOTE, TIP, IMPORTANT, WARNING and CAUTION alerts in GitHub's own colours, in dark and light mode
- **Improved Typography**: Bold navigation items and better text hierarchy
- **Accessible Contrast (WCAG AA)**: Text is easy to read in both themes. See [Accessibility](#accessibility)
- **Colorblind Variants**: Protanopia & Deuteranopia and Tritanopia variants built on GitHub's own colorblind palettes
- **Plugin Support**: Styled for Kanban, and checked with Dataview, Tasks, Excalidraw, Iconize and Notebook Navigator

<details><summary><h2> Screenshots </h2></summary>
<ul>
<img src="https://github.com/ScottKirvan/GitHubDHC/blob/main/imgs/screenshots/GHDC1.png?raw=true">  
<img src="https://github.com/ScottKirvan/GitHubDHC/blob/main/imgs/screenshots/GHDC2.png?raw=true">  
<img src="https://github.com/ScottKirvan/GitHubDHC/blob/main/imgs/screenshots/settings.png?raw=true">  
</ul>
</details>

## Installation

### Obsidian Marketplace (Recommended)

1. Open the **Settings** in Obsidian
2. Navigate to **Appearances** tab under **Options**
3. Choose your **Base color scheme**: `Dark` for GitHub Dark High Contrast, `Light` for GitHub Light Default, or `Adapt to system` to switch with your operating system
4. Under the **Themes** section, click on the `Manage` button across from **Themes**
5. Search for `GitHubDHC` in the Filter text input
6. Click `Use` and then you're done! 🎉

### Manual Install

1. Download and unzip (or clone) this repo into your vault's `/.obsidian/themes` directory (if that directly doesn't exist yet, create it)
2. Open **Settings** in *Obsidian*
3. Navigate to the  **Appearances** tab under **Options**
4. Under the **Themes** section, click on the `Manage` button across from **Themes**
5. Search for `GitHubDHC` in the Filter text input
6. Click the reset button for the **Accent color**, and set your preferred **Zoom level**.
7. That's it!  You're set up - Enjoy!

## Theme Settings

Theme settings can be found in the [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) plugin.

Current settings include:

- Header colors
- On/Off kanban styles
- On/Off callout styles
- Colorblind colorscheme variants

## Accessibility

GitHubDHC meets the **WCAG 2.2 Level AA** contrast requirements for text, in both Dark High Contrast and Light Default:

- **Readable text everywhere**: body text, headings, code, callouts, tags, menus, settings, search and sidebars all reach at least 4.5:1 contrast (3:1 for large text), the AA minimum ([SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).
- **Links you can spot**: links are underlined, headings included, so they never rely on color alone ([SC 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).
- **Everywhere you use Obsidian**: reading view and live preview, Canvas, Bases, printing and right-to-left text, on desktop, phone and tablet.
- **Colorblind-friendly**: both colorblind variants meet the same contrast bar.
- **True to GitHub**: every color comes from GitHub's own Primer design system, the palette GitHub uses for its accessible themes.

Every change to the theme is checked against these requirements before it's released.

A theme can only control its own colors, so a few things are outside what it can guarantee: text drawn over images, an accent color you pick yourself in Obsidian's settings, and community plugins other than those listed above.

## Feedback

For any bugs or ideas for new features, please submit a [New Issue](https://github.com/ScottKirvan/GitHubDHC/issues) .  The best way to contribute directly is to make the changes yourself and submit them as a [New Pull Request](https://github.com/ScottKirvan/GitHubDHC/pulls).  Have a quesiton? Join the [Obsidian Members Group (OMG)](https://discord.gg/obsidianmd) Discord server - I'm @cptvideo - reach out and say, "hi!" 👋

## Credits

A huge thank you and all creds due to  [@krios2146](https://github.com/krios2146) and his [Obsidian GitHub Theme](https://github.com/krios2146/obsidian-theme-github).

Vladimir Kidyaev (2022-2023)  
This code includes modifications by Scott Kirvan. Modifications (c) 2026 Scott Kirvan  
Contributors:  [@saberzero1](https://github.com/saberzero1) (Obsidian [community reviewer](https://obsidian.md/help/credits#Community+review))

The QA audit in [`qa/`](qa/README.md) is adapted from [Riccardo Bartoli's](https://github.com/rbartoli) QA harness for the [Tela theme](https://github.com/rbartoli/obsidian-tela-theme) (MIT, see [`qa/LICENSE-tela`](qa/LICENSE-tela)), described in the post [How I check every screen of my Obsidian theme](https://rblab.com/how-i-check-every-screen-of-my-obsidian-theme/). Thank you, Riccardo!  Contrast checking uses [axe-core](https://github.com/dequelabs/axe-core) by Deque Systems.

Project Link:  <https://github.com/ScottKirvan/GitHubDHC>  
If you're writing markdown, and not using *Obsidian*, check it out:  <https://obsidian.md/>  

[CHANGELOG](notes/CHANGELOG.md)


