import { readdir, readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
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
const duplicates = new Set();
for(const file of files) {
  const html=await readFile(file,'utf8');
  const title=html.match(/<title>(.*?)<\/title>/)?.[1];
  if(!title || duplicates.has(title)) errors.push(file+' missing or duplicate title');
  duplicates.add(title);
  if((html.match(/<h1(?=\s|>)/g)||[]).length!==1) errors.push(file+' must have one H1');
  if(!/<link rel="canonical" href="https?:/.test(html) || !html.includes('application/ld+json')) errors.push(file+' is missing metadata');
  if (/(?:^|[\\/])(?:index\.html|calculator[\\/]index\.html)$/.test(file) && ['dist/index.html','dist/calculator/index.html'].includes(file.replaceAll('\\','/')) && !html.includes('data-slot-kind="results"')) errors.push(file+' lacks reserved results slot');
  for(const [,href] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"]*)"/g)) {
    const url=new URL(href,'https://loanlens.example');
    const relative=decodeURI(url.pathname).replace(/^\//,'');
    try { await access(join(dist,relative, url.pathname.endsWith('/')?'index.html':'')); }
    catch { errors.push(file+' -> broken local link '+href); }
  }
}
const source = await readdir('src/content/pages');
for(const mdx of source.filter(name=>name.endsWith('.mdx'))) {
  const text=await readFile(join('src/content/pages',mdx),'utf8');
  const frontmatter=text.split('---')[1] || '';
  const route=(/^category:\s*guide/m.test(frontmatter)?'guides/':'')+mdx.slice(0,-4);
  const output=join(dist,route,'index.html');
  const rendered=await readFile(output,'utf8').catch(()=>null);
  const draft=/^status:\s*draft\s*$/m.test(frontmatter);
  if(draft && process.env.PUBLISH_DRAFTS !== 'true' && rendered) errors.push(output+' must not publish a draft');
  if(draft && process.env.PUBLISH_DRAFTS === 'true' && (!rendered || !rendered.includes('noindex, follow'))) errors.push(output+' must publish as noindex in preview');
}
if(errors.length) { console.error(errors.join('\n')); process.exitCode=1; }
else console.log(`Verified local links and HTML metadata on ${files.length} pages.`);
