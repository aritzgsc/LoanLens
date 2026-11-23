#!/usr/bin/env node
/**
 * Inspect the public production domain after Vercel has deployed the intended
 * commit. This cannot tell whether Google has indexed or ranked the site:
 * consult Search Console's URL Inspection report for that.
 */
const origin=(process.argv[2]??'https://myloanlens.vercel.app').replace(/\/$/,'');
const expected='https://myloanlens.vercel.app';
const pages=['/','/tools/','/guides/','/calculator/','/about/','/contact/','/guides/faq/'];
const failures=[];
const results=[];
const expectedSha=process.env.EXPECTED_DEPLOY_SHA?.trim();
if(origin!==expected) {
  console.error('Expected the canonical public origin: '+expected);
  process.exit(2);
}
async function load(path) {
  const url=origin+path;
  try {
    const response=await fetch(url,{
      redirect:'follow',
      headers:{'User-Agent':'LoanLens-Site-Healthcheck/1.0'},
      signal:AbortSignal.timeout(15000)
    });
    const body=await response.text();
    if(response.status!==200) failures.push(path+': HTTP '+response.status);
    if(response.url!==url) failures.push(path+': unexpected redirect to '+response.url);
    const robotHeader=response.headers.get('x-robots-tag')??'';
    if(/\bnoindex\b/i.test(robotHeader)) failures.push(path+': X-Robots-Tag prevents indexing');
    return {body,response,robotHeader};
  } catch(error) {
    failures.push(path+': '+String(error));
    return null;
  }
}
for(const path of pages) {
  const data=await load(path);
  if(!data)continue;
  const {body,response}=data;
  const meta=body.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1]??'';
  const canonical=body.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1]??'';
  const title=body.match(/<title>([^<]+)<\/title>/i)?.[1]??'';
  const description=body.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]??'';
  if(!/\bindex\b/.test(meta)||/\bnoindex\b/.test(meta)) failures.push(path+': robots meta is not indexable ('+meta+')');
  if(canonical!==origin+path)failures.push(path+': canonical mismatch ('+canonical+')');
  if(!title||!description)failures.push(path+': missing title or meta description');
  if(!/^text\/html\b/i.test(response.headers.get('content-type')??''))failures.push(path+': not served as HTML');
  if((body.match(/<h1(?=\s|>)/gi)||[]).length!==1)failures.push(path+': expected one H1');
  results.push({path,status:response.status,canonical,robots:meta,title});
}
const version=await load('/version.json');
if(version) {
  try {
    const data=JSON.parse(version.body);
    if(!/^[a-f0-9]{40}$/.test(data.sha))failures.push('version.json: missing deployment SHA');
    if(expectedSha && data.sha!==expectedSha)failures.push('Deployed SHA '+data.sha+' does not match expected '+expectedSha);
    console.log('Production release SHA: '+data.sha);
  }catch{ failures.push('version.json: not valid JSON'); }
}
const redirects=[
 ['/rap-calculator/','/calculator/'],
 ['/compare/','/calculator/'],
 ['/pslf-tracker/','/tools/pslf-payment-tracker/'],
 ['/guides/what-if-i-do-nothing/','/guides/save-ended-what-now/'],
];
for(const [from,to] of redirects){
  try{
    const response=await fetch(origin+from,{redirect:'manual',signal:AbortSignal.timeout(15000)});
    const location=response.headers.get('location')??'';
    if(response.status!==301 || new URL(location,origin).pathname!==to)
      failures.push(from+': expected 301 to '+to+', got '+response.status+' → '+location);
  } catch(error){failures.push(from+': '+String(error));}
}
const robots=await load('/robots.txt');
if(robots) {
  if(!/\bAllow:\s*\//i.test(robots.body)||/\bDisallow:\s*\//i.test(robots.body)) failures.push('robots.txt: site-wide blocking or missing Allow');
  if(!robots.body.includes('Sitemap: '+origin+'/sitemap-index.xml'))failures.push('robots.txt: canonical sitemap link missing');
}
const sitemap=await load('/sitemap-index.xml');
if(sitemap){
  const childPaths=[...sitemap.body.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
  if(childPaths.length===0)failures.push('sitemap-index.xml: no child sitemaps');
  const indexed=new Set();
  for(const loc of childPaths){
    if(!loc.startsWith(origin+'/')){failures.push('sitemap index points to another origin: '+loc);continue;}
    const child=await load(new URL(loc).pathname);
    if(child)for(const match of child.body.matchAll(/<loc>(.*?)<\/loc>/g))indexed.add(match[1]);
  }
  for(const path of pages){
    if(!indexed.has(origin+path))failures.push('Sitemap missing published page '+path);
  }
  const checked=new Set(results.map(row=>row.path));
  for(const loc of [...indexed].sort()) {
    if(!loc.startsWith(origin+'/')) {failures.push('Sitemap page points to another origin: '+loc);continue;}
    const path=new URL(loc).pathname;
    if(checked.has(path))continue;
    const data=await load(path);
    if(!data)continue;
    const html=data.body;
    const canonical=html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1]??'';
    const robotsMeta=html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1]??'';
    const title=html.match(/<title>([^<]+)<\/title>/i)?.[1]??'';
    const description=html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]??'';
    if(canonical!==loc)failures.push(path+': canonical mismatch ('+canonical+')');
    if(!/\bindex\b/i.test(robotsMeta)||/\bnoindex\b/i.test(robotsMeta))failures.push(path+': indexability blocked');
    if(!title||!description)failures.push(path+': title or description missing');
    if((html.match(/<h1(?=\s|>)/gi)||[]).length!==1)failures.push(path+': expected one H1');
    if(!html.includes('application/ld+json'))failures.push(path+': missing JSON-LD');
    results.push({path,status:data.response.status,canonical,robots:robotsMeta,title});
    checked.add(path);
  }
}
const seenTitles=new Set();
for(const row of results) {
  if(seenTitles.has(row.title))failures.push(row.path+': duplicate public HTML title '+row.title);
  seenTitles.add(row.title);
}
console.log('LoanLens public SEO healthcheck: '+results.length+' HTML routes tested');
for(const result of results)console.log(result.status+' '+result.path+' | '+result.robots);
if(failures.length) {
  console.error('\n'+failures.length+' SEO deployment problem(s):\n- '+failures.join('\n- '));
  process.exitCode=1;
} else {
  console.log('\nPASS: checked public HTTP, robots, canonicals, sitemap, metadata and crawlability hints.');
  console.log('IMPORTANT: this does NOT prove Google has indexed the pages. Inspect URLs inside Search Console.');
}
