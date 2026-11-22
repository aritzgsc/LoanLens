import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

if (existsSync('.env')) loadEnvFile('.env');
const maxAgeDays = 120;
const today = new Date().toISOString().slice(0,10);
function primary(source:unknown) {
  if (typeof source !== 'string') return false;
  try {
    const url = new URL(source);
    return url.protocol === 'https:' && ['.gov','.house.gov'].some(suffix=>url.hostname.endsWith(suffix));
  } catch { return false; }
}
const warnings:string[] = [];
const directory = new URL('../src/data/',import.meta.url);
for (const file of readdirSync(directory).filter(name=>name.endsWith('.json'))) {
  const rules = JSON.parse(readFileSync(new URL(file,directory),'utf8'));
  for (const [key, entry] of Object.entries(rules)) {
    if (!entry || typeof entry !== 'object') { warnings.push(file+': '+key+' has no metadata'); continue; }
    const row=entry as Record<string,unknown>;
    const age = (Date.parse(today)-Date.parse(String(row.retrieved)))/86400000;
    if (!primary(row.source)) warnings.push(file+': '+key+' has no primary source URL');
    if (row.status !== 'VERIFIED' || row.value === null || row.value === undefined) warnings.push(file+': '+key+' is UNVERIFIED');
    if (!Number.isFinite(Date.parse(String(row.effective)))) warnings.push(file+': '+key+' has no effective date');
    if (!Number.isFinite(age) || age > maxAgeDays || age < 0) warnings.push(file+': '+key+' has an invalid or stale retrieval date');
  }
}
warnings.forEach(message=>console.warn(message));
console.log(warnings.length ? `${warnings.length} source warnings.` : 'Rule metadata passed verification.');
if (warnings.length && process.env.STRICT_DATA === 'true') process.exitCode=1;
