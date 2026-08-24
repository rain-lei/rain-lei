import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.rainlei.xyz',
  output: 'static',
  integrations: [sitemap()],
  markdown: { shikiConfig: { theme: 'github-dark' } },
  build: { format: 'directory' },
  vite: { build: { cssMinify: true } },
});
