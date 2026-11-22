import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwind from '@tailwindcss/vite';

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
export default defineConfig({
  site: env.PUBLIC_SITE_URL || 'https://loanlens.example',
  output: 'static',
  trailingSlash: 'always',
  integrations: [preact(), mdx(), sitemap({ filter: (page) => !page.endsWith('/404/') })],
  vite: { plugins: [tailwind()], define: { __PUBLISH_DRAFTS__: JSON.stringify(env.PUBLISH_DRAFTS === 'true') } }
});
