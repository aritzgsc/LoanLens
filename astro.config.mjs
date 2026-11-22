import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync } from 'node:fs';
import { loadEnv } from 'vite';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwind from '@tailwindcss/vite';

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
const contentDir = new URL('./src/content/pages/', import.meta.url);
const siteCode = env.STRICT_PUBLISH === 'true' ? readFileSync(new URL('./src/lib/site.ts', import.meta.url), 'utf8') : '';
const draftPaths = new Set();
for (const file of readdirSync(contentDir).filter(name => name.endsWith('.mdx'))) {
  const source = readFileSync(new URL(file, contentDir), 'utf8');
  const header = /^---\r?\n([\s\S]*?)\r?\n---(?=\r?\n|$)/.exec(source)?.[1] ?? '';
  const status = /^status:[ \t]*["']?(draft|reviewed)["']?[ \t]*$/m.exec(header)?.[1];
  const guide = /^category:[ \t]*["']?guide["']?[ \t]*$/m.test(header);
  const slug = file.slice(0, -4);
  if (status !== 'reviewed') draftPaths.add((guide ? '/guides/' : '/') + slug + '/');
  if (status !== 'reviewed' || env.STRICT_PUBLISH !== 'true') continue;
  const authorMissing = (guide || slug === 'about') && siteCode.includes('{{AUTHOR_NAME}}');
  const contactMissing = slug === 'contact' && siteCode.includes('{{CONTACT_EMAIL}}');
  if (authorMissing || contactMissing || /\{\{(?:AUTHOR_NAME|CONTACT_EMAIL)\}\}/.test(source)) {
    throw new Error('STRICT_PUBLISH: unresolved author or contact placeholder on ' + slug);
  }
}
export default defineConfig({
  site: env.PUBLIC_SITE_URL || 'https://loanlens.example',
  output: 'static',
  trailingSlash: 'always',
  integrations: [preact(), mdx(), sitemap({ filter: page => {
    const pathname = new URL(page).pathname;
    return pathname !== '/404/' && !draftPaths.has(pathname);
  } })],
  vite: { plugins: [tailwind()], define: { __PUBLISH_DRAFTS__: JSON.stringify(env.PUBLISH_DRAFTS === 'true') } }
});
