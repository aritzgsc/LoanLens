import { readdir, readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { siteSettings } from './site-settings.mjs';
import { loadEnvFile } from 'node:process';
try { loadEnvFile(); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const dist = 'dist';
async function walk(folder) {
  const result=[];
  for (const entry of await readdir(folder,{withFileTypes:true})) {
    const item=join(folder,entry.name);
    if(entry.isDirectory()) result.push(...await walk(item));
    else if(entry.name.endsWith('.html')) result.push(item);
  }
  return result;
}
const files=await walk(dist);
const errors=[];
const titles = new Set();
const descriptions = new Set();
const settings = siteSettings(process.env);
const origin = new URL(settings.origin);
const indexable = !settings.noindex;
const resultsAdsConfigured = /^ca-pub-\d{16}$/.test(process.env.PUBLIC_ADSENSE_CLIENT || '')
  && /^\d+$/.test(process.env.PUBLIC_ADSLOT_RESULTS || '');
const sitemapUrls = new Set();
for(const file of files) {
  const html=await readFile(file,'utf8');
  if (/\{\{(?:AUTHOR_NAME|AUTHOR_BIO|CONTACT_EMAIL)\}\}/.test(html)) errors.push(file + ' exposes a publisher placeholder');
  const title=html.match(/<title>(.*?)<\/title>/)?.[1];
  if (!title || titles.has(title)) errors.push(file + ' missing or duplicate title');
  titles.add(title);
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  if (!description || descriptions.has(description)) errors.push(file + ' missing or duplicate description');
  descriptions.add(description);
  if((html.match(/<h1(?=\s|>)/g)||[]).length!==1) errors.push(file+' must have one H1');
  if(!/<link rel="canonical" href="https?:/.test(html) || !html.includes('application/ld+json')) errors.push(file+' is missing metadata');
  const path = file.replaceAll('\\', '/').slice(dist.length);
  const route = path.replace(/index\.html$/, '');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const notFound = path === '/404.html';
  if (!notFound && canonical !== new URL(route, origin).href) errors.push(file + ' has the wrong canonical');
  const shouldIndex = indexable && !notFound;
  if (!html.includes(shouldIndex ? 'content="index, follow"' : 'content="noindex, follow"')) {
    errors.push(file + ' has the wrong robots directive');
  }
  if (shouldIndex) sitemapUrls.add(canonical);
  if (route === '/' || route === '/calculator/') {
    const hasResultsSlot = html.includes('data-slot-kind="results"');
    if (hasResultsSlot !== (indexable && resultsAdsConfigured)) errors.push(file + ' has the wrong results ad slot state');
  }
  for(const [,href] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"]*)"/g)) {
    const url=new URL(href,'https://loanlens.example');
    const relative=decodeURI(url.pathname).replace(/^\//,'');
    try { await access(join(dist,relative, url.pathname.endsWith('/')?'index.html':'')); }
    catch { errors.push(file+' -> broken local link '+href); }
  }
}
const robots = await readFile(join(dist, 'robots.txt'), 'utf8');
if (indexable) {
  const sitemap = new URL('/sitemap-index.xml', origin).href;
  if (!robots.includes('Sitemap: ' + sitemap)) errors.push('robots.txt is missing the canonical sitemap');
  const index = await readFile(join(dist, 'sitemap-index.xml'), 'utf8');
  const urls = new Set();
  for (const [, location] of index.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const url = new URL(location);
    if (url.origin !== origin.origin) errors.push('Sitemap index links to an alternate origin');
    const xml = await readFile(join(dist, url.pathname.slice(1)), 'utf8');
    for (const [, entry] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(entry);
  }
  for (const url of sitemapUrls) if (!urls.has(url)) errors.push('Sitemap is missing ' + url);
  for (const url of urls) if (!sitemapUrls.has(url)) errors.push('Sitemap contains a non-indexable URL ' + url);
} else if (!robots.includes('Disallow: /')) {
  errors.push('robots.txt must disallow crawling for this build');
}
const source = await readdir('src/content/pages');
for(const mdx of source.filter(name=>name.endsWith('.mdx'))) {
  const text=await readFile(join('src/content/pages',mdx),'utf8');
  const frontmatter=text.split('---')[1] || '';
  const route=(/^category:[ \t]*["']?guide["']?[ \t]*$/m.test(frontmatter)?'guides/':'')+mdx.slice(0,-4);
  const output=join(dist,route,'index.html');
  const rendered=await readFile(output,'utf8').catch(()=>null);
  const draft=/^status:[ \t]*["']?draft["']?[ \t]*$/m.test(frontmatter);
  if(draft && process.env.PUBLISH_DRAFTS !== 'true' && rendered) errors.push(output+' must not publish a draft');
  if(draft && process.env.PUBLISH_DRAFTS === 'true' && (!rendered || !rendered.includes('noindex, follow'))) errors.push(output+' must publish as noindex in preview');
}
if(errors.length) { console.error(errors.join('\n')); process.exitCode=1; }
else console.log(`Verified local links and HTML metadata on ${files.length} pages.`);
