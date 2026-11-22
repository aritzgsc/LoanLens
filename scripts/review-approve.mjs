import { readdir, readFile, writeFile } from 'node:fs/promises';

const [slug, ...flags] = process.argv.slice(2);
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || flags.length > 1 || flags.some(flag => flag !== '--yes')) {
  console.error('Usage: npm run review:approve -- <slug|all> [--yes]');
  process.exit(1);
}

const directory = new URL('../src/content/pages/', import.meta.url);
const filenames = (await readdir(directory)).filter(name => name.endsWith('.mdx')).sort();
const selected = slug === 'all' ? filenames : filenames.filter(name => name === slug + '.mdx');
if (!selected.length) {
  console.error('No matching editorial page: ' + slug);
  process.exit(1);
}

const date = new Date().toISOString().slice(0, 10);
const pending = [];
for (const name of selected) {
  const file = new URL(name, directory);
  const original = await readFile(file, 'utf8');
  const header = /^---\r?\n([\s\S]*?)\r?\n---(?=\r?\n|$)/.exec(original);
  const status = header?.[1].match(/^status:[ \t]*["']?(draft|reviewed)["']?[ \t]*$/m)?.[1];
  if (!status) {
    console.error('Missing or invalid frontmatter status: ' + name);
    process.exit(1);
  }
  if (status === 'reviewed') {
    console.log(name + ' is already reviewed.');
    continue;
  }
  console.log(name + '\n  [ ] Verify factual claims and src/data references.\n  [ ] Fill real author and contact information.\n  [ ] Check internal and primary source links.');
  const newline = header[0].includes('\r\n') ? '\r\n' : '\n';
  const fields = header[1].split(/\r?\n/).filter(line => !/^reviewed:/.test(line));
  const statusIndex = fields.findIndex(line => /^status:/.test(line));
  fields.splice(statusIndex, 1, 'status: "reviewed"', 'reviewed: "' + date + '"');
  pending.push({ file, content: ['---', ...fields, '---'].join(newline) + original.slice(header[0].length) });
}

if (pending.length && !flags.includes('--yes')) {
  console.log('See docs/REVIEW_PACKET.md. After completing every item above, repeat with --yes.');
  process.exit(1);
}
for (const { file, content } of pending) await writeFile(file, content);
console.log('Approved ' + pending.length + ' page(s).');
