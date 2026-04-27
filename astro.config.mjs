// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// TODO: Replace with your GitHub Pages URL
// If using a custom domain: 'https://yourdomain.com'
// If using GitHub Pages user site: 'https://yourusername.github.io'
// If using GitHub Pages project site: 'https://yourusername.github.io/repo-name'
const SITE_URL = 'https://SamTur-Mas.github.io';

export default defineConfig({
  site: SITE_URL,
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
