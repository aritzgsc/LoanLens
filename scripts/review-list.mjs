import { readdir, readFile } from 'node:fs/promises';
const base = new URL('../src/content/pages/',import.meta.url);
for (const name of (await readdir(base)).filter(x=>x.endsWith('.mdx')).sort()) {
  const frontmatter = (await readFile(new URL(name,base),'utf8')).split('---')[1] || '';
  if (/^status:\s*draft\s*$/m.test(frontmatter)) console.log(name);
}
