import {writeFile} from 'node:fs/promises';
const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA ||
  process.env.LOANLENS_SOURCE_SHA || 'unknown';
const source = process.env.VERCEL_GIT_COMMIT_SHA ? 'vercel' :
  process.env.GITHUB_SHA ? 'github-actions' : 'local';
await writeFile('dist/version.json',JSON.stringify({sha,source})+'\n');
console.log('Build source version: '+sha+' ('+source+')');
