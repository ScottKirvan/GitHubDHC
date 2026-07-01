import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "GitHubDHC",
  description: "An Obsidian theme inspired by the GitHub Dark High Contrast interface.",
  base: '/GitHubDHC/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'GitHub', link: 'https://github.com/ScottKirvan/GitHubDHC' }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ScottKirvan/GitHubDHC' },
      { icon: 'discord', link: 'https://discord.gg/TN6XJSNK5Y' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © Scott Kirvan'
    }
  }
})
